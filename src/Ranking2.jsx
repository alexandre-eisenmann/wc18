import React, { Component, Suspense } from "react"
import data from './data26.json'
import gamesFromFile from './games26.json'
import dayjs from 'dayjs'
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Icon } from '@mui/material'
import { orange } from '@mui/material/colors'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'
import './flags.css'
import './index.css'
import { DATABASE_ROOT_NODE } from "./constants"
import { getCachedBids, fetchBids } from './bidsCache'
import { LanguageContext } from './i18n'

// Lazily loaded so the card's code/styles never weigh on the leaderboard's
// initial render — it's only fetched the first time a player name is tapped.
const PlayerCard = React.lazy(() => import('./PlayerCard'))

// Same deal for the match bid-distribution card (plus its MatchViz / react-move
// payload) — only fetched the first time a match header column is tapped.
const MatchCard = React.lazy(() => import('./MatchCard'))

const orange200 = orange[200]

const provider = new firebase.auth.GoogleAuthProvider()

// Layout tuning for the horizontally-scrollable match grid.
const COLW = 34            // width of one match column (px)
const LEFT_W = 150         // width of the sticky player column (px)

// How long after kickoff a match is treated as "live" (in progress). Group
// stage has no extra time / penalties, so 90' + halftime + stoppage lands
// comfortably under this, with a little slack for the final score to be fed.
const LIVE_WINDOW_MIN = 120

// Points chip palette, keyed by points earned. Emerald 8 -> purple 5 -> blue 3,
// matching the player card; 0 stays a faint hollow chip. The deep emerald sits
// in the same jewel-tone family as the purple/blue and stays distinct from the
// pink brand accent (boundary line + totals).
const PTS_BG = { 8: "#0aa85e", 5: "#7c4dff", 3: "#1e88e5", 0: "transparent" }
const PTS_FG = { 8: "#ffffff", 5: "#ffffff", 3: "#ffffff", 0: "rgba(0,0,0,.32)" }

// Pre-built style objects so cells don't allocate a new object on every render
// (the grid is hundreds of players x 72 columns).
// Tiered saliency: value maps to visual weight, not just hue, in three steps.
// 8 (most valuable) is loudest — the most vibrant, saturated solid (emerald).
// 5 and 3 are flat solids that step down (blue, then a fader purple), all
// with white numbers, so each rung reads quieter than the one above while
// staying legible.
const CHIP_STYLE = {
  8: { background: PTS_BG[8], color: PTS_FG[8] },
  5: { background: '#5891d6', color: '#ffffff' },
  3: { background: '#a78fd4', color: '#ffffff' },
  0: { background: PTS_BG[0], color: PTS_FG[0], boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.16)' },
}
const PRED_LIVE = { opacity: 1 }
const PRED_PLAYED = { opacity: 0.45 }

export default class Ranking2 extends Component {

  static contextType = LanguageContext

  constructor(props) {
    super(props)

    const matches = Object.keys(data.groups).map((group) => data.groups[group].matches).reduce((acc, ele) => acc.concat(ele), [])
    const sortedMatches = matches.sort((a, b) => {
      if (dayjs(a.date).isBefore(dayjs(b.date))) return -1
      else if (dayjs(a.date).isAfter(dayjs(b.date))) return 1
      return 0
    })
    this.matchesRef = sortedMatches.reduce((acc, ele, i) => { acc[ele.name] = i; return acc }, {})
    this.matches = sortedMatches
    this.teams = data.teams.reduce((acc, ele) => { acc[ele.id] = ele; return acc }, {})
    this.scrollRef = React.createRef()
    this.searchRef = React.createRef()
    this.state = {
      mygames: [], pins: [], logged: null, user: null,
      games: gamesFromFile, matches: this.matches,
      query: '',
      searchActive: false,
      myBidsReady: false,
      myBidsCollapsed: false,
      render: false,
      cardGame: null,
      cardMatch: null,
      pendingUnpinGame: null,
    }
  }

