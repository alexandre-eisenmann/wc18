import React, { useState, useEffect, useLayoutEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { CircularProgress, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'
import 'firebase/compat/functions'
import { DATABASE_ROOT_NODE } from './constants'

// Set in .env: VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (use pk_live_... in production).
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

// ─── CheckoutForm ─────────────────────────────────────────────────────────────
// Rendered inside <Elements> after a PaymentIntent has been created.
function CheckoutForm({ onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [status, setStatus] = useState('idle') // idle | processing | error | done

  // Tear down the Payment Element so Stripe does not leave iframes / the corner badge in the DOM
  // after navigating away (SPAs often hit this; see element.destroy in Stripe.js docs).
  useLayoutEffect(() => {
    return () => {
      const paymentEl = elements?.getElement?.("payment")
      if (paymentEl) {
        try {
          paymentEl.destroy()
        } catch {
          // already destroyed or race with Elements unmount
        }
      }
    }
  }, [elements])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setStatus('processing')
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      setStatus('error')
      console.error(error.message)
    } else {
      setStatus('done')
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'pix'],
        }}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!stripe || status === 'processing'}
        style={{ marginTop: 24, width: '100%' }}
      >
        {status === 'processing' ? 'Processando...' : 'Pagar'}
      </Button>
      {status === 'error' && (
        <div style={{ color: 'red', marginTop: 12, fontSize: 14 }}>
          Erro no pagamento. Tente novamente.
        </div>
      )}
    </form>
  )
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export default function Payment() {
  const [logged, setLogged] = useState(null)
  const [user, setUser] = useState(null)
  const [bids, setBids] = useState([])
  const [clientSecret, setClientSecret] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const PRICE_PER_BID = 30.00

  useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged((u) => {
      if (u) {
        setLogged(true)
        setUser(u)
        firebase.database().ref(`${DATABASE_ROOT_NODE}/${u.uid}`).once('value', snapshot => {
          const readyBids = []
          snapshot.forEach(child => {
            const d = child.val()
            if (d.status === 'readytopay') {
              readyBids.push({ gameId: child.key, name: d.name })
            }
          })
          setBids(readyBids)
        })
      } else {
        setLogged(false)
      }
    })
    return unsub
  }, [])

  // Best-effort: remove Stripe’s hidden controller iframes that sometimes stay in <body> after the form unmounts
  // (stops the small “stripe” control looking like it is stuck on other routes).
  useLayoutEffect(() => {
    return () => {
      document
        .querySelectorAll("iframe[name^='__privateStripe']")
        .forEach((node) => {
          try {
            node.remove()
          } catch {
            // ignore
          }
        })
    }
  }, [])

  const handlePay = async () => {
    setLoading(true)
    try {
      const createPaymentIntent = firebase.functions().httpsCallable('createPaymentIntent')
      const result = await createPaymentIntent({
        userId: user.uid,
        gameIds: bids.map(b => b.gameId),
      })
      setClientSecret(result.data.clientSecret)
    } catch (err) {
      console.error('Failed to create payment intent:', err)
    }
    setLoading(false)
  }

  if (logged === null) return <div style={{ textAlign: 'center', marginTop: '20%' }}><CircularProgress size={60} thickness={7} /></div>
  if (logged === false) return <Navigate to='/login?fw=payment' replace />
  if (!publishableKey) return (
    <div style={{ padding: 32, maxWidth: 480, margin: 'auto' }}>
      <div style={{ fontSize: 18, marginBottom: 12 }}>Chave do Stripe ausente</div>
      <div style={{ color: '#777', lineHeight: 1.5 }}>
        Defina <code style={{ background: '#eee', padding: '2px 6px' }}>VITE_STRIPE_PUBLISHABLE_KEY</code> no arquivo{' '}
        <code style={{ background: '#eee', padding: '2px 6px' }}>.env</code> na raiz do projeto (veja <code style={{ background: '#eee', padding: '2px 6px' }}>.env.example</code>).
        Em produção, use a chave publicável <code>pk_live_</code> correspondente.
      </div>
    </div>
  )
  if (done) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 16 }}>Pagamento confirmado!</div>
      <div style={{ color: '#777', marginBottom: 24 }}>Seus palpites estão ativos. Boa sorte!</div>
      <Button variant="outlined" href="/ranking">Ver Ranking</Button>
    </div>
  )

  const total = bids.length * PRICE_PER_BID

  return (
    <div style={{ padding: 32, maxWidth: 480, margin: 'auto' }}>
      <div style={{ fontSize: 24, fontFamily: 'Roboto Condensed', marginBottom: 24 }}>Pagamento</div>

      {bids.length === 0 && (
        <div>
          <div style={{ color: '#777', marginBottom: 24 }}>
            Nenhum palpite aguardando pagamento. Complete e adicione seu jogo ao carrinho primeiro.
          </div>
          <Button variant="outlined" href="/bids">Voltar para Jogos</Button>
        </div>
      )}

      {bids.length > 0 && !clientSecret && (
        <>
          <Paper variant="outlined" style={{ marginBottom: 24 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bids.map(b => (
                  <TableRow key={b.gameId}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell align="right">
                      {PRICE_PER_BID.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell style={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell align="right" style={{ fontWeight: 'bold' }}>
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>

          <Button
            variant="contained"
            fullWidth
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} /> : 'Ir para pagamento'}
          </Button>
        </>
      )}

      {clientSecret && stripePromise && (
        <Elements
          key={clientSecret}
          stripe={stripePromise}
          options={{
            clientSecret,
            locale: 'pt-BR',
          }}
        >
          <CheckoutForm onSuccess={() => setDone(true)} />
        </Elements>
      )}
    </div>
  )
}
