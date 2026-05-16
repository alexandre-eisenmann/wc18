import React from 'react'
import './ClassicYamBanner.css'
import { useT } from './i18n'

const CAMPAIGN_URL = 'https://classicyam.web.app/?utm_source=bolao&utm_medium=banner&utm_campaign=copa2026'

function Die({ className, pips }) {
  return (
    <svg className={`classic-yam-die ${className}`} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="100" height="100" rx="18" ry="18" fill="#f8f8f8" />
      {pips.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="10" fill="#2a2a2a" />
      ))}
    </svg>
  )
}

export default function ClassicYamBanner() {
  const { t } = useT()

  return (
    <section className="classic-yam-promo" aria-label={t('classicYam.ariaLabel')}>
      <a className="classic-yam-banner" href={CAMPAIGN_URL} target="_blank" rel="noopener noreferrer">
        <Die className="classic-yam-d1" pips={[[50, 50]]} />
        <Die className="classic-yam-d2" pips={[[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]} />
        <Die className="classic-yam-d3" pips={[[25, 25], [50, 50], [75, 75]]} />
        <Die className="classic-yam-d4" pips={[[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]} />
        <Die className="classic-yam-d5" pips={[[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]} />

        <span className="classic-yam-content">
          <span className="classic-yam-badge">{t('classicYam.badge')}</span>
          <span className="classic-yam-title">Classic Yam</span>
          <span className="classic-yam-tagline">{t('classicYam.taglineLine1')}<br />{t('classicYam.taglineLine2')}</span>
        </span>
        <span className="classic-yam-arrow" aria-hidden="true">›</span>
      </a>
    </section>
  )
}