  // Mount the real text input only while searching; the rest of the time a
  // non-editable placeholder stands in. This stops iOS "Shake to Undo" from
  // popping up while scrolling (it targets any live editable text field).
  activateSearch = () => {
    this.setState({ searchActive: true }, () => {
      if (this.searchRef.current) this.searchRef.current.focus()
    })
  }

  calculatePosition(sortedGames) {
    if (sortedGames.length <= 0) return
    let k = 1
    let pos = 1
    let total = sortedGames[0].total
    sortedGames.map((game) => {
      if (game.total !== total) {
        pos = k
        total = game.total
      }
      game.position = pos
      k++
    })
  }

  calculate(games, matches) {
    games.map((game) => {
      let total = 0
      matches.map((match) => {
        const rh = match.home_result
        const ra = match.away_result
        if (rh != null && ra != null) {
          const h = game[match.name].h
          const a = game[match.name].a
          if (h === rh && a === ra) {
            game[match.name].pts = 8
          } else if (rh - ra === h - a) {
            game[match.name].pts = 5
          } else if (Math.sign(rh - ra) === Math.sign(h - a)) {
            game[match.name].pts = 3
          } else {
            game[match.name].pts = 0
          }
          total += game[match.name].pts || 0
        }
      })
      game["total"] = total
    })
  }

  componentWillUnmount() {
    if (this.ref) this.ref.off('value')
    if (this.ref1) this.ref1.off('value')
    if (this.ref2) this.ref2.off('value')
    if (this.ref3) this.ref3.off('value')
    if (this.unsubscribe) this.unsubscribe()
    if (this._myBidsTimer) clearTimeout(this._myBidsTimer)
    if (this._liveTimer) clearInterval(this._liveTimer)
  }

