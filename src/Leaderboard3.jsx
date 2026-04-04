import React, { Component } from "react"
import data from './data26.json'
import dayjs from 'dayjs'
import { StickyTable, Row, Cell } from 'react-sticky-table'
import { CircularProgress, IconButton, Icon } from '@mui/material'
import { blue, grey, pink } from '@mui/material/colors'
import firebase from 'firebase/compat/app'
import './flags.css'
import { DATABASE_ROOT_NODE } from "./constants"

const blue500 = blue[500]
const grey400 = grey[400]
const pink500 = pink[500]

export default class Leaderboard extends Component {

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
    this.state = { games: [], matches: [], render: false, expanded: true }
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
    if (this.ref1) this.ref1.off('value')
    if (this.ref2) this.ref2.off('value')
  }

  componentDidMount() {
    const self = this
    const matches = [...this.matches]

    self.ref1 = firebase.database().ref(`${DATABASE_ROOT_NODE}/master/gabarito`)
    self.ref1.on('child_removed', function (data) {
      matches[self.matchesRef[data.key]].away_result = null
      matches[self.matchesRef[data.key]].home_result = null
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
      this.setState({ games: sortedGames, matches: matches, render: true })
    })
  }

  renderPts = (pts) => {
    const colors = { 8: blue500, 5: grey400, 3: "white" }
    const fontColors = { 8: "white", 5: "white", 3: "rgb(150,150,150)", 0: "#fff" }
    if (pts != null) {
      return (
        <div style={{ width: "20px", height: "20px", backgroundColor: colors[pts], borderRadius: "10px", position: "absolute", left: "10px" }}>
          <div style={{ color: fontColors[pts], fontSize: "10px", marginTop: "3px" }}>
            {pts === 0 ? "x" : pts}
          </div>
        </div>
      )
    }
    return null
  }

  render() {
    if (!this.state.render)
      return <div style={{ backgroundColor: "white", textAlign: "center", marginTop: "10%", width: "100%" }}><CircularProgress size={60} thickness={7} /></div>

    const header = []
    header.push(<Cell key={"nome"}></Cell>)
    this.state.matches.map((match, i) => {
      header.push(<Cell key={`ha${i}`}>
        <div style={{ position: "relative", marginTop: "6px", marginBottom: "6px", marginLeft: "4px", marginRight: "4px" }}>
          <div style={{ color: "black", textAlign: "center", paddingLeft: "7px", fontSize: "small", fontWeight: "bold", fontFamily: "Lato", textOrientation: "upright", writingMode: "vertical-rl" }}>
            {this.teams[match.home_team].name.substring(0, 3).toUpperCase()}
          </div>
          <div style={{ marginTop: "4px" }}><div className={`leaderboard-flags f-${this.teams[match.home_team].iso2}`}></div></div>
          <div style={{ marginTop: "4px", textAlign: "center" }}>{match.home_result != null ? match.home_result : "."}</div>
        </div>
      </Cell>)
      header.push(<Cell key={`hb${i}`}>
        <div style={{ position: "relative", marginBottom: "6px", marginLeft: "4px", marginRight: "4px" }}>
          <div style={{ color: "black", textAlign: "center", paddingLeft: "7px", fontSize: "small", fontWeight: "bold", fontFamily: "Lato", textOrientation: "upright", writingMode: "vertical-rl" }}>
            {this.teams[match.away_team].name.substring(0, 3).toUpperCase()}
          </div>
          <div style={{ marginTop: "4px" }}><div className={`leaderboard-flags f-${this.teams[match.away_team].iso2}`}></div></div>
          <div style={{ marginTop: "4px", textAlign: "center" }}>{match.away_result != null ? match.away_result : "."}</div>
        </div>
      </Cell>)
      header.push(<Cell key={`hc${i}`}>
        <div style={{ marginBottom: "6px", width: "40px" }}>
          <div style={{ color: "black", textAlign: "center", paddingLeft: "7px", fontSize: "small", fontWeight: "bold", fontFamily: "Lato", height: "60px", textOrientation: "upright", writingMode: "vertical-rl" }}>
          </div>
        </div>
      </Cell>)
    })

    const rows = []
    this.state.games.map((game, i) => {
      const row = []
      row.push(<Cell className="nameColumn" key={`g${i}`}>
        <div>
          <span style={{ color: "white", marginLeft: "-25px", fontFamily: "Lato", float: "left", width: "20px", fontSize: "8px", textAlign: "right" }}>{game.position}<sup>o</sup></span>
          <span className="nameSize" style={{ marginTop: "3px", fontSize: "10px", color: "rgba(50, 50, 50, 0.9)", fontFamily: "Lato", marginLeft: "10px", float: "left" }}><div style={{ width: "130px", overflow: "hidden" }}>{game.name}</div></span>
          <span className="ptsColumn" style={{ marginTop: "0px", color: pink500, fontWeight: "bold", fontFamily: "Lato", marginLeft: "2px", textAlign: "right" }}>{game.total ? game.total : ""}</span>
        </div>
      </Cell>)
      this.state.matches.map((match, j) => {
        row.push(<Cell key={`ra${i}-${j}`} style={{ color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato", textAlign: "center" }}>{game[match.name].h}</Cell>)
        row.push(<Cell key={`rb${i}-${j}`} style={{ color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato", textAlign: "center" }}>{game[match.name].a}</Cell>)
        row.push(<Cell key={`rc${i}-${j}`} style={{ color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato", textAlign: "center", position: "relative" }}>
          {this.renderPts(game[match.name].pts)}
        </Cell>)
      })
      rows.push(<Row key={`row${i}`} className={`row-${i % 2}`}>{row}</Row>)
    })

    return (
      <div>
        {this.state.render && <div style={{
          position: "relative",
          width: '100%',
          height: this.state.expanded ? "calc(100vh - 119px)" : "100vh"
        }}>
          <IconButton
            style={{ position: "absolute", top: "0px", left: "10px", zIndex: "1000", cursor: "pointer" }}
            onClick={this.expandOrCollapse}
          >
            {this.state.expanded ? <Icon>expand_less</Icon> : <Icon>expand_more</Icon>}
          </IconButton>

          <div style={{
            margin: '0 auto',
            position: "absolute",
            top: "75px",
            zIndex: "1000",
            fontFamily: "Lato",
            height: "40px",
            left: "30px",
            color: "#ccc",
            width: "219px"
          }}>
            {`${this.state.games.length} participantes`}
          </div>
          <StickyTable>
            <Row>{header}</Row>
            {rows}
          </StickyTable>
        </div>}
      </div>
    )
  }
}
