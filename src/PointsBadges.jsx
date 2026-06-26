import React, { Component } from 'react'
import dayjs from 'dayjs'
import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import { CircularProgress } from '@mui/material'
import data from './data26.json'
import { DATABASE_ROOT_NODE } from './constants'
import { getCachedBids, fetchBids } from './bidsCache'
import { LanguageContext } from './i18n'
import './PointsBadges.css'

const BADGES = [
  { pts: 8, label: '8 pts', cls: 'pb-dot--8' },
  { pts: 5, label: '5 pts', cls: 'pb-dot--5' },
  { pts: 3, label: '3 pts', cls: 'pb-dot--3' },
]

const R = 3.8
const STEP = 9.7
const COLOR_GAP = 6
const COL_W = 14
const BAR_PAD = 5
const BAR_PAD_Y = 7
const BAR_X = x => x - COL_W / 2
const LEFT_PAD = 0
const RIGHT_PAD = 10
const TOP_PAD = 16
const BOTTOM_PAD = 18

function score(match, bid) {
  if (!bid) return null
  const rh = match.home_result
  const ra = match.away_result
  if (rh == null || ra == null || bid.h == null || bid.a == null) return null
  if (bid.h === rh && bid.a === ra) return 8
  if (rh - ra === bid.h - bid.a) return 5
  if (Math.sign(rh - ra) === Math.sign(bid.h - bid.a)) return 3
  return 0
}

export default class PointsBadges extends Component {
  static contextType = LanguageContext

  constructor(props) {
    super(props)
    const matches = Object.keys(data.groups)
      .map(group => data.groups[group].matches)
      .reduce((acc, groupMatches) => acc.concat(groupMatches), [])
      .sort((a, b) => {
        if (dayjs(a.date).isBefore(dayjs(b.date))) return -1
        if (dayjs(a.date).isAfter(dayjs(b.date))) return 1
        return 0
      })

    this.matches = matches
    this.teams = data.teams.reduce((acc, team) => {
      acc[team.id] = team
      return acc
    }, {})
    this.matchesRef = matches.reduce((acc, match, i) => {
      acc[match.name] = i
      return acc
    }, {})
    this.scrollRef = React.createRef()
    this.state = { games: [], render: false, query: '', highlightedGameId: null }
  }

  componentDidMount() {
    const matches = this.matches.map(match => ({ ...match }))
    this.workingMatches = matches
    this.bids = getCachedBids()

    this.ref1 = firebase.database().ref(`${DATABASE_ROOT_NODE}/master/gabarito`)
    this.ref1.on('child_removed', snapshot => {
      const match = matches[this.matchesRef[snapshot.key]]
      if (match) {
        match.home_result = null
        match.away_result = null
      }
      this.recompute()
    })

    this.ref2 = firebase.database().ref(`${DATABASE_ROOT_NODE}/master/gabarito`)
    this.ref2.on('value', snapshot => {
      const results = {}
      snapshot.forEach(childSnapshot => {
        results[childSnapshot.key] = childSnapshot.val()
      })
      Object.keys(results).forEach(key => {
        const match = matches[this.matchesRef[key]]
        if (!match) return
        const result = results[key]
        match.away_result = result.a == undefined ? null : result.a
        match.home_result = result.h == undefined ? null : result.h
      })
      this.resultsReady = true
      this.recompute()
    })

    fetchBids().then(games => {
      this.bids = games
      this.recompute()
    })
  }

  componentWillUnmount() {
    if (this.ref1) this.ref1.off('child_removed')
    if (this.ref2) this.ref2.off('value')
  }

  calculatePosition(sortedGames) {
    if (sortedGames.length <= 0) return
    let k = 1
    let pos = 1
    let total = sortedGames[0].total
    sortedGames.forEach(game => {
      if (game.total !== total) {
        pos = k
        total = game.total
      }
      game.position = pos
      k++
    })
  }

  buildGames() {
    const games = this.bids.map(game => {
      const enriched = { ...game }
      const counts = { 8: 0, 5: 0, 3: 0 }
      let total = 0
      this.workingMatches.forEach(match => {
        const pts = score(match, game[match.name])
        if (game[match.name]) enriched[match.name] = { ...game[match.name], pts }
        if (pts == null) return
        total += pts
        if (counts[pts] != null) counts[pts] += 1
      })
      return {
        ...enriched,
        gameId: game.gameId,
        name: game.name,
        counts,
        total,
        badgeCount: counts[8] + counts[5] + counts[3],
      }
    }).sort((a, b) => {
      const diff = b.total - a.total
      if (diff !== 0) return diff
      const nameA = a.name.toUpperCase()
      const nameB = b.name.toUpperCase()
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    })
    this.calculatePosition(games)
    return games
  }

  recompute = () => {
    if (!this.bids || !this.resultsReady) return
    const games = this.buildGames()
    this.setState(prev => {
      const highlightedStillExists = games.some(game => game.gameId === prev.highlightedGameId)
      return {
        games,
        render: true,
        highlightedGameId: highlightedStillExists ? prev.highlightedGameId : null,
      }
    })
  }

  findGame(query) {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return this.state.games.find(game => game.name.toLowerCase().includes(q)) || null
  }

  scrollToGame(game) {
    const el = this.scrollRef.current
    if (!el || !game) return
    const idx = this.state.games.findIndex(item => item.gameId === game.gameId)
    if (idx < 0) return
    const x = LEFT_PAD + idx * COL_W + COL_W / 2
    el.scrollTo({
      left: Math.max(0, x - el.clientWidth * 0.5),
      behavior: 'smooth',
    })
  }

  searchParticipant = event => {
    const query = event.target.value
    const match = this.findGame(query)
    this.setState({ query, highlightedGameId: match ? match.gameId : null }, () => {
      if (match) this.scrollToGame(match)
    })
  }

