import React, { Component } from "react"
import data from './data26.json'
import gamesFromFile from './games26.json'
import dayjs from 'dayjs'
import { CircularProgress, IconButton, Icon } from '@mui/material'
import { blue, grey, orange, cyan, pink } from '@mui/material/colors'
import firebase from 'firebase/compat/app'
import './flags.css'
import './index.css'
import { easeExpInOut } from 'd3'
import { Animate } from "react-move"
import { DATABASE_ROOT_NODE } from "./constants"
import { LanguageContext } from './i18n'

const blue500 = blue[500]
const grey400 = grey[400]
const orange200 = orange[200]
const cyan500 = cyan[500]
const cyan600 = cyan[600]
const pink500 = pink[500]

const provider = new firebase.auth.GoogleAuthProvider()

export default class Ranking extends Component {

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
    this.matchesInvRef = sortedMatches.reduce((acc, ele, i) => { acc[i] = ele.name; return acc }, {})
    this.matches = sortedMatches
    this.teams = data.teams.reduce((acc, ele) => { acc[ele.id] = ele; return acc }, {})
    this.state = { mygames: [], pins: [], logged: null, user: null, games: gamesFromFile, matches: this.matches, expanded: true, updating: false, render: false }
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
    this.unsubscribe()
  }

  componentDidMount() {
    const self = this
    const matches = [...this.matches]

    this.unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        self.setState({ logged: true, user: user })
        self.ref = firebase.database().ref(`${DATABASE_ROOT_NODE}/${user.uid}`)
        self.ref.on('value', snapshot => {
          const bids = {}
          snapshot.forEach(function (childSnapshot) {
            bids[childSnapshot.key] = childSnapshot.val()
          })
          self.setState({ mygames: bids })
        })
        self.ref3 = firebase.database().ref(`${DATABASE_ROOT_NODE}/pins/${user.uid}`)
        self.ref3.on('value', snapshot => {
          const pins = []
          snapshot.forEach(function (childSnapshot) {
            pins.push(childSnapshot.key)
          })
          self.setState({ pins: pins })
        })
      } else {
        self.setState({ logged: false, user: null })
      }
    })

    self.ref1 = firebase.database().ref(`${DATABASE_ROOT_NODE}/master/gabarito`)
    self.ref1.on('child_removed', function (data) {
      matches[self.matchesRef[data.key]].away_result = null
      matches[self.matchesRef[data.key]].home_result = null
      self.setState({ updating: true })
      self.loadGames(matches)
    })
    self.ref2 = firebase.database().ref(`${DATABASE_ROOT_NODE}/master/gabarito`)
    self.ref2.on('value', snapshot => {
      const results = {}
      self.setState({ updating: true })
      snapshot.forEach(function (childSnapshot) {
        results[childSnapshot.key] = childSnapshot.val()
      })
      Object.keys(results).map((key) => {
        const result = results[key]
        matches[self.matchesRef[key]].away_result = result.a == undefined ? null : result.a
        matches[self.matchesRef[key]].home_result = result.h == undefined ? null : result.h
      })
      self.loadGames(matches)
    })
  }

  expandOrCollapse = () => {
    if (this.state.expanded)
      document.getElementsByClassName("header")[0].style.display = "none"
    else
      document.getElementsByClassName("header")[0].style.display = "block"
    this.setState({ expanded: !this.state.expanded })
  }

  loadGames = (matches) => {
    const games = []
    firebase.database().ref(`${DATABASE_ROOT_NODE}`).once('value', snapshot => {
      snapshot.forEach(function (childSnapshot) {
        const childData = childSnapshot.val()
        Object.keys(childData).map((key) => {
          const details = childData[key]
          if (details.status === "payed") {
            Object.assign(details, { gameId: key, userId: childSnapshot.key })
            games.push(details)
          }
        })
      })
      this.calculate(games, matches)
      const sortedGames = games.sort((a, b) => {
        const diff = b.total - a.total
        if (diff !== 0) return diff
        const nameA = a.name.toUpperCase()
        const nameB = b.name.toUpperCase()
        if (nameA < nameB) return -1
        if (nameA > nameB) return 1
        return 0
      })
      this.calculatePosition(sortedGames)
      this.setState({ games: sortedGames, matches: matches, render: true, updating: false })
    })
  }

  renderCircle(pts, j, i, colors, strokeColor) {
    const k = Math.floor(j / 24)
    const kj = j % 24
    return (
      <Animate
        key={`c${i}-${j}`}
        start={{ x: 2000, y: 36 }}
        enter={{
          x: [15 + kj * 12],
          y: [36 + k * 12],
          timing: { delay: i * 500 + 750 + j * 80, duration: 1500, ease: easeExpInOut },
        }}
      >
        {(state) => {
          const { x, y } = state
          return <circle cx={x} cy={y} r={5} stroke={strokeColor[pts]} strokeWidth={1} fill={colors[pts]} />
        }}
      </Animate>
    )
  }

  pin(gameId) {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/pins/${this.state.user.uid}/${gameId}`).set(true)
  }

  unpin(gameId) {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/pins/${this.state.user.uid}/${gameId}`).remove()
  }

  render() {
    if (!this.state.render) {
      return <div style={{ backgroundColor: "white", textAlign: "center", marginTop: "10%", width: "100%" }}><CircularProgress size={60} thickness={7} /></div>
    }

    const { t } = this.context
    const self = this
    const rows = []
    const myrows = []
    const offset = Object.keys(self.state.mygames).length
    let k = 0
    let padding_left = 10
    let padding_left_circle = 0
    if (this.state.logged) {
      padding_left = 25
      padding_left_circle = 0
    }
    let lastPosition = 0
    let blockPosition = 1
    let showPosition = true
    const statistics = {}

    this.state.games.map((game, i) => {
      const results = [...Array(72).keys()].map((idx) => game[self.matchesInvRef[idx]] && game[self.matchesInvRef[idx]]['pts']).filter((e) => e === 0 || e)
      const row = []
      const includeGameId = this.state.pins.includes(game.gameId)
      showPosition = false
      if (game.position !== lastPosition) {
        blockPosition++
        showPosition = true
      }
      lastPosition = game.position

      row.push(<div key={`g${i}`}>
        <div style={{ position: "relative", height: "60px" }} className={`${blockPosition % 2 === 0 ? "even" : "odd"}`}>
          <div className={`sidebar ${blockPosition % 2 === 0 ? "even" : "odd"}`}></div>
          {showPosition && <div className={`position ${game.position < 10 ? "onedigit" : game.position < 100 ? "twodigits" : ""}`}>{game.position}<sup>o</sup></div>}

          {this.state.logged && <div style={{ display: "inline-block", position: "absolute", marginLeft: "-10px", width: "10px", top: "3px", color: pink500, fontWeight: "bold", fontFamily: "Lato", textAlign: "right" }}>
            {!includeGameId &&
              <IconButton onClick={this.pin.bind(this, game.gameId)}>
                <Icon baseClassName="material-icons-outlined" className="ranking-pin">push_pin</Icon>
              </IconButton>}
            {includeGameId &&
              <IconButton onClick={this.unpin.bind(this, game.gameId)}>
                <Icon className="ranking-pin">push_pin</Icon>
              </IconButton>}
          </div>}

          <div style={{ display: "inline-block", height: "100%", width: "calc(100vw - 60px)", marginTop: "0px", marginBottom: "6px" }}>
            <svg width="100%" height="100%">
              <text x={padding_left} y={24} style={{ fontFamily: "Lato", fontSize: "15px" }} fill={"black"}>{game.name}</text>
              {results.map((pts, j) => {
                if (pts > 0) {
                  statistics[j] = statistics[j] || { 8: 0, 5: 0, 3: 0 }
                  statistics[j][pts] = statistics[j][pts] + 1
                }
                return this.renderCircle(pts, padding_left_circle + j, offset + i,
                  { 8: blue500, 5: grey400, 3: "rgba(240,240,240,1)", 0: "transparent" },
                  { 8: blue500, 5: "rgba(100,100,100, 0.5)", 3: "rgba(100,100,100, 0.5)", 0: "rgba(0,0,0, 0.3)" })
              })}
            </svg>
          </div>

          <div style={{ display: "inline-block", position: "absolute", width: "20px", top: "8px", color: pink500, fontWeight: "bold", fontFamily: "Lato", textAlign: "right" }}>{game.total}</div>
        </div>
      </div>)
      rows.push(<div className="player-row" key={`row${i}`}>{row}</div>)

      const pinned = [...new Set([...Object.keys(self.state.mygames), ...self.state.pins])]
      pinned.map((key) => {
        if (key === game.gameId) {
          const includeGameId = this.state.pins.includes(game.gameId)
          myrows.push(<div key={`row${k}`}>
            <div key={`mg${k}`}>
              <div style={{ position: "relative", height: "60px" }}>
                {<div className={`position pins ${game.position < 10 ? "onedigit" : game.position < 100 ? "twodigits" : ""}`}>{game.position}<sup>o</sup></div>}
                {this.state.logged && <div style={{ display: "inline-block", position: "absolute", marginLeft: "-10px", width: "10px", top: "3px", color: pink500, fontWeight: "bold", fontFamily: "Lato", textAlign: "right" }}>
                  {includeGameId &&
                    <IconButton onClick={this.unpin.bind(this, game.gameId)}>
                      <Icon className="ranking-pin-white">push_pin</Icon>
                    </IconButton>}
                </div>}

                <div style={{ display: "inline-block", height: "100%", width: "calc(100vw - 60px)", marginTop: "0px", marginBottom: "6px" }}>
                  <svg width="100%" height="100%">
                    <text x={padding_left} y={24} style={{ fontFamily: "Lato", fontSize: "15px" }} fill={"white"}>{game.name}</text>
                    {results.map((pts, j) => {
                      return this.renderCircle(pts, padding_left_circle + j, k,
                        { 8: blue500, 5: grey400, 3: "rgba(240,240,240,1)", 0: "transparent" },
                        { 8: "rgba(0,0,0, 0.2)", 5: "rgba(0,0,0, 0.5)", 3: "rgba(0,0,0, 0.5)", 0: "rgba(255,255,255, 0.3)" })
                    })}
                  </svg>
                </div>
                <div style={{ display: "inline-block", position: "absolute", width: "20px", top: "8px", color: "white", fontWeight: "bold", fontFamily: "Lato", textAlign: "right" }}>{game.total}</div>
              </div>
            </div>
          </div>)
          k++
        }
      })
    })

    return (
      <div>
        {this.state.logged === false && <div style={{ background: orange200, textAlign: "center", fontSize: "14px", padding: "8px" }}>
          <div>
            <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => { firebase.auth().signInWithRedirect(provider) }}>
              {t('auth.login')}
            </span><span>{t('auth.loginToPinFriendsPre')}<i>{t('auth.loginToPinFriendsAction')}</i>{t('auth.loginToPinFriendsPost')}</span>
          </div>
        </div>}
        <div className="whitebar" style={{ paddingLeft: "25px", paddingBottom: "20px" }}>
          <div style={{ paddingLeft: "10px", paddingTop: "35px", fontFamily: "Roboto Condensed", fontSize: "30px", color: "#ddd" }}>{t('ranking.title')}</div>
        </div>

        {this.state.logged && this.state.user && <div className="mygames" style={{ paddingLeft: "25px", backgroundColor: cyan500 }}>
          <div className="mygames-row" style={{ backgroundColor: cyan600 }}>
            <div style={{ backgroundColor: cyan600, padding: "5px", fontSize: "10px", paddingTop: "10px", paddingLeft: "10px", paddingBottom: "6px", color: "rgba(255, 255, 255, 0.7)" }}>
              {t('ranking.myBidsHeader')}
            </div>
            {myrows}
          </div>
        </div>}
        <div className="degrade">
          <div className="checkers">
            <div style={{ padding: "5px", fontSize: "10px", paddingTop: "10px", paddingLeft: "10px", paddingBottom: "6px", color: "rgb(100,100,100)" }}>
              {t('ranking.leaderboardHeader')}
            </div>
            {rows}
          </div>
        </div>
      </div>
    )
  }
}
