const functions = require("firebase-functions")
const admin = require("firebase-admin")
const Stripe = require("stripe")

admin.initializeApp()

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Replace these with real keys once received from the Stripe account owner.
// Set via: firebase functions:config:set stripe.secret_key="sk_test_..." stripe.webhook_secret="whsec_..."
// Then access here as functions.config().stripe.secret_key
//
// For local development, hardcode test keys temporarily:
const STRIPE_SECRET_KEY = functions.config().stripe?.secret_key || "sk_test_REPLACE_ME"
const STRIPE_WEBHOOK_SECRET = functions.config().stripe?.webhook_secret || "whsec_REPLACE_ME"
const DATABASE_ROOT_NODE = "wc26"

// Price per bid in centavos (BRL). R$30,00 = 3000 centavos.
// Change this one constant when the price is decided.
const PRICE_PER_BID_CENTAVOS = 3000

const stripe = Stripe(STRIPE_SECRET_KEY)

// ─── createPaymentIntent ──────────────────────────────────────────────────────
// Called by the frontend when the user clicks Pay.
// Receives: { userId, gameIds: ["gameId1", "gameId2", ...] }
// Returns:  { clientSecret, paymentIntentId }
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required")
  }

  const { userId, gameIds } = data
  if (!userId || !gameIds || gameIds.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "userId and gameIds required")
  }

  const amount = gameIds.length * PRICE_PER_BID_CENTAVOS

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "brl",
    payment_method_types: ["card", "pix"],
    metadata: {
      userId,
      gameIds: JSON.stringify(gameIds),
      dbNode: DATABASE_ROOT_NODE,
    },
  })

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  }
})

// ─── stripeWebhook ────────────────────────────────────────────────────────────
// Stripe calls this URL when a payment succeeds.
// Set this URL in Stripe Dashboard → Developers → Webhooks.
// Event to listen for: payment_intent.succeeded
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object
    const { userId, gameIds, dbNode } = intent.metadata

    let parsedGameIds
    try {
      parsedGameIds = JSON.parse(gameIds)
    } catch {
      console.error("Failed to parse gameIds from metadata")
      return res.status(400).send("Bad metadata")
    }

    const db = admin.database()
    const updates = {}
    parsedGameIds.forEach((gameId) => {
      updates[`${dbNode}/${userId}/${gameId}/status`] = "payed"
      updates[`${dbNode}/${userId}/${gameId}/transactionId`] = intent.id
    })

    await db.ref().update(updates)
    console.log(`Payment ${intent.id} confirmed — marked ${parsedGameIds.length} bid(s) as payed for user ${userId}`)
  }

  res.json({ received: true })
})
