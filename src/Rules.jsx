import React from "react"
import './flags.css'
import './scroll.css'
import { useT } from './i18n'

export default function Rules() {
  const { t } = useT()

  return (
    <div className="homePage">
      <div style={{ width: "100%", overflow: "hidden" }}>
        <div id="regulamento" className="regulamento">
          <div style={{ fontFamily: "Open Sans", fontSize: "20px", textAlign: "left", marginBottom: "100px" }}>
            <h3 style={{ fontFamily: 'Roboto Condensed' }}>{t('rules.title')}</h3>
            <p>{t('rules.distributionIntro')}</p>
            <ul>
              <li><strong>{t('rules.first')}</strong> 70%</li>
              <li><strong>{t('rules.second')}</strong> 25%</li>
              <li><strong>{t('rules.third')}</strong> 5%</li>
            </ul>
            <p>{t('rules.tieIntro')}</p>
            <p>{t('rules.scoringIntro')}</p>
            <ul>
              <li>{t('rules.score8')} <strong>{t('rules.score8Pts')}</strong></li>
              <li>{t('rules.score5')} <strong>{t('rules.score5Pts')}</strong></li>
              <li>{t('rules.score3')} <strong>{t('rules.score3Pts')}</strong></li>
              <li>{t('rules.score0')} <strong>{t('rules.score0Pts')}</strong></li>
            </ul>
            <p style={{ fontSize: "12px" }}>{t('rules.disclaimer')}</p>
            <p><strong>{t('rules.payoutLabel')}</strong>{t('rules.payoutBody')}</p>
            <p><strong>{t('rules.subsLabel')}</strong>{t('rules.subsBody')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