  componentDidMount() {
    const self = this
    const matches = [...this.matches]
    this.workingMatches = matches

    // Frozen bids are the heavy payload; render from the localStorage cache
    // immediately when present, fetch once in the background, then recompute
    // scores locally on every result change (no re-downloading the database).
    this.bids = getCachedBids()

    // Safety net so the "Meus Jogos" spinner never spins forever if a listener
    // is slow; flips the band to its (possibly empty) ready state.
    this._myBidsTimer = setTimeout(() => {
      self._myGamesFired = true
      self._pinsFired = true
      self.markMyBidsReady()
    }, 4000)

    this.unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        self.setState({ logged: true, user: user })
        self.ref = firebase.database().ref(`${DATABASE_ROOT_NODE}/${user.uid}`)
        self.ref.on('value', snapshot => {
          const bids = {}
          snapshot.forEach(function (childSnapshot) {
            bids[childSnapshot.key] = childSnapshot.val()
          })
          self._myGamesFired = true
          self.setState({ mygames: bids })
          self.markMyBidsReady()
        })
        self.ref3 = firebase.database().ref(`${DATABASE_ROOT_NODE}/pins/${user.uid}`)
        self.ref3.on('value', snapshot => {
          const pins = []
          snapshot.forEach(function (childSnapshot) {
            pins.push(childSnapshot.key)
          })
          self._pinsFired = true
          self.setState({ pins: pins })
          self.markMyBidsReady()
        })
      } else {
        self.setState({ logged: false, user: null })
      }
    })

    self.ref1 = firebase.database().ref(`${DATABASE_ROOT_NODE}/master/gabarito`)
    self.ref1.on('child_removed', function (data) {
      matches[self.matchesRef[data.key]].away_result = null
      matches[self.matchesRef[data.key]].home_result = null
      self.recompute()
    })
    self.ref2 = firebase.database().ref(`${DATABASE_ROOT_NODE}/master/gabarito`)
    self.ref2.on('value', snapshot => {
      const results = {}
      snapshot.forEach(function (childSnapshot) {
        results[childSnapshot.key] = childSnapshot.val()
      })
      Object.keys(results).map((key) => {
        const result = results[key]
        matches[self.matchesRef[key]].away_result = result.a == undefined ? null : result.a
        matches[self.matchesRef[key]].home_result = result.h == undefined ? null : result.h
      })
      self.resultsReady = true
      self.recompute()
    })

    fetchBids().then((games) => {
      self.bids = games
      self.recompute()
    })

    // Re-evaluate which games are "live" as the clock moves. The pulse itself is
    // pure CSS; this only flips columns into/out of the live state at kickoff and
    // when the live window closes. A minute's granularity is plenty and keeps the
    // big grid from re-reconciling more often than needed.
    this._liveTimer = setInterval(() => {
      if (this.state.render) this.forceUpdate()
    }, 60000)
  }

  // Recompute scores from the in-memory bids + latest results, then re-render.
  // No network. No-ops until both bids and results are available. Paints the
  // leaderboard as soon as scores exist — the "Meus Jogos" band loads its own
  // data behind a spinner, so nothing blocks the first frame.
  recompute = () => {
    if (!this.bids || !this.resultsReady) return
    const matches = this.workingMatches
    const games = this.bids
    this.calculate(games, matches)
    const sortedGames = games.slice().sort((a, b) => {
      const diff = b.total - a.total
      if (diff !== 0) return diff
      const nameA = a.name.toUpperCase()
      const nameB = b.name.toUpperCase()
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    })
    this.calculatePosition(sortedGames)
    this.setState({ games: sortedGames, matches: matches, render: true }, () => {
      if (!this._scrolled) {
        this._scrolled = true
        requestAnimationFrame(this.scrollToCurrent)
      }
    })
  }

  toggleMyBids = () => this.setState((s) => ({ myBidsCollapsed: !s.myBidsCollapsed }))

  // The "Meus Jogos" section band, clickable to collapse/expand its rows. The
  // label + caret stay pinned left so the control is reachable at any scroll.
  renderMyBidsBand() {
    const { t } = this.context
    return (
      <div className="r2-band r2-band--mine r2-band--toggle" onClick={this.toggleMyBids}>
        <span className="r2-band-l">
          <Icon className="r2-band-caret">{this.state.myBidsCollapsed ? 'chevron_right' : 'expand_more'}</Icon>
          {t('ranking.myBidsHeader')}
        </span>
      </div>
    )
  }

  // The "Meus Jogos" band is ready once both the user's bids and pins have
  // arrived (each Firebase listener fires once, even when empty).
  markMyBidsReady = () => {
    if (this._myGamesFired && this._pinsFired && !this.state.myBidsReady) {
      this.setState({ myBidsReady: true })
    }
  }

  // Index of the first not-yet-played match, or matches.length if all played.
  boundaryIndex(matches) {
    const i = matches.findIndex((m) => m.home_result == null && m.away_result == null)
    return i < 0 ? matches.length : i
  }

  // A match is "live" while now sits inside the window that opens at kickoff —
  // purely time-based. We can't key off the result, because the admin enters the
  // running score during play (e.g. a live 1-0), so a present score is not proof
  // the match is over. Kickoff (`m.date`) carries an explicit UTC offset and
  // dayjs comparisons run on the absolute epoch instant, so this is
  // timezone-safe regardless of the viewer's local clock.
  isLive(m) {
    const kickoff = dayjs(m.date)
    const now = dayjs()
    return !now.isBefore(kickoff) && now.isBefore(kickoff.add(LIVE_WINDOW_MIN, 'minute'))
  }

  // Park the horizontal scroll so recent results lead into the upcoming games,
  // with the pink boundary line roughly centered. How many past columns we
  // reveal scales with the viewport: ~half the visible match columns, so a
  // phone opens on ~3 past games (line centered) while a wide desktop shows
  // far more history. Older matches stay off-screen to the left (still
  // scrollable), so weeks into the tournament the view still opens on "now".
  scrollToCurrent = () => {
    const el = this.scrollRef.current
    if (!el) return
    const matches = this.state.matches
    const boundary = this.boundaryIndex(matches)
    if (boundary <= 0) { el.scrollLeft = 0; return }
    // Width of the scrollable match area (viewport minus the sticky player
    // column) and how many whole columns fit in it.
    const matchAreaW = el.clientWidth - LEFT_W
    const visibleCols = Math.max(1, Math.floor(matchAreaW / COLW))
    // Past columns to show left of the line: half the visible width centers it.
    let pastVisible = Math.floor(visibleCols / 2)
    // But never cut the last played match-day in half — reveal it whole even if
    // that nudges the line a column or two right of center (days can hold 4
    // games, so on a phone this is the "show the full last day" case).
    const lastDay = dayjs(matches[boundary - 1].date)
    let dayStart = boundary - 1
    while (dayStart > 0 && dayjs(matches[dayStart - 1].date).isSame(lastDay, 'day')) dayStart--
    pastVisible = Math.max(pastVisible, boundary - dayStart)
    const start = Math.max(0, boundary - pastVisible)
    el.scrollLeft = start * COLW
  }

  pin(gameId) {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/pins/${this.state.user.uid}/${gameId}`).set(true)
  }

  unpin(gameId) {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/pins/${this.state.user.uid}/${gameId}`).remove()
  }

  requestUnpin(game) {
    this.setState({ pendingUnpinGame: game })
  }

  cancelUnpin = () => {
    this.setState({ pendingUnpinGame: null })
  }

  confirmUnpin = () => {
    if (this.state.pendingUnpinGame) this.unpin(this.state.pendingUnpinGame.gameId)
    this.setState({ pendingUnpinGame: null })
  }

  // Follow / unfollow (eye) control for the player column. "Following" a player
  // keeps them in the "My bids" band up top. Pin storage is reused unchanged.
  renderFollow(game, bandPinned) {
    const following = this.state.pins.includes(game.gameId)
    // In the "My bids" band, own (un-followed) bids show no toggle.
    if (bandPinned && !following) return null
    const onClick = e => {
      e.stopPropagation()
      if (following) this.requestUnpin(game)
      else this.pin(game.gameId)
    }
    return (
      <span className="r2-eyewrap" onClick={onClick}>
        {following
          ? <Icon className="r2-eye r2-eye--on">visibility</Icon>
          : <Icon baseClassName="material-icons-outlined" className="r2-eye">visibility</Icon>}
      </span>
    )
  }

  // One match column for a player: the prediction, plus a points chip once
  // played. `live` is precomputed once per column by render() (not per cell —
  // the grid is hundreds of rows wide) and breathes the whole column pink.
  renderCell(game, m, i, boundary, rowKey, live) {
    const bid = game[m.name]
    const played = m.home_result != null && m.away_result != null
    const cls = `r2-col${i === boundary ? ' r2-col--boundary' : ''}${i < boundary ? ' r2-col--played' : ''}${live ? ' r2-col--live' : ''}`
    return (
      <div className={cls} key={`${rowKey}-c${i}`}>
        <span className="r2-pred" style={played ? PRED_PLAYED : PRED_LIVE}>{bid ? `${bid.h}-${bid.a}` : '·'}</span>
        {played && bid && (
          <span className="r2-chip" style={CHIP_STYLE[bid.pts]}>{bid.pts}</span>
        )}
      </div>
    )
  }

  // A full player line: sticky identity column + every match column.
  // showMeta hides the rank/points on tied rows so a block of ties reads once.
  renderRow(game, key, boundary, opts, liveFlags) {
    const { pinned, showMeta, divider } = opts
    const rowBg = pinned ? '#e9fbff' : '#ffffff'
    return (
      <div className={`r2-row${divider ? ' r2-row--div' : ''}`} key={key} style={{ background: rowBg }}>
        <div className="r2-idcol r2-idcol--click" style={{ background: rowBg }} onClick={() => this.setState({ cardGame: game })}>
          <span className="r2-meta">
            {showMeta && <>
              <span className="r2-pos">{game.position}<sup>o</sup></span>
              <span className="r2-tot">{game.total ? game.total : 0}</span>
            </>}
          </span>
          <span className="r2-idmain">
            <span className="r2-nm" title={game.name}>{game.name}</span>
            {this.state.logged && this.renderFollow(game, pinned)}
          </span>
        </div>
        {this.state.matches.map((m, i) => this.renderCell(game, m, i, boundary, key, liveFlags[i]))}
      </div>
    )
  }

  // Three-letter team code from the country name (with a few overrides).
  abbr(name) {
    const overrides = { "DR Congo": "DRC" }
    return (overrides[name] || name.substring(0, 3)).toUpperCase()
  }

  // Header column: home code / home flag / away flag / away code, then the
  // bottom line. While live (kickoff window open) the column breathes pink and
  // shows either the running score with a pulsing dot, or a LIVE badge if no
  // score is in yet — making clear the figure isn't final. Otherwise it's the
  // settled score (played) or the kickoff date (upcoming).
  renderHeaderCell(m, i, boundary, live) {
    const played = m.home_result != null && m.away_result != null
    const home = this.teams[m.home_team]
    const away = this.teams[m.away_team]
    const cls = `r2-hcol r2-hcol--tap${i === boundary ? ' r2-col--boundary' : ''}${live ? ' r2-hcol--live' : ''}`
    return (
      <div className={cls} key={`h${i}`} onClick={() => this.setState({ cardMatch: m })}>
        <span className="r2-habbr">{this.abbr(home.name)}</span>
        <span className={`r2-hflag f-${home.iso2}`} title={home.name} />
        <span className={`r2-hflag f-${away.iso2}`} title={away.name} />
        <span className="r2-habbr">{this.abbr(away.name)}</span>
        {live
          ? (played
              ? <span className="r2-hlive r2-hlive--score" title={this.context.t('ranking.live')}><span className="r2-hlive-dot" />{m.home_result}-{m.away_result}</span>
              : <span className="r2-hlive" title={this.context.t('ranking.live')}>{this.context.t('ranking.live')}</span>)
          : played
            ? <span className="r2-hres">{m.home_result}-{m.away_result}</span>
            : <span className="r2-hdate">{dayjs(m.date).format('D/M')}</span>}
      </div>
    )
  }

  render() {
    if (!this.state.render) {
      return <div style={{ backgroundColor: "white", textAlign: "center", marginTop: "10%", width: "100%" }}><CircularProgress size={60} thickness={7} /></div>
    }

    const { t } = this.context
    const self = this
    const matches = this.state.matches
    const boundary = this.boundaryIndex(matches)
    // Which columns are live right now — evaluated once here and reused by the
    // header and every player row, so isLive isn't called per cell.
    const liveFlags = matches.map((m) => this.isLive(m))
    const gridW = LEFT_W + matches.length * COLW
    const q = this.state.query.trim().toLowerCase()
    const filtering = q.length > 0

    // ---- My bids + pinned rows (hidden while searching, to focus results) ----
    const pinnedKeys = [...new Set([...Object.keys(self.state.mygames), ...self.state.pins])]
    const myrows = []
    if (!filtering) {
      this.state.games.forEach((game, i) => {
        if (pinnedKeys.includes(game.gameId)) {
          myrows.push(this.renderRow(game, `my${i}`, boundary, { pinned: true, showMeta: true }, liveFlags))
        }
      })
    }

    // ---- Full leaderboard. A hairline divides each tied-position block; while
    // filtering, every matching row is standalone (meta + divider on each). ----
    const rows = []
    let lastPosition = 0
    let firstShown = true
    this.state.games.forEach((game, i) => {
      const blockStart = game.position !== lastPosition
      lastPosition = game.position
      if (filtering && !game.name.toLowerCase().includes(q)) return
      const showMeta = filtering ? true : blockStart
      const divider = filtering ? !firstShown : (blockStart && i > 0)
      firstShown = false
      rows.push(this.renderRow(game, `lb${i}`, boundary, { showMeta, divider }, liveFlags))
    })

    return (
      <div className="r2-root">
        {this.state.logged === false && <div style={{ background: orange200, textAlign: "center", fontSize: "14px", padding: "8px" }}>
          <div>
            <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => { firebase.auth().signInWithPopup(provider) }}>
              {t('auth.login')}
            </span><span>{t('auth.loginToPinFriendsPre')}<i>{t('auth.loginToPinFriendsAction')}</i>{t('auth.loginToPinFriendsPost')}</span>
          </div>
        </div>}

        <div className="r2-search" onClick={() => { if (!this.state.searchActive) this.activateSearch() }}>
          <Icon className="r2-search-ic">search</Icon>
          {this.state.searchActive
            ? <input
                ref={this.searchRef}
                className="r2-search-in"
                type="text"
                value={this.state.query}
                onChange={(e) => this.setState({ query: e.target.value })}
                onBlur={() => this.setState({ searchActive: false })}
                placeholder={t('ranking.search')}
              />
            : <span className="r2-search-ph" style={{ color: this.state.query ? '#1c2127' : '#aeb4bd' }}>
                {this.state.query || t('ranking.search')}
              </span>}
          {filtering && <Icon className="r2-search-x" onClick={(e) => { e.stopPropagation(); this.setState({ query: '', searchActive: false }) }}>close</Icon>}
        </div>

        <div className="r2-scroll" ref={this.scrollRef}>
          <div className="r2-grid" style={{ minWidth: gridW }}>
            <div className="r2-row r2-head">
              <div className="r2-idcol r2-corner">
                <span className="r2-corner-pts">{t('ranking.ptsShort')}</span>
                <span className="r2-corner-name">{t('ranking.participant')}</span>
              </div>
              {matches.map((m, i) => this.renderHeaderCell(m, i, boundary, liveFlags[i]))}
            </div>

            {!filtering && this.state.logged && (
              this.state.myBidsReady
                ? (myrows.length > 0 && <>
                    {this.renderMyBidsBand()}
                    {!this.state.myBidsCollapsed && myrows}
                  </>)
                : <>
                    {this.renderMyBidsBand()}
                    {!this.state.myBidsCollapsed && <div className="r2-myloading"><span className="r2-myloading-in"><CircularProgress size={18} thickness={5} sx={{ color: '#0f9fba' }} /></span></div>}
                  </>
            )}

            <div className="r2-band r2-band--all"><span className="r2-band-l">{t('ranking.leaderboardHeader')}<span className="r2-band-count">{t('ranking.bidsCount', { count: this.state.games.length })}</span></span></div>
            {rows}
            {filtering && rows.length === 0 && (
              <div className="r2-empty"><span className="r2-empty-l">{t('ranking.noResults')}</span></div>
            )}
          </div>
        </div>

        {this.state.cardGame && (
          <Suspense fallback={null}>
            <PlayerCard
              game={this.state.cardGame}
              matches={this.state.matches}
              teams={this.teams}
              t={t}
              onClose={() => this.setState({ cardGame: null })}
            />
          </Suspense>
        )}

        {this.state.cardMatch && (
          <Suspense fallback={null}>
            <MatchCard
              match={this.state.cardMatch}
              teams={this.teams}
              bids={this.bids}
              t={t}
              onClose={() => this.setState({ cardMatch: null })}
            />
          </Suspense>
        )}

        <Dialog open={Boolean(this.state.pendingUnpinGame)} onClose={this.cancelUnpin}>
          <DialogTitle>{t('ranking.unwatchTitle', { name: this.state.pendingUnpinGame ? this.state.pendingUnpinGame.name : '' })}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('ranking.unwatchContent')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.cancelUnpin}>{t('auth.cancel')}</Button>
            <Button color="secondary" onClick={this.confirmUnpin}>{t('ranking.unwatchConfirm')}</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}
