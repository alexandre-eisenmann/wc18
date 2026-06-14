import React, { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import * as d3 from 'd3'
import { Icon } from '@mui/material'
import { DATABASE_WC26 } from './constants'
import data_file from './data26.json'
import './RankFlow.css'

/* ───────────────────────── static data prep ─────────────────────────
   A "rank over time" bump chart: every row is a player, every column is a
   group-stage game. After each game we re-rank all players by their running
   score; the curve for a player threads through their rank at each game.

   Layout: games have a FIXED pitch (COL_W). The viewport follows the present —
   the playhead is pinned near the right edge and the chart pans left as new
   games come in, so a narrow phone shows fewer games and a wide desktop more.
   Colour encodes the player's latest rank (best → cool blue, worst → warm red). */

// Build the sorted match list (with home/away team objects) for a tournament.
const buildMatches = data => {
  const teams = data.teams.reduce((m, t) => { m[t.id] = t; return m }, {})
  return Object.keys(data.groups)
    .flatMap(g => data.groups[g].matches)
    .sort((a, b) => (dayjs(a.date).isBefore(b.date) ? -1 : dayjs(a.date).isAfter(b.date) ? 1 : 0))
    .map(m => ({ id: m.name, date: m.date, home: teams[m.home_team], away: teams[m.away_team] }))
}

const hasResult = g => g && g.h != null && g.a != null

const ABBR = { 'South Korea': 'KOR', 'Saudi Arabia': 'KSA', 'Costa Rica': 'CRC', 'Switzerland': 'SUI' }
const abbr = name => (ABBR[name] || name.slice(0, 3)).toUpperCase()
const trunc = (s, n = 22) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

const points = (rh, ra, h, a) => {
  if (rh == null || ra == null || h == null || a == null) return 0
  if (h === rh && a === ra) return 8
  if (rh - ra === h - a) return 5
  if (Math.sign(rh - ra) === Math.sign(h - a)) return 3
  return 0
}

// ── fixed geometry ──
const COL_W = 42               // fixed horizontal pitch between games (px)
const LEFT_PAD = 22            // gap before the first game
const MIN_ROW = 20             // min vertical pitch between players (then it scrolls)
const BAND_H = 74              // sticky header band: leaderboard-style game columns + slider
const LABEL_GAP = 12           // gap from the present line to the live labels
const PAD_T = 8, PAD_B = 8

// animation pacing
const GAME_MS = 520            // base ms to advance one game-column
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// width reserved on the right for the standings (name + pts + position columns).
const rightPadFor = w => Math.round(clamp(w * 0.42, 150, 300))

// the points number sits in a narrow column BEFORE the name; the name then
// uses all the remaining width.
const NUM_COL = 24            // points column — just enough for a 3-digit number
const COL_PAD = 12            // gap from the right edge
const COL_GAP = 6             // gap between the points column and the name
const CHAR_W = 6.2            // ~px per char at the label size (for truncation)

/* ───────────────────────────── component ───────────────────────────── */

export default function RankFlow({ data = data_file, dbNode = DATABASE_WC26, embedHeight, topBarContent }) {
  const MATCHES = useMemo(() => buildMatches(data), [data])

  // tracks[name] = cumulative points after each played game (length = len)
  const [tracks, setTracks] = useState(null)
  const [gabarito, setGabarito] = useState(null)
  const [len, setLen] = useState(0)              // number of games played so far (columns)

  const [pos, setPos] = useState(0)              // continuous column position [0, len-1]
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [hover, setHover] = useState(null)
  const [manualScroll, setManualScroll] = useState(null)   // user pan offset when paused (null = follow present)

  const posRef = useRef(0)
  const speedRef = useRef(1)
  speedRef.current = speed
  const playingRef = useRef(false)
  playingRef.current = playing

  // While playing, the viewport follows the present and hovering is disabled.
  // Pausing hands control back to the user (pan + hover).
  useEffect(() => {
    if (playing) { setHover(null); setManualScroll(null) }
  }, [playing])
  const lenRef = useRef(0)
  lenRef.current = len

  // ── load bids + results for this tournament, build cumulative tracks ──
  useEffect(() => {
    setTracks(null); setGabarito(null); setLen(0); setPos(0); posRef.current = 0
    firebase.database().ref(`${dbNode}`).once('value', snap => {
      const bids = []
      snap.forEach(child => {
        const cd = child.val()
        Object.keys(cd).forEach(key => {
          const d = cd[key]
          if (d && d.status === 'payed') bids.push({ ...d, gameId: key, userId: child.key })
        })
      })

      firebase.database().ref(`${dbNode}/master/gabarito`).once('value', gsnap => {
        const gab = {}
        gsnap.forEach(c => { gab[c.key] = c.val() })

        // Only go up to the present: columns stop at the last game with a result.
        let lastPlayed = -1
        MATCHES.forEach((m, i) => { if (hasResult(gab[m.id])) lastPlayed = i })
        const played = MATCHES.slice(0, lastPlayed + 1)

        const result = {}
        bids.forEach(bid => {
          let total = 0
          result[bid.name] = played.map(m => {
            const g = gab[m.id]
            const b = bid[m.id]
            total += points(g && g.h, g && g.a, b && b.h, b && b.a)
            return total
          })
        })

        setGabarito(gab)
        setLen(played.length)
        setTracks(result)
        setPos(played.length - 1)     // start showing the present, then animation can replay
        posRef.current = played.length - 1
        setPlaying(true)
      })
    })
  }, [dbNode, MATCHES])

  // ── responsive sizing ──
  const stageRef = useRef(null)
  const bandRef = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    if (!tracks) return
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [tracks])

  // ── height: when embedded (e.g. on the home page) use the given height;
  //    otherwise fill the viewport from just under the app NavBar. ──
  const rootRef = useRef(null)
  const [rootH, setRootH] = useState(0)
  useEffect(() => {
    if (embedHeight) return
    const measure = () => {
      const el = rootRef.current
      if (!el) return
      setRootH(window.innerHeight - el.getBoundingClientRect().top)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [tracks, len, embedHeight])

  // ── animation loop ──
  useEffect(() => {
    if (!playing) return
    let raf
    let last = performance.now()
    const tick = now => {
      const dt = now - last
      last = now
      const max = lenRef.current - 1
      let next = posRef.current + (dt / GAME_MS) * speedRef.current
      if (next >= max) { next = max; setPlaying(false) }
      posRef.current = next
      setPos(next)
      if (next < max) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const setPosition = p => {
    const c = clamp(Number.isFinite(p) ? p : 0, 0, lenRef.current - 1)
    posRef.current = c
    setPos(c)
  }
  const restart = () => { setPosition(0); setPlaying(true) }
  const togglePlay = () => { if (pos >= len - 1) { restart(); return } setPlaying(p => !p) }

  // ── geometry (rebuilt only when data / size / len change) ──
  const model = useMemo(() => {
    if (!tracks || size.w === 0 || len === 0) return null
    const names = Object.keys(tracks)
    const N = names.length
    if (N === 0) return null

    // rankAt[c][n] — a unique row slot (points, then name) so lines never overlap
    const rankAt = []
    let finalOrdered = null
    for (let c = 0; c < len; c++) {
      const ordered = names
        .map(n => ({ n, p: tracks[n][c] }))
        .sort((a, b) => (b.p - a.p) || (a.n < b.n ? -1 : 1))
      const r = {}
      ordered.forEach((o, i) => { r[o.n] = i })
      rankAt.push(r)
      if (c === len - 1) finalOrdered = ordered
    }
    const rankF = rankAt[len - 1]

    // band boundaries (final state): a separator goes between two adjacent rows
    // only where the points differ, so tied players stay inside one band.
    const sepRows = []
    for (let i = 0; i < finalOrdered.length - 1; i++) {
      if (finalOrdered[i].p !== finalOrdered[i + 1].p) sepRows.push(i)
    }
    // one entry per position group (tied players share it): top row + pos + points
    const bands = []
    for (let i = 0; i < finalOrdered.length;) {
      let j = i
      while (j + 1 < finalOrdered.length && finalOrdered[j + 1].p === finalOrdered[i].p) j++
      bands.push({ start: i, end: j, position: i + 1, points: finalOrdered[i].p })
      i = j + 1
    }

    const rowGap = Math.max(MIN_ROW, (size.h - BAND_H - PAD_T - PAD_B) / (N - 1 || 1))
    const plotH = rowGap * (N - 1)
    const contentW = LEFT_PAD + (len - 1) * COL_W     // x of the last (present) column, in content space

    const cx = c => LEFT_PAD + c * COL_W
    const y = r => PAD_T + r * rowGap
    const line = d3.line().curve(d3.curveBumpX).x(d => d[0]).y(d => d[1])

    const players = names.map(n => {
      const nodes = []
      for (let c = 0; c < len; c++) nodes.push([cx(c), y(rankAt[c][n])])
      return {
        n,
        rankF: rankF[n],
        total: tracks[n][len - 1],
        color: d3.interpolateTurbo(0.04 + 0.9 * (rankF[n] / (N - 1 || 1))),
        nodes,
        d: line(nodes),
      }
    })
    // draw worst → best so higher-ranked players' lines sit on top (z-order = paint order)
    players.sort((a, b) => b.rankF - a.rankF)

    return { players, names, rankAt, sepRows, bands, N, cx, y, rowGap, plotH, contentW, height: PAD_T + plotH + PAD_B }
  }, [tracks, size, len])

  // ── static chart layer: stable element reference so React skips it every
  //    frame (only the scroll transform / clip / playhead / labels move). ──
  const staticLayer = useMemo(() => {
    if (!model) return null
    const top = PAD_T - 4, bot = PAD_T + model.plotH + 4
    return (
      <>
        <g>
          {Array.from({ length: len }, (_, c) => (
            <line key={c} className="rf-guide" x1={model.cx(c)} x2={model.cx(c)} y1={top} y2={bot} />
          ))}
        </g>
        {/* translucent colour strokes — overlaps blend softly (no white casing) */}
        <g>
          {model.players.map(p => (
            <path
              key={p.n}
              className={`rf-line${hover ? (hover === p.n ? ' hot' : ' dim') : ''}`}
              d={p.d} stroke={p.color}
            />
          ))}
        </g>
      </>
    )
  }, [model, hover, len])

  if (!tracks) return <div className="rf-root rf-center" ref={rootRef} style={{ height: embedHeight || rootH || '70vh' }}><div className="rf-loading">Carregando…</div></div>
  if (len === 0) return <div className="rf-root rf-center" ref={rootRef} style={{ height: embedHeight || rootH || '70vh' }}><div className="rf-loading">Sem resultados ainda</div></div>

  const PM = MATCHES.slice(0, len)            // only games played so far
  const matchIdx = clamp(Math.round(pos), 0, len - 1)
  const finished = pos >= len - 1.001

  // ── viewport: follows the present while playing; free pan while paused ──
  const rightPad = rightPadFor(size.w)
  const anchorX = Math.max(LEFT_PAD + COL_W, size.w - rightPad)   // where the present line gets pinned
  const autoScroll = model ? Math.max(0, LEFT_PAD + pos * COL_W - anchorX) : 0
  const maxScroll = model ? Math.max(0, model.contentW - anchorX) : 0
  const scroll = (!playing && manualScroll != null) ? clamp(manualScroll, 0, maxScroll) : autoScroll
  const presentX = model ? LEFT_PAD + pos * COL_W - scroll : 0

  // live standings: smooth y, snapped rank number
  const g0 = Math.floor(pos), g1 = Math.min(g0 + 1, len - 1), frac = pos - g0

  const playLabel = playing ? 'Pause' : (pos >= len - 1 ? 'Replay' : 'Play')
  const controls = (
    <div className="rf-playback">
      <button className="rf-play" onClick={togglePlay} title={playLabel} aria-label={playLabel}>
        <Icon>{playing ? 'pause' : (pos >= len - 1 ? 'replay' : 'play_arrow')}</Icon>
        <span>{playLabel}</span>
      </button>
      <span className="rf-dock-sep" />
      <button
        className="rf-speed-btn"
        onClick={() => setSpeed(s => { const o = [1, 2, 4]; return o[(o.indexOf(s) + 1) % o.length] })}
        title="Speed"
        aria-label={`Speed ${speed}x`}
      >
        <Icon>fast_forward</Icon>
        <span className="rf-speed-text"><span className="rf-speed-word">Speed </span>{speed}×</span>
      </button>
    </div>
  )

  return (
    <div className="rf-root" ref={rootRef} style={{ height: embedHeight || rootH || '70vh' }}>
      {/* embedded: controls as a top bar (always visible); full-page: floating dock */}
      {embedHeight && (
        <div className="rf-topctrl">
          {controls}
          {topBarContent && <div className="rf-topctrl-content">{topBarContent}</div>}
        </div>
      )}

      {/* chart */}
      <div
        className="rf-stage"
        ref={stageRef}
        onWheel={e => {
          if (e.target.closest && e.target.closest('.rf-flags')) return
          // when paused, scroll the whole journey horizontally: trackpad swipe
          // (deltaX) or shift+wheel. Plain vertical wheel stays native.
          if (playing || maxScroll <= 0) return
          const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0)
          if (!dx) return
          setManualScroll(s => clamp((s != null ? s : autoScroll) + dx, 0, maxScroll))
        }}
      >
        {/* per-game flags — also the scrub/pan handle (drag or swipe left/right) */}
        {model && (
          <div
            ref={bandRef}
            className={`rf-flags${!playing ? ' pannable' : ''}`}
            style={{ height: BAND_H }}
            onWheel={e => {
              e.preventDefault()
              e.stopPropagation()
              window.scrollBy({ top: e.deltaY, left: 0 })
            }}
            onPointerDown={e => {
              // drag (with movement) pans; a click jumps the present to that game
              if (playing || e.button !== 0) return
              const startX = e.clientX
              const start = scroll
              let moved = false
              const move = ev => {
                if (Math.abs(ev.clientX - startX) > 4) moved = true
                if (moved && maxScroll > 0) setManualScroll(clamp(start - (ev.clientX - startX), 0, maxScroll))
              }
              const up = ev => {
                window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up)
                if (!moved && bandRef.current) {
                  const contentX = (ev.clientX - bandRef.current.getBoundingClientRect().left) + start
                  const c = clamp(Math.round((contentX - LEFT_PAD) / COL_W), 0, len - 1)
                  setPlaying(false); setManualScroll(start); setPosition(c)
                }
              }
              window.addEventListener('pointermove', move)
              window.addEventListener('pointerup', up)
            }}
          >
            <div className="rf-flags-clip">
              <div className="rf-flags-inner" style={{ transform: `translateX(${-scroll}px)` }}>
                {PM.map((m, c) => {
                  const g = gabarito[m.id]
                  return (
                    <div
                      key={m.id}
                      className={`rf-gamecol${c === matchIdx ? ' on' : ''}${c <= matchIdx ? '' : ' future'}`}
                      style={{ left: model.cx(c) }}
                      title={`${abbr(m.home.name)} × ${abbr(m.away.name)} · jogo ${c + 1}`}
                    >
                      <span className="rf-gabbr">{abbr(m.home.name)}</span>
                      <span className={`rf-gameflag f-${m.home.iso2}`} />
                      <span className={`rf-gameflag f-${m.away.iso2}`} />
                      <span className="rf-gabbr">{abbr(m.away.name)}</span>
                      <span className="rf-gscore">{g ? `${g.h}-${g.a}` : ''}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* slider directly under the flags: thumb sits below the present
                game; drag to scrub (the view stays put while you move it). */}
            <div
              className="rf-slider"
              onPointerDown={e => {
                if (playing || e.button !== 0) return
                e.stopPropagation()
                const frozen = scroll
                setManualScroll(frozen)
                const seek = ev => {
                  const contentX = (ev.clientX - bandRef.current.getBoundingClientRect().left) + frozen
                  setPosition((contentX - LEFT_PAD) / COL_W)
                }
                seek(e)
                const up = () => { window.removeEventListener('pointermove', seek); window.removeEventListener('pointerup', up) }
                window.addEventListener('pointermove', seek)
                window.addEventListener('pointerup', up)
              }}
            >
              <div className="rf-slider-fill" style={{ width: presentX }} />
              <div className="rf-slider-thumb" style={{ left: presentX }} />
            </div>
          </div>
        )}

        {model && (
          <svg className="rf-svg" width={size.w} height={model.height}>
            <defs>
              <clipPath id="rf-reveal">
                <rect x="0" y="0" width={presentX} height={model.height} />
              </clipPath>
            </defs>

            {/* once finished, band the positions in the NAME area only — tied
                players (same points) share a band, with zebra striping. */}
            {finished && (() => {
              const x0 = presentX, top = model.y(0) - model.rowGap / 2
              const bottom = model.y(model.N - 1) + model.rowGap / 2
              const bounds = [top, ...model.sepRows.map(r => model.y(r) + model.rowGap / 2), bottom]
              return (
                <g className="rf-bands">
                  {bounds.slice(0, -1).map((yA, i) => (i % 2 === 1 ? (
                    <rect key={`b${i}`} className="rf-band" x={x0} y={yA} width={size.w - x0} height={bounds[i + 1] - yA} />
                  ) : null))}
                  {model.sepRows.map(r => {
                    const yy = model.y(r) + model.rowGap / 2
                    return <line key={r} x1={x0} x2={size.w} y1={yy} y2={yy} />
                  })}
                </g>
              )
            })()}

            {/* scrolling, progressively-revealed chart */}
            <g clipPath="url(#rf-reveal)">
              <g transform={`translate(${-scroll},0)`}>
                {staticLayer}
              </g>
            </g>

            {/* moving playhead — the present, pinned near the right edge */}
            <line className="rf-playglow" x1={presentX} x2={presentX} y1={PAD_T - 4} y2={PAD_T + model.plotH + 4} />
            <line className="rf-playhead" x1={presentX} x2={presentX} y1={PAD_T - 4} y2={PAD_T + model.plotH + 4} />

            {/* live standings labels, riding just right of the present line.
                Indices are clamped to the model's own rank array so a transient
                skew between the `len` state and the memoized model can't crash. */}
            {(() => {
              const RA = model.rankAt, last = RA.length - 1
              const i0 = clamp(g0, 0, last), i1 = clamp(g1, 0, last)
              // name fills from the present line; when finished it leaves room on
              // the right for the points column.
              const nameX = presentX + LABEL_GAP
              const nameRight = finished ? size.w - COL_PAD - NUM_COL - COL_GAP : size.w - COL_PAD
              const nameMax = Math.max(4, Math.floor((nameRight - nameX) / CHAR_W))
              return (
                <g>
                  {model.players.map(p => {
                    const rNow = lerp(RA[i0][p.n], RA[i1][p.n], frac)
                    return (
                      <text
                        key={p.n}
                        className={`rf-label${hover ? (hover === p.n ? ' hot' : ' dim') : ''}`}
                        x={nameX} y={model.y(rNow) + 3} textAnchor="start" fill={p.color}
                        onMouseEnter={() => { if (!playingRef.current) setHover(p.n) }} onMouseLeave={() => setHover(null)}
                      >
                        {trunc(p.n, nameMax)}
                      </text>
                    )
                  })}
                </g>
              )
            })()}

            {/* points number in a narrow column after the name, floated to the
                top of the band so it heads the group of tied players */}
            {finished && (
              <g className="rf-badges">
                {model.bands.map(b => (
                  <text key={b.start} className="rf-badge rf-bnum" x={size.w - COL_PAD} y={model.y(b.start) + 3} textAnchor="end">
                    {b.points}
                  </text>
                ))}
              </g>
            )}
          </svg>
        )}
      </div>

      {/* full-page: floating control dock */}
      {!embedHeight && <div className="rf-dock">{controls}</div>}
    </div>
  )
}
