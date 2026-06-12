import React, { useState } from 'react'
import { NavLink } from "react-router-dom"

import './flags.css'
import './scroll.css'
import Viz from './Viz'
import NextGameBidMap from './NextGameBidMap'
import ClassicYamBanner from './ClassicYamBanner'
import data22 from './data.json'
import data18 from './data2018.json'
import { DATABASE_WC18, DATABASE_WC22, areBidsClosed, HERO_NEXT_GAME_CAROUSEL } from './constants'
import { useT, LanguageSwitcher } from './i18n'

const hostFlags = ['f-us', 'f-ca', 'f-mx']

// Archive of past tournaments shown at the bottom of the page. The live 2026
// tournament lives in the hero carousel, so the archive only carries history.
const ARCHIVE_YEARS = {
  '2022': { data: data22, dbNode: DATABASE_WC22, name: 'Copa do Catar 2022', flags: ['f-qa'], accent: '#8a1538' },
  '2018': { data: data18, dbNode: DATABASE_WC18, name: 'Copa da Rússia 2018', flags: ['f-ru'], accent: '#d52b1e' },
}

export default function Home() {
  const [selectedYear, setSelectedYear] = useState('2022')
  const { t } = useT()
  const bidsClosed = areBidsClosed()

  const renderPlay = (compact) => !bidsClosed && (
    <NavLink to="/bids" className={compact ? "play-button compact" : "play-button"}>
      {t('home.playButton')}
    </NavLink>
  )

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
        </span>
        <LanguageSwitcher color="rgba(255,255,255,0.85)" separatorColor="rgba(255,255,255,0.45)" activeColor="white" />
      </div>

      <section style={{
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

        {HERO_NEXT_GAME_CAROUSEL ? (
          /* Tournament mode: compact header + upcoming-games carousel */
          <div style={{ position: "relative", zIndex: 1, boxSizing: "border-box", paddingBottom: "28px" }}>
            <div style={{ textAlign: "center", padding: "50px 20px 6px" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "10px" }}>
                {hostFlags.map((flag, i) => (
                  <div
                    key={flag}
                    className={flag}
                    style={{
                      width: "clamp(38px, 9vw, 52px)",
                      height: "clamp(28px, 7vw, 40px)",
                      marginLeft: i === 0 ? 0 : "clamp(10px, 3vw, 16px)",
                      border: "1px solid rgba(255,255,255,0.45)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                ))}
              </div>
              <div style={{ fontFamily: "Roboto Condensed", fontSize: "clamp(11px, 3vw, 13px)", fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.82)", marginBottom: "4px" }}>
                {t('home.hostingTitle')}
              </div>
              <h1 style={{ margin: 0, fontFamily: "Roboto Condensed", fontSize: "clamp(28px, 8vw, 42px)", lineHeight: "1", fontWeight: "bold", whiteSpace: "nowrap", textShadow: "0 3px 18px rgba(0,0,0,0.16)" }}>
                {t('app.brand')}
              </h1>
              <NavLink to="/rules" style={{ display: "inline-block", marginTop: "2px", fontFamily: "Open Sans", fontSize: "12px", lineHeight: "1.1", color: "rgba(255,255,255,0.9)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                {t('home.checkRules')}
              </NavLink>
            </div>

            <NextGameBidMap />

            {renderPlay(true) && (
              <div style={{ textAlign: "center", padding: "8px 20px 0" }}>
                {renderPlay(true)}
              </div>
            )}
          </div>
        ) : (
          /* Classic mode: full hero with intro paragraph */
          <div style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "460px",
            justifyContent: "center",
            padding: "56px 20px 28px",
            boxSizing: "border-box",
          }}>
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
            <div style={{ marginTop: "16px", maxWidth: "440px", textAlign: "center", fontFamily: "Open Sans", fontSize: "clamp(15px, 4.3vw, 18px)", lineHeight: "1.42", color: "rgba(255,255,255,0.92)" }}>
              {t('home.heroIntro')}
              <a style={{ color: "white", fontWeight: "bold" }} href="/rules">{t('home.heroRulesLink')}</a>{t('home.heroIntroEnd')}
            </div>
            {renderPlay(false) && <div style={{ marginTop: "24px" }}>{renderPlay(false)}</div>}
          </div>
        )}
      </section>

      <section className="home-insights-section">
        <ClassicYamBanner />

        <div style={{ width: "100%", overflow: "hidden" }}>
          <Viz
            key={selectedYear}
            compactHeader
            tournamentData={ARCHIVE_YEARS[selectedYear].data}
            dbNode={ARCHIVE_YEARS[selectedYear].dbNode}
            tournamentName={ARCHIVE_YEARS[selectedYear].name}
            tournamentFlags={ARCHIVE_YEARS[selectedYear].flags}
            tournamentAccent={ARCHIVE_YEARS[selectedYear].accent}
          >
            <div style={{ margin: "16px 0 0" }}>
              <div style={{ fontFamily: "Roboto Condensed", fontSize: "11px", fontWeight: "bold", letterSpacing: "1.6px", textTransform: "uppercase", color: "#9aa0a6", marginBottom: "6px" }}>
                {t('home.archiveEyebrow')}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                {Object.keys(ARCHIVE_YEARS).map(year => {
                  const isSelected = selectedYear === year
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setSelectedYear(year)}
                      style={{
                        fontFamily: "Roboto Condensed",
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: isSelected ? "#2196f3" : "#aaa",
                        cursor: "pointer",
                        border: "0",
                        borderBottom: isSelected ? "2px solid #2196f3" : "2px solid transparent",
                        background: "transparent",
                        padding: "0 0 2px",
                      }}
                    >
                      {t(`home.yearLabel.${year}`)}
                    </button>
                  )
                })}
              </div>
            </div>
          </Viz>
        </div>
      </section>
    </div>
  )
}
