import React, { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import './flags.css'
import './BarRaceX.css'
import tracks from './data_bar_race.json'
import data2018 from './data2018.json'
import { DATABASE_WC18 } from './constants'

/* ───────────────── static data prep (runs once) ─────────────────
   Each game is shown in two phases:
     1) every player's bar gains a fragment (a segment) whose width is
        proportional to the points won that game and whose colour follows the
        tabelão (Ranking2) scheme — NO reordering yet, so a lower player can
        visibly shoot past the one above.
     2) the rows reorder by the new totals.
   The full bar is therefore a stack of per-game fragments.            */

const TEAMS = data2018.teams.reduce((m, t) => { m[t.id] = t; return m }, {})

const MATCHES = ['a','b','c','d','e','f','g','h']
  .flatMap(g => data2018.groups[g].matches)
  .sort((a, b) => (dayjs(a.date).isBefore(b.date) ? -1 : dayjs(a.date).isAfter(b.date) ? 1 : 0))
  .map(m => ({ id: m.name, date: m.date, home: TEAMS[m.home_team], away: TEAMS[m.away_team] }))

const NAMES = Object.keys(tracks)
const LEN = tracks[NAMES[0]].length            // 48 games

// 3-letter country code, same flavour as Ranking2's header abbreviations.
const ABBR = { 'South Korea': 'KOR', 'Saudi Arabia': 'KSA', 'Costa Rica': 'CRC', 'Switzerland': 'SUI' }
const abbr = name => (ABBR[name] || name.slice(0, 3)).toUpperCase()

// Ranking2 point colours. 0 is a faint neutral notch — the break in a streak.
const CHIP = {
  8: { bg: '#0aa85e' },
  5: { bg: '#5891d6' },
  3: { bg: '#a78fd4' },
  0: { bg: '#e6e8ed', zero: true },
}
// Fragment width = base T (the played game) + U per point:
//   0 → T,  3 → T+3U,  5 → T+5U,  8 → T+8U.
// The constant base means an unbroken run reads as one big piece, while a 0
// shows up as the break that ends a streak.
const T = 1.0                                  // width units of a 0-point fragment
const U = 1.0                                  // width units per point
const fragW = pts => T + pts * U

// Per-game point delta + cumulative points + cumulative bar-width, for every
// state 0..LEN (state 0 = pre-tournament, everyone at zero).
const DELTA = {}   // DELTA[name][g]  points won in game g (0,3,5,8)
const CUMPTS = {}  // CUMPTS[name][s] points after s games
const BARU = {}    // BARU[name][s]   bar width units after s games
for (const n of NAMES) {
  DELTA[n] = []; CUMPTS[n] = [0]; BARU[n] = [0]
  for (let g = 0; g < LEN; g++) {
    const cur = tracks[n][g]
    const prev = g === 0 ? 0 : tracks[n][g - 1]
    const d = cur - prev
    DELTA[n].push(d)
    CUMPTS[n].push(cur)
    BARU[n].push(BARU[n][g] + fragW(d))
  }
}

// Ranking per state — by points, then longer bar, then name (stable).
const RANK_AT = []
for (let s = 0; s <= LEN; s++) {
  const ordered = NAMES
    .map(n => ({ n, p: CUMPTS[n][s], b: BARU[n][s] }))
    .sort((a, b) => (b.p - a.p) || (b.b - a.b) || (a.n < b.n ? -1 : 1))
  const rank = {}
  ordered.forEach((o, i) => { rank[o.n] = i })
  RANK_AT.push(rank)
}

// Fixed axis — bars grow against the champion's final bar (never rescaled),
// with ~10% headroom so the leader's value label always has room on the right.
const AXIS_MAX = Math.ceil(Math.max(...NAMES.map(n => BARU[n][LEN])) * 1.1 / 40) * 40
const TICKS = []
for (let v = 0; v <= AXIS_MAX; v += 40) TICKS.push(v)

const VISIBLE = 12
const GAME_MS = 1300          // base time for one game (grow + reorder)
const GROW_FRAC = 0.5         // first half grows fragments, second half reorders

const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const easeOut = t => 1 - Math.pow(1 - t, 3)
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/* ───────────────────────── component ───────────────────────── */

export default function BarRaceX() {
  const [gabarito, setGabarito] = useState(null)
  const [pos, setPos] = useState(0)            // continuous position in [0, LEN] (1 unit = 1 game)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const posRef = useRef(0)
  const speedRef = useRef(1)
  speedRef.current = speed

  // Rows are sized to fill the available stage height so they never collide
  // with the footer, regardless of window height.
  const stageRef = useRef(null)
  const [stageH, setStageH] = useState(0)
  useEffect(() => {
    if (!gabarito) return
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setStageH(e.contentRect.height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [gabarito])

  useEffect(() => {
    firebase.database().ref(`${DATABASE_WC18}/master/gabarito`).once('value', snap => {
      const g = {}
      snap.forEach(c => { g[c.key] = c.val() })
      setGabarito(g)
      setPlaying(true)
    })
  }, [])

  useEffect(() => {
    if (!playing) return
    let raf
    let last = performance.now()
    const tick = now => {
      const dt = now - last
      last = now
      let next = posRef.current + (dt / GAME_MS) * speedRef.current
      if (next >= LEN) { next = LEN; setPlaying(false) }
      posRef.current = next
      setPos(next)
      if (next < LEN) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const setPosition = p => {
    const c = clamp(Number.isFinite(p) ? p : 0, 0, LEN)
    posRef.current = c
    setPos(c)
  }
  const restart = () => { setPosition(0); setPlaying(true) }
  const togglePlay = () => { if (pos >= LEN) { restart(); return } setPlaying(p => !p) }

  // ── derive the current frame ──
  const frame = useMemo(() => {
    const P = clamp(Number.isFinite(pos) ? pos : 0, 0, LEN)
    let g, grow, rankOf, ptsOf

    if (P >= LEN) {
      g = LEN - 1; grow = 1
      rankOf = n => RANK_AT[LEN][n]
      ptsOf = n => CUMPTS[n][LEN]
    } else {
      g = Math.floor(P)
      const local = P - g
      if (local < GROW_FRAC) {                 // phase 1 — grow fragment, hold order
        grow = easeOut(local / GROW_FRAC)
        rankOf = n => RANK_AT[g][n]
        ptsOf = n => lerp(CUMPTS[n][g], CUMPTS[n][g + 1], grow)
      } else {                                 // phase 2 — reorder, fragment full
        const st = easeInOut((local - GROW_FRAC) / (1 - GROW_FRAC))
        grow = 1
        rankOf = n => lerp(RANK_AT[g][n], RANK_AT[g + 1][n], st)
        ptsOf = n => CUMPTS[n][g + 1]
      }
    }

    const rows = []
    for (const n of NAMES) {
      const rank = rankOf(n)
      if (rank > VISIBLE) continue
      const curW = fragW(DELTA[n][g]) * grow
      const units = BARU[n][g] + curW          // bar length in axis units
      rows.push({ n, rank, pts: ptsOf(n), units, g, grow })
    }
    return rows
  }, [pos])

  const matchIdx = clamp(Number.isFinite(pos) ? Math.floor(pos) : 0, 0, LEN - 1)
  const match = MATCHES[matchIdx]
  const result = gabarito ? gabarito[match.id] : null

  if (!gabarito) return <div className="brx-root"><div className="brx-loading">Carregando…</div></div>

  const rowH = stageH > 0 ? stageH / VISIBLE : 46
  const barH = Math.max(16, Math.round(rowH * 0.5))

  return (
    <div className="brx-root">
      {/* header */}
      <div className="brx-header">
        <div className="brx-title">
          <span className="brx-kicker">Bolão dos Bolões</span>
          <span className="brx-h1">Copa do Mundo 2018 · Rússia</span>
          <span className="brx-sub">{NAMES.length} palpites · evolução da pontuação</span>
        </div>

        <div className="brx-matchwrap">
          <div className="brx-match" key={match.id}>
            <span className="brx-mabbr">{abbr(match.home.name)}</span>
            <span className={`brx-flag f-${match.home.iso2}`} />
            <span className="brx-score">
              {result ? result.h : '–'}<i>×</i>{result ? result.a : '–'}
            </span>
            <span className={`brx-flag f-${match.away.iso2}`} />
            <span className="brx-mabbr">{abbr(match.away.name)}</span>
          </div>
          <div className="brx-matchmeta">Jogo {matchIdx + 1} / {LEN} · {dayjs(match.date).format('DD MMM')}</div>
        </div>
      </div>

      {/* race */}
      <div className="brx-stage" ref={stageRef} style={{ '--row-h': `${rowH}px`, '--bar-h': `${barH}px` }}>
        <div className="brx-grid">
          {TICKS.map(v => (
            <div key={v} className={`brx-gridline${v === 0 ? ' zero' : ''}`} style={{ left: `${(v / AXIS_MAX) * 100}%` }} />
          ))}
        </div>

        <div className="brx-rows">
          {frame.map(r => {
            const lead = r.rank < 0.5
            const endPct = (r.units / AXIS_MAX) * 100
            return (
              <div className={`brx-row${lead ? ' lead' : ''}`} key={r.n} style={{ transform: `translateY(${r.rank * rowH}px)` }}>
                <span className="brx-rank">{Math.round(r.rank) + 1}<sup>º</sup></span>
                <div className="brx-track">
                  <span className="brx-name">{r.n}</span>
                  <div className="brx-barrow">
                    <div className="brx-bar">
                      {Array.from({ length: r.g + 1 }, (_, k) => {
                        const pts = DELTA[r.n][k]
                        const w = (k === r.g ? fragW(pts) * r.grow : fragW(pts)) / AXIS_MAX * 100
                        const chip = CHIP[pts]
                        return (
                          <span
                            key={k}
                            className={`brx-frag${chip.zero ? ' zero' : ''}`}
                            style={{ width: `${w}%`, background: chip.bg }}
                          />
                        )
                      })}
                    </div>
                    <span className="brx-val" style={{ left: `${endPct}%` }}>{Math.round(r.pts)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* controls */}
      <div className="brx-controls">
        <button className="brx-btn" onClick={togglePlay} title={playing ? 'Pausar' : 'Tocar'}>
          {playing ? '❚❚' : (pos >= LEN ? '↻' : '►')}
        </button>
        <button className="brx-btn" onClick={restart} title="Reiniciar">↻</button>

        <div className="brx-speed">
          {[1, 2, 4].map(s => (
            <button key={s} className={speed === s ? 'on' : ''} onClick={() => setSpeed(s)}>{s}×</button>
          ))}
        </div>

        <div
          className="brx-scrub"
          onPointerDown={e => {
            const el = e.currentTarget
            setPlaying(false)
            const move = ev => {
              const rect = el.getBoundingClientRect()
              setPosition(((ev.clientX - rect.left) / rect.width) * LEN)
            }
            move(e)
            const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
            window.addEventListener('pointermove', move)
            window.addEventListener('pointerup', up)
          }}
        >
          <div className="brx-scrub-track"><div className="brx-scrub-fill" style={{ width: `${(pos / LEN) * 100}%` }} /></div>
          <div className="brx-scrub-thumb" style={{ left: `${(pos / LEN) * 100}%` }} />
        </div>

        <span className="brx-count">Jogo {matchIdx + 1} de {LEN}</span>
      </div>
    </div>
  )
}
