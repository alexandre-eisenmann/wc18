import React, { useEffect, useMemo } from "react"

// Player detail card shown over the leaderboard when a name is tapped.
//
// Loaded lazily (see Ranking2) so none of this — markup, styles, the streak
// math — is paid for while the leaderboard itself is loading. It only ever
// renders for the single player that was tapped, so the work is trivial.

// Tiered saliency: value maps to visual weight, not just hue, in three steps.
// 8 (loudest) is the most vibrant solid emerald "prize"; 5 and 3 are flat
// solids that step down (blue, then a fader purple), all with white
// numbers, so each rung reads quieter while staying legible. 0 is a hollow ring.
const DOT = {
  8: { background: '#0aa85e', color: '#ffffff', border: '1px solid rgba(0,0,0,.12)' },
  5: { background: '#5891d6', color: '#ffffff', border: '1px solid rgba(0,0,0,.12)' },
  3: { background: '#a78fd4', color: '#ffffff', border: '1px solid rgba(0,0,0,.12)' },
  0: { background: 'transparent', color: 'rgba(0,0,0,.30)', border: '1px solid rgba(0,0,0,.16)' },
}

// A run of consecutive *played* games worth points (pts > 0) counts as a
// streak. Runs this long or longer get the golden highlight + the header pill.
const STREAK_MIN = 3

export default function PlayerCard({ game, matches, teams, t, onClose }) {
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

  // Per-match cell data + streak detection, in chronological order.
  const { cells, bestStreak } = useMemo(() => {
    const cells = matches.map((m) => {
      const bid = game[m.name]
      const played = m.home_result != null && m.away_result != null
      const home = teams[m.home_team]
      const away = teams[m.away_team]
      const label = `${home ? home.name : '?'} ${m.home_result != null ? m.home_result : '·'}-${m.away_result != null ? m.away_result : '·'} ${away ? away.name : '?'}`
      return {
        played,
        pts: played && bid ? (bid.pts || 0) : null,
        pred: bid ? `${bid.h}-${bid.a}` : '—',
        label,
      }
    })

    // Walk the played games finding maximal runs of pts > 0. A run that reaches
    // STREAK_MIN stamps its length on its *last* cell only (that many flames) —
    // so the count sits at the end of the streak and rides forward as the run
    // extends, leaving earlier cells clean. Each run is independent.
    let bestStreak = 0
    let i = 0
    while (i < cells.length) {
      if (cells[i].played && cells[i].pts > 0) {
        let j = i
        while (j < cells.length && cells[j].played && cells[j].pts > 0) j++
        const len = j - i
        if (len > bestStreak) bestStreak = len
        if (len >= STREAK_MIN) cells[j - 1].streakNo = len
        i = j
      } else {
        i++
      }
    }
    return { cells, bestStreak }
  }, [game, matches, teams])

  const position = game.position
  const total = game.total || 0

  return (
    <div className="pc-backdrop" onClick={onClose}>
      <div className="pc-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="pc-close" onClick={onClose} aria-label="close">×</button>

        <div className="pc-head">
          <div className="pc-name">{game.name}</div>
          <div className="pc-sub">
            <span className="pc-rank">{position}<sup>o</sup></span>
            <span className="pc-sep" />
            <span className="pc-pts">{total}</span>
            <span className="pc-pts-l">{t('card.points')}</span>
          </div>
        </div>

        <div className="pc-grid">
          {(() => {
            let playedSeen = 0
            return cells.map((c, i) => {
              const sty = c.played ? DOT[c.pts] : null
              // Only the real results animate; placeholders render statically.
              const cls = `pc-dot${c.played ? ' pc-dot--anim' : ' pc-dot--empty'}`
              const delay = c.played ? playedSeen++ * 45 : 0
              return (
                <div
                  key={i}
                  className={cls}
                  style={{
                    ...(sty ? { background: sty.background, color: sty.color, border: sty.border } : null),
                    ...(c.played ? { animationDelay: `${delay}ms` } : null),
                  }}
                  title={`${c.label} · ${c.pred}`}
                >
                  {c.streakNo && (
                    <span className="pc-streakno">
                      {Array.from({ length: c.streakNo }).map((_, k) => {
                        // Fan the flames symmetrically across the top; each rides
                        // the dot's rim, so longer runs sweep around the contour.
                        const a = (k - (c.streakNo - 1) / 2) * 32
                        return (
                          <span key={k} className="pc-streakno-fire" style={{ transform: `rotate(${a}deg)` }}>
                            <span className="pc-streakno-fire-i" style={{ transform: `translate(-50%, -50%) rotate(${-a}deg)` }}>🔥</span>
                          </span>
                        )
                      })}
                    </span>
                  )}
                  {c.played ? c.pts : ''}
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
}
