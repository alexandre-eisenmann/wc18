import React, { useEffect, useMemo } from "react"
import dayjs from 'dayjs'
import MatchViz from './MatchViz'
import './flags.css'

// Match detail card shown over the leaderboard when a game's header column is
// tapped. It renders the bid-distribution map (MatchViz) for that single match.
//
// Loaded lazily (see Ranking2) so neither this markup nor MatchViz / react-move
// weigh on the leaderboard's initial render — the whole bundle is only fetched
// the first time a match header is tapped. The bid points themselves come from
// the leaderboard's already-in-memory bids, so opening the card is network-free.

export default function MatchCard({ match, teams, bids, t, onClose }) {
  // Close on Escape, and lock background scroll while the card is open.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const home = teams[match.home_team]
  const away = teams[match.away_team]
  const finished = match.home_result != null && match.away_result != null

  // Build MatchViz's input from the in-memory bids. MatchViz plots its awayTeam
  // axis (left) from res.a and homeTeam axis (right) from res.h, so we render it
  // home-first by orienting the data home->res.a, away->res.h and passing the
  // teams swapped (homeTeam={away}, awayTeam={home}) — mirroring NextGameBidMap.
  const games = useMemo(() => {
    const out = []
    bids.forEach((g) => {
      const b = g[match.name]
      if (b && b.h != null && b.a != null) out.push({ res: { a: b.h, h: b.a }, gameId: g.gameId })
    })
    return out
  }, [bids, match])

  const result = finished ? { a: match.home_result, h: match.away_result } : null

  return (
    <div className="pc-backdrop" onClick={onClose}>
      <div className="pc-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="pc-close" onClick={onClose} aria-label="close">×</button>

        <div className="pc-head">
          <div className="mc-eyebrow">{t('viz.title')}</div>
          <div className="mc-teams">
            <span className={`mc-flag f-${home.iso2}`} title={home.name} />
            <span className="mc-tname">{home.name}</span>
            <span className="mc-x">×</span>
            <span className="mc-tname">{away.name}</span>
            <span className={`mc-flag f-${away.iso2}`} title={away.name} />
          </div>
          <div className="mc-sub">
            {dayjs(match.date).format('DD MMM • HH:mm')}
            {finished && <span className="mc-score">{match.home_result} × {match.away_result}</span>}
          </div>
        </div>

        <div className="mc-viz">
          <MatchViz
            homeTeam={away.name}
            awayTeam={home.name}
            games={games}
            result={result}
          />
        </div>
      </div>
    </div>
  )
}
