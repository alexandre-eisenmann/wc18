import React, { Component } from "react"
import dayjs from 'dayjs'
import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import MatchViz from './MatchViz'
import './flags.css'
import defaultData from './data26.json'
import { DATABASE_ROOT_NODE } from './constants'
import { LanguageContext } from './i18n'

const GAP = 16 // px between slides
const RENDER_WINDOW = 3 // only mount the heavy MatchViz for slides this close to centre

// Full-width coverflow of the next upcoming matches. The whole strip lives on a
// single sliding track that animates between games, so moving feels continuous
// rather than stepped. The centred slide is highlighted; neighbours scale down
// and fade. Bids for every slide are loaded up front in one read.
export default class NextGameBidMap extends Component {

  static contextType = LanguageContext

  constructor(props) {
    super(props)
    const data = props.tournamentData || defaultData
    this.teams = data.teams.reduce((acc, ele) => { acc[ele.id] = ele; return acc }, {})
    const matches = Object.keys(data.groups).reduce((acc, g) => acc.concat(data.groups[g].matches), [])
    this.allMatches = matches.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
    this.dbNode = props.dbNode || DATABASE_ROOT_NODE
    this.state = {
      matches: [],
      index: 0,
      gamesMap: {},
      resultsMap: {},
      containerW: typeof window !== 'undefined' ? window.innerWidth : 375,
    }
    this.containerRef = React.createRef()
    this.touchX = null
    this.measure = this.measure.bind(this)
  }