  selectGame = game => {
    this.setState({ query: game.name, highlightedGameId: game.gameId }, () => {
      this.scrollToGame(game)
    })
  }

  stackHeight(game) {
    const groups = BADGES.filter(badge => game.counts[badge.pts] > 0).length
    return Math.max(0, (game.badgeCount - 1) * STEP + Math.max(0, groups - 1) * COLOR_GAP)
  }

  renderDots(game, x, baseline, maxBadges) {
    let offset = 0
    let colorGap = 0
    return BADGES.map(badge => {
      const dots = []
      if (offset > 0 && game.counts[badge.pts] > 0) colorGap += COLOR_GAP
      for (let i = 0; i < game.counts[badge.pts]; i++) {
        const y = baseline - ((offset + i) * STEP + colorGap)
        const indexFromBottom = offset + i
        dots.push(
          <circle
            className={`pb-dot ${badge.cls}`}
            key={`${game.gameId}-${badge.pts}-${i}`}
            cx={x}
            cy={y}
            r={R}
          />
        )
      }
      offset += game.counts[badge.pts]
      return dots
    })
  }

  render() {
    const { t } = this.context
    if (!this.state.render) {
      return <div className="pb-root pb-loading"><CircularProgress size={54} thickness={6} /></div>
    }

    const games = this.state.games
    const maxBadges = Math.max(1, ...games.map(game => game.badgeCount))
    const maxStackH = Math.max(0, ...games.map(game => this.stackHeight(game)))
    const chartH = Math.max(430, TOP_PAD + BOTTOM_PAD + maxStackH)
    const chartW = LEFT_PAD + RIGHT_PAD + Math.max(1, games.length) * COL_W
    const baseline = chartH - BOTTOM_PAD
    const matchedGame = this.state.highlightedGameId
      ? games.find(game => game.gameId === this.state.highlightedGameId)
      : null
    const searching = this.state.query.trim().length > 0
    const selectedGuideY = matchedGame
      ? baseline - this.stackHeight(matchedGame) - R
      : null

    return (
      <div className="pb-root">
        <div className="pb-top">
          <div className={`pb-search${matchedGame ? ' pb-search--matched' : ''}`}>
            <span className="pb-search-icon">search</span>
            <input
              className="pb-search-input"
              type="text"
              value={this.state.query}
              onChange={this.searchParticipant}
              placeholder={t('ranking.search')}
            />
            {matchedGame && (
              <button className="pb-search-result" type="button" onClick={() => this.scrollToGame(matchedGame)}>
                <span className="pb-search-rank">{matchedGame.position}o</span>
                <span className="pb-search-name">{matchedGame.name}</span>
                <span className="pb-search-points">{matchedGame.total}</span>
              </button>
            )}
            {searching && !matchedGame && <span className="pb-search-empty">{t('ranking.noResults')}</span>}
            {searching && (
              <button
                className="pb-search-clear"
                type="button"
                onClick={() => this.setState({ query: '', highlightedGameId: null })}
                aria-label="clear"
              >
                close
              </button>
            )}
          </div>
        </div>
        <div className={`pb-scroll${matchedGame ? ' pb-scroll--searching' : ''}`} ref={this.scrollRef}>
          <svg className="pb-svg" width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} role="img" aria-label={t('badges.title')}>
            {selectedGuideY != null && (
              <line className="pb-selected-guide" x1={0} x2={chartW} y1={selectedGuideY} y2={selectedGuideY} />
            )}
            {games.map((game, i) => {
              const x = LEFT_PAD + i * COL_W + COL_W / 2
              const topDotY = baseline - this.stackHeight(game)
              const towerTop = topDotY - R - BAR_PAD_Y
              const bgY = Math.max(2, towerTop)
              const bgBottom = baseline + R + BAR_PAD_Y
              const highlighted = this.state.highlightedGameId === game.gameId
              return (
                <g
                  className={`pb-player${highlighted ? ' pb-player--highlight' : ''}`}
                  key={game.gameId || game.name}
                  onClick={() => this.selectGame(game)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      this.selectGame(game)
                    }
                  }}
                  role="link"
                  tabIndex="0"
                >
                  <rect className="pb-hit" x={BAR_X(x)} y={Math.max(0, towerTop - 8)} width={COL_W} height={baseline - towerTop + 42} />
                  <rect className="pb-col-bg" x={BAR_X(x)} y={bgY} width={COL_W} height={bgBottom - bgY} rx={7.5} />
                  {this.renderDots(game, x, baseline, maxBadges)}
                  <title>{`${game.position}o ${game.name}: ${game.total} pts, ${game.counts[8]}x8, ${game.counts[5]}x5, ${game.counts[3]}x3`}</title>
                </g>
              )
            })}
          </svg>
        </div>
        {matchedGame && (
          <button className="pb-selected" type="button" onClick={() => this.scrollToGame(matchedGame)}>
            <span className="pb-selected-main">
              <span className="pb-selected-name">{matchedGame.name}</span>
              <span className="pb-selected-badges">
                {BADGES.map(badge => (
                  <span className="pb-selected-badge" key={badge.pts}>
                    <span className="pb-selected-count">{matchedGame.counts[badge.pts]}</span>
                    <span className="pb-selected-times">×</span>
                    <span className={`pb-selected-chip pb-selected-chip--${badge.pts}`}>{badge.pts}</span>
                  </span>
                ))}
              </span>
            </span>
            <span className="pb-selected-score">
              <span className="pb-selected-rank">{matchedGame.position}o</span>
              <span>
                <span className="pb-selected-points">{matchedGame.total}</span>
                <span className="pb-selected-label">{t('card.points')}</span>
              </span>
            </span>
          </button>
        )}

      </div>
    )
  }
}
