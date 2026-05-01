import React, { useEffect, useState } from "react"
import './flags.css'
import './scroll.css'
import { useT } from './i18n'
import { PRICE_PER_BID } from './constants'

// Used only while the live FX rate is being fetched, or if the API is unreachable.
// We always label the converted amount as an estimate so a slightly stale rate is fine.
const FALLBACK_BRL_TO_USD = 0.18

const ACCENT = '#1e88e5' // matches NavBar (blue[600]) and WC2026 home accent
const TEXT = '#2c3e50'
const MUTED = '#6b7280'
const BORDER = '#e5e7eb'
const SURFACE = '#ffffff'

const titleFont = 'Roboto Condensed, sans-serif'
const bodyFont = 'Open Sans, sans-serif'

// Prize distribution and scoring use a small visual scale so the page reads at a glance.
const PRIZES = [
  { key: 'first', pct: 70, height: 88 },
  { key: 'second', pct: 25, height: 64 },
  { key: 'third', pct: 5, height: 44 },
]

const SCORES = [
  { pts: 8, descKey: 'rules.score8', color: '#2e7d32', bg: '#e8f5e9' },
  { pts: 5, descKey: 'rules.score5', color: '#1565c0', bg: '#e3f2fd' },
  { pts: 3, descKey: 'rules.score3', color: '#ef6c00', bg: '#fff3e0' },
  { pts: 0, descKey: 'rules.score0', color: '#757575', bg: '#f5f5f5' },
]

function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: titleFont,
      fontSize: '12px',
      fontWeight: 'bold',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      color: ACCENT,
      marginBottom: '10px',
    }}>
      {children}
    </div>
  )
}

export default function Rules() {
  const { t, language } = useT()
  const moneyLocale = language === 'en' ? 'en-US' : 'pt-BR'
  const priceFormatted = PRICE_PER_BID.toLocaleString(moneyLocale, { style: 'currency', currency: 'BRL' })
  const convertUrl = `https://www.google.com/search?q=${PRICE_PER_BID}+brl+to+usd`

  const [brlToUsd, setBrlToUsd] = useState(FALLBACK_BRL_TO_USD)

  useEffect(() => {
    if (language !== 'en') return undefined
    let cancelled = false
    fetch('https://api.frankfurter.app/latest?from=BRL&to=USD')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        const rate = data && data.rates && data.rates.USD
        if (typeof rate === 'number' && rate > 0) {
          setBrlToUsd(rate)
        }
      })
      .catch(() => {
        // Network/CORS failure — silently keep the fallback rate; label still says "estimate".
      })
    return () => {
      cancelled = true
    }
  }, [language])

  const usdFormatted = (PRICE_PER_BID * brlToUsd).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  return (
    <div className="homePage" style={{ background: '#fafafa', textAlign: 'left' }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '40px 20px 80px',
        fontFamily: bodyFont,
        color: TEXT,
      }}>
        {/* Page header */}
        <header style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            fontFamily: titleFont,
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: ACCENT,
            marginBottom: '6px',
          }}>
            {t('app.brand')}
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: titleFont,
            fontSize: 'clamp(34px, 7vw, 44px)',
            fontWeight: 'bold',
            color: TEXT,
            lineHeight: 1.1,
          }}>
            {t('rules.title')}
          </h1>
          <div style={{
            margin: '14px auto 0',
            width: '40px',
            height: '3px',
            background: ACCENT,
            borderRadius: '2px',
          }} />
        </header>

        {/* Price card */}
        <section style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}>
          <div>
            <div style={{
              fontFamily: titleFont,
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: MUTED,
              marginBottom: '4px',
            }}>
              {t('rules.priceLabel').replace(':', '')}
            </div>
            {language === 'en' && (
              <a
                href={convertUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Verify the live rate on Google"
                style={{ fontSize: '13px', color: MUTED, textDecoration: 'none' }}
              >
                ≈ {usdFormatted} <span style={{ textDecoration: 'underline' }}>({t('rules.priceEstimateNote')})</span>
              </a>
            )}
          </div>
          <div style={{
            fontFamily: titleFont,
            fontSize: '34px',
            fontWeight: 'bold',
            color: ACCENT,
            lineHeight: 1,
          }}>
            {priceFormatted}
          </div>
        </section>

        {/* Prize distribution */}
        <section style={{ marginBottom: '32px' }}>
          <SectionTitle>{t('rules.distributionIntro').replace(/[:.]$/, '')}</SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '12px',
            marginBottom: '16px',
          }}>
            {PRIZES.map(({ key, pct, height }) => (
              <div
                key={key}
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '12px',
                  padding: '16px 8px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  minHeight: '140px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  fontFamily: titleFont,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: MUTED,
                  marginBottom: '6px',
                }}>
                  {t(`rules.${key}`).replace(':', '')}
                </div>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '64px',
                    height: `${height}px`,
                    background: `linear-gradient(180deg, ${ACCENT} 0%, #4ba3eb 100%)`,
                    borderRadius: '6px 6px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: titleFont,
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  {pct}%
                </div>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: MUTED,
            margin: '12px 0 0',
            padding: '12px 16px',
            borderLeft: `3px solid ${BORDER}`,
            background: '#fafafa',
            borderRadius: '0 6px 6px 0',
          }}>
            {t('rules.tieIntro')}
          </p>
        </section>

        {/* Scoring */}
        <section style={{ marginBottom: '32px' }}>
          <SectionTitle>{t('rules.scoringIntro').replace(':', '')}</SectionTitle>
          <div style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: '12px',
            overflow: 'hidden',
            marginTop: '12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}>
            {SCORES.map(({ pts, descKey, color, bg }, i) => (
              <div
                key={pts}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderTop: i === 0 ? 'none' : `1px solid ${BORDER}`,
                }}
              >
                <div style={{
                  flex: '0 0 auto',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: bg,
                  color: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: titleFont,
                  fontWeight: 'bold',
                  fontSize: '18px',
                }}>
                  {pts}
                </div>
                <div style={{ fontSize: '15px', lineHeight: 1.4, color: TEXT }}>
                  {t(descKey).replace(/:$/, '')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fine print */}
        <section style={{ display: 'grid', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: MUTED, lineHeight: 1.5 }}>
            {t('rules.disclaimer')}
          </div>
          <InfoRow label={t('rules.payoutLabel')} body={t('rules.payoutBody')} />
          <InfoRow label={t('rules.subsLabel')} body={t('rules.subsBody')} />
        </section>
      </div>
    </div>
  )
}

function InfoRow({ label, body }) {
  return (
    <div style={{
      background: SURFACE,
      border: `1px solid ${BORDER}`,
      borderRadius: '10px',
      padding: '14px 16px',
      fontSize: '14px',
      lineHeight: 1.55,
      color: TEXT,
    }}>
      <span style={{
        fontFamily: titleFont,
        fontWeight: 'bold',
        color: ACCENT,
        marginRight: '4px',
      }}>
        {label.replace(/:$/, '')}:
      </span>
      <span style={{ color: TEXT }}>{body.replace(/^\s+/, ' ').trim()}</span>
    </div>
  )
}
