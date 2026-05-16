import React, { Component } from "react"
import defaultData from './data26.json'
import dayjs from 'dayjs'
import { CircularProgress, IconButton, Icon } from '@mui/material'
import { blue, grey, orange, cyan, pink } from '@mui/material/colors'
import firebase from 'firebase/compat/app'
import 'firebase/compat/database'
import './flags.css'
import { easeExpInOut } from 'd3'
import MatchViz from './MatchViz'
import { DATABASE_ROOT_NODE } from "./constants"
import { LanguageContext } from './i18n'

export default class Viz extends Component {

  static contextType = LanguageContext

  constructor(props) {
    super(props)
    this.state = { gamesMap: {}, resultsMap: {}, upcomming: [], animateKey: 0 }
  }

  componentWillUnmount() { }

  componentDidMount() {
    const data = this.props.tournamentData || defaultData
    const matches = Object.keys(data.groups).map((group) => data.groups[group].matches).reduce((acc, ele) => acc.concat(ele), [])
    const sortedMatches = matches.sort((a, b) => {
      if (dayjs(a.date).isBefore(dayjs(b.date))) return -1
      else if (dayjs(a.date).isAfter(dayjs(b.date))) return 1
      return 0
    })
    this.matchesRef = sortedMatches.reduce((acc, ele, i) => { acc[ele.name] = i; return acc }, {})
    this.matches = sortedMatches
    this.teams = data.teams.reduce((acc, ele) => { acc[ele.id] = ele; return acc }, {})
    this.setState({ upcomming: sortedMatches })
    this.loadGames(sortedMatches)
  }

  loadGames = (upcomming) => {
    const self = this
    const map = {}
    const results = {}
    const dbNode = this.props.dbNode || DATABASE_ROOT_NODE
    firebase.database().ref(dbNode).once('value', snapshot => {
      snapshot.forEach(function (childSnapshot) {
        const childData = childSnapshot.val()
        Object.keys(childData).map((key) => {
          upcomming.map((match) => {
            const matchId = match.name
            const details = { res: childData[key][matchId], status: childData[key].status }
            if (details.status === "payed") {
              Object.assign(details, { gameId: key, userId: childSnapshot.key })
              let games = map[matchId]
              if (!games) games = []
              games.push(details)
              map[matchId] = games
            }
            if (key === "gabarito") {
              results[matchId] = childData[key][matchId]
            }
          })
        })
      })
      this.setState({ gamesMap: map, resultsMap: results })
    })
  }

  render() {
    const { t } = this.context
    const compactHeader = this.props.compactHeader
    const headerStyle = compactHeader
      ? {
        margin: "0",
        width: "100%",
        boxSizing: "border-box",
        padding: "22px 24px 16px",
        textAlign: "left",
        background: "linear-gradient(180deg, #ffffff 0, rgba(255,255,255,0.94) 100%)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.07)",
      }
      : {
        margin: "50px auto 0",
        width: "min(360px, calc(100% - 40px))",
        textAlign: "center",
      }
    return (
      <div style={compactHeader ? {
        width: "min(458px, calc(100% - 36px))",
        margin: "28px auto 0",
        padding: "0 0 20px",
        boxSizing: "border-box",
        background: "rgba(255,255,255,0.96)",
        border: "1px solid rgba(15, 23, 42, 0.12)",
        borderRadius: "18px",
        boxShadow: "0 26px 64px rgba(15, 23, 42, 0.17), 0 2px 6px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
      } : undefined}>
        <div id="viz" style={headerStyle}>
          {compactHeader && <div style={{
            color: "#2196f3",
            fontFamily: "Roboto Condensed",
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "1.8px",
            marginBottom: "5px",
            textTransform: "uppercase",
          }}>{t('viz.eyebrow')}</div>}
          <div style={{ fontWeight: "bold", fontSize: compactHeader ? "21px" : "24px", fontFamily: "Roboto Condensed", lineHeight: "1.2", letterSpacing: compactHeader ? "-0.2px" : undefined, color: compactHeader ? "#111" : undefined }}>{t('viz.title')}</div>
          <div style={{ fontFamily: "Open Sans", margin: compactHeader ? "9px 0 0" : "22px auto 0", textAlign: compactHeader ? "left" : "center", width: "min(360px, 100%)", color: compactHeader ? "#555" : undefined, fontSize: compactHeader ? "13px" : undefined, lineHeight: compactHeader ? "1.42" : undefined }}>
            {t('viz.description')}
          </div>
          {this.props.children}
        </div>
        <div style={compactHeader ? {
          marginTop: "6px",
          paddingTop: "12px",
          background: "linear-gradient(180deg, rgba(33,150,243,0.04) 0, rgba(255,255,255,0) 110px)",
        } : undefined}>
          {this.state.upcomming.map((match, i) => {
            const r = this.state.resultsMap[match.name]
            return <MatchViz key={i} homeTeam={this.teams[match.home_team].name} awayTeam={this.teams[match.away_team].name} games={this.state.gamesMap[match.name]} result={r} />
          })}
        </div>
      </div>
    )
  }
}
