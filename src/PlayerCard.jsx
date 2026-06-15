import React, { useEffect, useMemo, useRef, useState } from "react"

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

const GRID_COLS = 8
const GRID_GAP = 8
const GRID_PAD = 18
const STREAK_STROKE = 5
const DOT_STAGGER_MS = 45
const DOT_POP_MS = 340

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

    // Walk the played games finding maximal runs of pts > 0. Every multi-game
    // run marks its dots so CSS can draw the continuous rail between them. A
    // run that reaches STREAK_MIN still stamps its length on the last cell only.
    let bestStreak = 0
    let i = 0
    while (i < cells.length) {
      if (cells[i].played && cells[i].pts > 0) {
        let j = i
        while (j < cells.length && cells[j].played && cells[j].pts > 0) j++
        const len = j - i
        if (len > bestStreak) bestStreak = len
        if (len >= STREAK_MIN) {
          for (let k = i; k < j; k++) {
            cells[k].streak = {
              len,
              index: k - i,
              continuesRight: k < j - 1,
              wrapsRight: k < j - 1 && k % GRID_COLS === GRID_COLS - 1,
              wrapsLeft: k > i && k % GRID_COLS === 0,
            }
          }
        }
        if (len >= STREAK_MIN) cells[j - 1].streakNo = len
        i = j
      } else {
        i++
      }
    }
    return { cells, bestStreak }
  }, [game, matches, teams])

  const gridRef = useRef(null)
  const [gridW, setGridW] = useState(0)
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const measure = () => setGridW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const streakLinks = useMemo(() => {
    if (!gridW) return []
    const dot = (gridW - (GRID_PAD * 2) - (GRID_GAP * (GRID_COLS - 1))) / GRID_COLS
    const pitch = dot + GRID_GAP
    const radius = dot / 2
    const cx = i => GRID_PAD + (i % GRID_COLS) * pitch + radius
    const cy = i => GRID_PAD + Math.floor(i / GRID_COLS) * pitch + radius
    const links = []
    const playedOrder = []
    let playedSeen = 0
    cells.forEach((c, i) => {
      if (c.played) playedOrder[i] = playedSeen++
    })
    const linkDelay = i => `${((playedOrder[i + 1] ?? playedOrder[i] ?? 0) * DOT_STAGGER_MS) + DOT_POP_MS}ms`

    cells.forEach((c, i) => {
      const streak = c.streak
      if (!streak || !streak.continuesRight) return
      const tier = Math.min(streak.len, 6)
      const delay = linkDelay(i)
      const y = cy(i)

      if (streak.wrapsRight) {
        links.push({ key: `${i}-edge-r`, x1: cx(i), y1: y, x2: gridW, y2: y, tier, delay })
        links.push({ key: `${i}-edge-l`, x1: 0, y1: cy(i + 1), x2: cx(i + 1), y2: cy(i + 1), tier, delay })
      } else {
        links.push({ key: `${i}-r`, x1: cx(i), y1: y, x2: cx(i + 1), y2: y, tier, delay })
      }
    })

    return links
  }, [cells, gridW])

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

        <div className="pc-grid" ref={gridRef}>
          {streakLinks.length > 0 && (
            <svg className="pc-streak-links" aria-hidden="true">
              {streakLinks.map(link => (
                <line
                  key={link.key}
                  x1={link.x1}
                  y1={link.y1}
                  x2={link.x2}
                  y2={link.y2}
                  stroke="#111827"
                  strokeWidth={STREAK_STROKE}
                  className={`pc-streak-link pc-streak-link-${link.tier}`}
                  style={{ '--pc-link-delay': link.delay }}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          )}
          {(() => {
            let playedSeen = 0
            return cells.map((c, i) => {
              const sty = c.played ? DOT[c.pts] : null
              const streak = c.streak
              // Only the real results animate; placeholders render statically.
              const streakTier = streak ? Math.min(streak.len, 6) : 0
              const cls = [
                'pc-dot',
                c.played ? 'pc-dot--anim' : 'pc-dot--empty',
                streak ? 'pc-dot--streak' : '',
                streak ? `pc-dot--streak-${streakTier}` : '',
              ].filter(Boolean).join(' ')
              const delay = c.played ? playedSeen++ * DOT_STAGGER_MS : 0
              return (
                <div
                  key={i}
                  className={cls}
                  style={{
                    ...(sty && streak ? { '--pc-dot-bg': sty.background, color: sty.color } : null),
                    ...(sty && !streak ? { background: sty.background, color: sty.color } : null),
                    ...(sty && !streak ? { border: sty.border } : null),
                    ...(c.played ? { animationDelay: `${delay}ms` } : null),
                  }}
                  title={`${c.label} · ${c.pred}`}
                >
                  {streak && <span className="pc-dot-face">{c.played ? c.pts : ''}</span>}
                  {c.streakNo && <span className="pc-streak-badge">{c.streakNo}×</span>}
                  {!streak && (c.played ? c.pts : '')}
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )
}