  componentDidMount() {
    // Keep every match in the strip — played games stay put (showing their
    // result) and only the active position moves on to the next upcoming game.
    const now = dayjs()
    const matches = this.allMatches
    let index = matches.findIndex((m) => dayjs(m.date).isAfter(now))
    if (index === -1) index = matches.length - 1
    this.setState({ matches, index })
    this.loadGames(matches)
    this.measure()
    window.addEventListener('resize', this.measure)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.measure)
  }

  measure() {
    if (this.containerRef.current) {
      this.setState({ containerW: this.containerRef.current.offsetWidth })
    }
  }

  loadGames(matches) {
    const gamesMap = {}
    const resultsMap = {}
    firebase.database().ref(this.dbNode).once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val()
        Object.keys(childData).forEach((key) => {
          if (key === 'gabarito') {
            // MatchViz plots its awayTeam axis (left) from res.a and homeTeam
            // axis (right) from res.h. We render the card home-first (home on
            // the left), so orient the data home->a, away->h to match.
            matches.forEach((m) => {
              const r = childData[key][m.name]
              if (r != null) resultsMap[m.name] = { a: r.h, h: r.a }
            })
            return
          }
          const entry = childData[key]
          matches.forEach((m) => {
            const res = entry && entry[m.name]
            if (res && res.h != null && res.a != null) {
              (gamesMap[m.name] = gamesMap[m.name] || []).push({ res: { a: res.h, h: res.a }, gameId: key, userId: childSnapshot.key })
            }
          })
        })
      })
      this.setState({ gamesMap, resultsMap })
    })
  }

  go(delta) {
    this.setState((s) => {
      const n = s.matches.length
      if (!n) return null
      return { index: (s.index + delta + n) % n }
    })
  }

  onTouchStart(e) { this.touchX = e.touches[0].clientX }

  onTouchEnd(e) {
    if (this.touchX == null) return
    const dx = e.changedTouches[0].clientX - this.touchX
    if (Math.abs(dx) > 40) this.go(dx < 0 ? 1 : -1)
    this.touchX = null
  }

  renderCard(match, dist) {
    const { t } = this.context
    const { gamesMap, resultsMap, containerW } = this.state
    const homeTeam = this.teams[match.home_team]
    const awayTeam = this.teams[match.away_team]
    const home = homeTeam.name
    const away = awayTeam.name
    const isCenter = dist === 0
    const cardW = Math.min(300, Math.round(containerW * 0.8))
    const scale = isCenter ? 1 : dist === 1 ? 0.84 : 0.72
    const opacity = isCenter ? 1 : dist === 1 ? 0.5 : 0.26
    const heavy = dist <= RENDER_WINDOW
    const flagStyle = { width: "20px", height: "15px", borderRadius: "2px", flex: "0 0 auto", boxShadow: "0 1px 2px rgba(0,0,0,0.28)" }

    return (
      <div
        key={match.name}
        onClick={() => { if (!isCenter) this.goTo(match) }}
        style={{
          flex: "0 0 auto",
          width: `${cardW}px`,
          marginRight: `${GAP}px`,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          opacity,
          transition: "transform .45s cubic-bezier(.22,.61,.36,1), opacity .45s ease",
          zIndex: isCenter ? 3 : 1,
          cursor: isCenter ? "default" : "pointer",
        }}
      >
        <div style={{
          padding: "12px 12px 8px",
          boxSizing: "border-box",
          background: "#fff",
          border: "1px solid rgba(15, 23, 42, 0.1)",
          borderRadius: "18px",
          boxShadow: isCenter ? "0 24px 56px rgba(15, 23, 42, 0.3)" : "0 8px 20px rgba(15, 23, 42, 0.14)",
          pointerEvents: isCenter ? "auto" : "none",
        }}>
          <div style={{
            fontFamily: "Roboto Condensed",
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            color: "#2196f3",
            marginBottom: "2px",
            minHeight: "14px",
          }}>{isCenter ? t('home.nextGameEyebrow') : ' '}</div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            fontFamily: "Roboto Condensed",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#111",
            lineHeight: "1.15",
            whiteSpace: "nowrap",
          }}>
            <span className={`f-${homeTeam.iso2}`} style={flagStyle} />
            <span>{home}</span>
            <span style={{ color: "#c4c8cf", fontWeight: "normal" }}>×</span>
            <span>{away}</span>
            <span className={`f-${awayTeam.iso2}`} style={flagStyle} />
          </div>
          <div style={{ fontFamily: "Open Sans", fontSize: "11px", color: "#777", marginBottom: "2px" }}>
            {dayjs(match.date).format('DD MMM • HH:mm')}
          </div>
          {heavy ? (
            <MatchViz
              key={match.name}
              hideAnimate={!isCenter}
              homeTeam={away}
              awayTeam={home}
              games={gamesMap[match.name]}
              result={resultsMap[match.name]}
            />
          ) : (
            <div style={{ width: "100%", paddingBottom: "100%" }} />
          )}
        </div>
      </div>
    )
  }

  goTo(match) {
    this.setState((s) => {
      const i = s.matches.indexOf(match)
      return i >= 0 ? { index: i } : null
    })
  }

  render() {
    const { t } = this.context
    const { matches, index, containerW } = this.state
    if (!matches.length) return null
    const n = matches.length

    const cardW = Math.min(300, Math.round(containerW * 0.8))
    const step = cardW + GAP
    // Slide the track so the active card sits in the horizontal centre.
    const translateX = Math.round(containerW / 2 - (index * step + cardW / 2))

    const pct = n > 1 ? (index / (n - 1)) * 100 : 0

    const arrowStyle = {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      background: "transparent",
      border: "none",
      padding: 0,
      width: "44px",
      height: "56px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 5,
    }

    const chevron = (dir) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.45))" }}>
        {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    )

    return (
      <div style={{ width: "100%" }}>
        <div
          ref={this.containerRef}
          onTouchStart={this.onTouchStart.bind(this)}
          onTouchEnd={this.onTouchEnd.bind(this)}
          style={{ position: "relative", width: "100%", overflow: "hidden", padding: "8px 0" }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            transform: `translateX(${translateX}px)`,
            transition: "transform .45s cubic-bezier(.22,.61,.36,1)",
            willChange: "transform",
          }}>
            {matches.map((m, i) => this.renderCard(m, Math.abs(i - index)))}
          </div>

          {n > 1 && (
            <button type="button" aria-label={t('nextGame.prev')} style={{ ...arrowStyle, left: "4px" }} onClick={() => this.go(-1)}>{chevron('left')}</button>
          )}
          {n > 1 && (
            <button type="button" aria-label={t('nextGame.next')} style={{ ...arrowStyle, right: "4px" }} onClick={() => this.go(1)}>{chevron('right')}</button>
          )}
        </div>

        {n > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "2px", padding: "0 16px" }}>
            <div style={{ fontFamily: "Roboto Condensed", fontWeight: "bold", fontSize: "11px", letterSpacing: "1px", color: "rgba(255,255,255,0.9)", minWidth: "46px", textAlign: "right" }}>
              {index + 1} / {n}
            </div>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const ratio = (e.clientX - rect.left) / rect.width
                this.setState({ index: Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1)))) })
              }}
              style={{ position: "relative", flex: "0 1 220px", height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.3)", cursor: "pointer" }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "white", borderRadius: "3px", transition: "width .35s ease" }} />
              <div style={{ position: "absolute", top: "50%", left: `${pct}%`, transform: "translate(-50%,-50%)", width: "11px", height: "11px", borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", transition: "left .35s ease" }} />
            </div>
          </div>
        )}
      </div>
    )
  }
}
