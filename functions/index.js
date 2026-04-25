const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env") })

const functions = require("firebase-functions")
const admin = require("firebase-admin")
const Stripe = require("stripe")

admin.initializeApp()

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Local: create functions/.env (see functions/.env.example) with STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
// Production: set env in the Cloud Functions runtime (preferred) or legacy:
//   firebase functions:config:set stripe.secret_key="sk_live_..." stripe.webhook_secret="whsec_..."
//   (then deploy)
const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret_key
const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || functions.config().stripe?.webhook_secret
const DATABASE_ROOT_NODE = "wc26"

// Price per bid in centavos (BRL). R$30,00 = 3000 centavos.
// Change this one constant when the price is decided.
const PRICE_PER_BID_CENTAVOS = 3000

if (!STRIPE_SECRET_KEY) {
  console.error(
    "Missing STRIPE_SECRET_KEY. Add functions/.env for local, or set stripe.secret_key for deploy."
  )
}
const stripe = STRIPE_SECRET_KEY ? Stripe(STRIPE_SECRET_KEY) : null

// ─── createPaymentIntent ──────────────────────────────────────────────────────
// Called by the frontend when the user clicks Pay.
// Receives: { userId, gameIds: ["gameId1", "gameId2", ...] }
// Returns:  { clientSecret, paymentIntentId }
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required")
  }
  if (!stripe) {
    throw new functions.https.HttpsError("failed-precondition", "Stripe is not configured")
  }

  const { userId, gameIds } = data
  if (!userId || !gameIds || gameIds.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "userId and gameIds required")
  }

  if (context.auth.uid !== userId) {
    throw new functions.https.HttpsError("permission-denied", "userId must match the signed-in user")
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
  if (!stripe) {
    console.error("Stripe webhook: missing STRIPE_SECRET_KEY")
    return res.status(500).send("Stripe not configured")
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook: set STRIPE_WEBHOOK_SECRET or functions config stripe.webhook_secret")
    return res.status(500).send("Webhook not configured")
  }
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
