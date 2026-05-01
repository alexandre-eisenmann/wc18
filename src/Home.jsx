import React, { useState } from 'react'
import { NavLink } from "react-router-dom"

import dayjs from 'dayjs'
import './flags.css'
import './scroll.css'
import Viz from './Viz'
import data26 from './data26.json'
import data22 from './data.json'
import data18 from './data2018.json'
import { DATABASE_WC18, DATABASE_WC22, DATABASE_WC26 } from './constants'
import { useT, LanguageSwitcher } from './i18n'

const today = dayjs()
const startDate = dayjs('2026-06-11')
const isWc26VizLocked = today.isBefore(startDate)

const hostFlags = ['f-us', 'f-ca', 'f-mx']

const YEARS = {
  '2026': { data: data26, dbNode: DATABASE_WC26, name: 'Copa USA/Canadá/México 2026', flags: ['f-us', 'f-ca', 'f-mx'], accent: '#2196f3' },
  '2022': { data: data22, dbNode: DATABASE_WC22, name: 'Copa do Catar 2022', flags: ['f-qa'], accent: '#8a1538' },
  '2018': { data: data18, dbNode: DATABASE_WC18, name: 'Copa da Rússia 2018', flags: ['f-ru'], accent: '#d52b1e' },
}


export default function Home() {
  const [selectedYear, setSelectedYear] = useState(isWc26VizLocked ? '2022' : '2026')
  const { t } = useT()

  return (
    <div className="homePage">
      <div style={{
        position: "absolute",
        zIndex: "3",
        left: "30px",
        right: "14px",
        fontFamily: "Lato",
        fontWeight: "bold",
        top: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
      }}>
        <span>
          <NavLink style={{ textDecoration: "none", color: "rgba(220,220,220,0.8)" }} to="/bids">{t('nav.bids')}</NavLink>
          <NavLink style={{ textDecoration: "none", marginLeft: "20px", color: "rgba(220,220,220,0.8)" }} to="/leaderboard">{t('nav.leaderboard')}</NavLink>
          <NavLink style={{ textDecoration: "none", marginLeft: "20px", color: "rgba(220,220,220,0.8)" }} to="/ranking">{t('nav.ranking')}</NavLink>
        </span>
        <LanguageSwitcher color="rgba(255,255,255,0.85)" separatorColor="rgba(255,255,255,0.45)" activeColor="white" />
      </div>

      <section style={{
        minHeight: "460px",
        color: "white",
        overflow: "hidden",
        position: "relative",
        backgroundImage: "radial-gradient(circle at 85% 18%, rgba(255,255,255,0.28) 0, rgba(255,255,255,0) 28%), linear-gradient(135deg, #d95b0b 0%, #f57c00 45%, #ffb449 100%)",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage: "url(background.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }} />
        <div style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          minHeight: "460px",
          padding: "46px 20px 12px",
          boxSizing: "border-box",
        }}>
          <div style={{ marginTop: "auto", marginBottom: "auto" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "18px" }}>
              {hostFlags.map((flag, i) => (
                <div
                  key={flag}
                  className={flag}
                  style={{
                    width: "clamp(58px, 13vw, 82px)",
                    height: "clamp(44px, 10vw, 62px)",
                    marginLeft: i === 0 ? 0 : "clamp(14px, 4vw, 22px)",
                    border: "1px solid rgba(255,255,255,0.45)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              ))}
            </div>
            <div style={{ fontFamily: "Roboto Condensed", fontSize: "clamp(13px, 3.6vw, 16px)", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.82)", marginBottom: "7px" }}>
              {t('home.hostingTitle')}
            </div>
            <div style={{ fontFamily: "Roboto Condensed", fontSize: "clamp(22px, 6vw, 26px)", fontWeight: "bold", letterSpacing: "2px", color: "white", background: "rgba(255,255,255,0.14)", padding: "1px 12px", marginBottom: "10px", display: "inline-block" }}>
              2026
            </div>
            <h1 style={{ margin: 0, fontFamily: "Roboto Condensed", fontSize: "clamp(38px, 11vw, 56px)", lineHeight: "1", fontWeight: "bold", whiteSpace: "nowrap", textShadow: "0 3px 18px rgba(0,0,0,0.16)" }}>
              {t('app.brand')}
            </h1>
            <div style={{ marginTop: "16px", maxWidth: "440px", fontFamily: "Open Sans", fontSize: "clamp(15px, 4.3vw, 18px)", lineHeight: "1.42", color: "rgba(255,255,255,0.92)" }}>
              {t('home.heroIntro')}
              <a style={{ color: "white", fontWeight: "bold" }} href="/rules">{t('home.heroRulesLink')}</a>{t('home.heroIntroEnd')}
            </div>
          </div>
          <div style={{ width: "100%", textAlign: "center", paddingTop: "8px", paddingBottom: "4px" }}>
            <NavLink to="/bids" className="play-button">
              {t('home.playButton')}
            </NavLink>
            <div style={{
              marginTop: "16px",
              fontFamily: "Roboto Condensed",
              fontSize: "12px",
              letterSpacing: "2px",
              color: "rgba(255,255,255,0.78)",
              textTransform: "uppercase",
            }}>
              {t('home.daysUntilSimple', { count: startDate.diff(today, 'day') })}
            </div>
          </div>
        </div>
      </section>

      <div style={{ width: "100%", height: "170px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>
          <div style={{ fontWeight: "bold", color: "#2196f3", fontFamily: "Roboto Condensed", margin: "auto" }}>{t('home.scroll')}</div>
          <a href="#viz">
            <div className="arrow" style={{ margin: "auto", marginTop: "5px" }}></div>
          </a>
        </div>
      </div>

      <div style={{ width: "100%", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "28px" }}>
          {['2018', '2022', '2026'].map(year => {
            const isLocked = year === '2026' && isWc26VizLocked
            const isSelected = selectedYear === year

            return (
            <button
              key={year}
              type="button"
              onClick={() => {
                if (!isLocked) setSelectedYear(year)
              }}
              disabled={isLocked}
              style={{
                fontFamily: "Roboto Condensed",
                fontSize: "14px",
                fontWeight: "bold",
                color: isSelected ? "#2196f3" : isLocked ? "#d0d0d0" : "#bbb",
                cursor: isLocked ? "default" : "pointer",
                border: "0",
                borderBottom: isSelected ? "2px solid #2196f3" : "2px solid transparent",
                background: "transparent",
                padding: "0 0 2px",
                opacity: 1,
              }}
            >
              {isLocked ? t('home.comingSoon', { year }) : t(`home.yearLabel.${year}`)}
            </button>
          )})}
        </div>
        <Viz
          key={selectedYear}
          tournamentData={YEARS[selectedYear].data}
          dbNode={YEARS[selectedYear].dbNode}
          tournamentName={YEARS[selectedYear].name}
          tournamentFlags={YEARS[selectedYear].flags}
          tournamentAccent={YEARS[selectedYear].accent}
        />
      </div>
    </div>
  )
}
