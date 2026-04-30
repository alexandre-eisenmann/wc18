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

  // automatic_payment_methods lets Stripe surface every method enabled in the
  // Dashboard (Settings → Payment methods) at confirmation time. That means:
  //   - card works today
  //   - Apple Pay / Google Pay ride on top of card and appear as wallet buttons
  //     in the Payment Element on supported devices (Apple Pay also needs the
  //     domain verified in the Dashboard — see public/.well-known/README.md)
  //   - Pix lights up automatically once Stripe approves it; no code change needed
  let paymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "brl",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId,
        gameIds: JSON.stringify(gameIds),
        dbNode: DATABASE_ROOT_NODE,
      },
    })
  } catch (err) {
    console.error("Stripe paymentIntents.create failed:", err)
    throw new functions.https.HttpsError(
      "internal",
      "Could not start payment. Try again or contact support."
    )
  }

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
    const { userId, gameIds, dbNode } = intent.metadata || {}

    // Real checkouts from this app set userId, gameIds (JSON array), dbNode in metadata.
    // CLI triggers and other ad-hoc payments will not; acknowledge (200) so Stripe does not retry.
    if (!userId || !dbNode || !gameIds) {
      console.log(
        `Payment ${intent.id} — no bolão metadata, skipping database update (test or out-of-app payment).`
      )
      return res.json({ received: true, skipped: true, reason: "no_app_metadata" })
    }

    let parsedGameIds
    try {
      parsedGameIds = JSON.parse(gameIds)
    } catch {
      console.error("Failed to parse gameIds from metadata for payment", intent.id)
      return res.json({ received: true, skipped: true, reason: "invalid_gameids_json" })
    }

    if (!Array.isArray(parsedGameIds) || parsedGameIds.length === 0) {
      return res.json({ received: true, skipped: true, reason: "empty_gameids" })
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
