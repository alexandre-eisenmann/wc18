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
    return (
      <div>
        <div id="viz" style={{ margin: "50px auto 0", width: "min(360px, calc(100% - 40px))", textAlign: "center" }}>
          <div style={{ fontWeight: "bold", fontSize: "34px", fontFamily: "Roboto Condensed", lineHeight: "1.1" }}>{t('viz.title')}</div>
          <div style={{ fontFamily: "Open Sans", margin: "22px auto 0", textAlign: "center", width: "min(360px, 100%)" }}>
            {t('viz.description')}
          </div>
        </div>
        {this.state.upcomming.map((match, i) => {
          const r = this.state.resultsMap[match.name]
          return <MatchViz key={i} homeTeam={this.teams[match.home_team].name} awayTeam={this.teams[match.away_team].name} games={this.state.gamesMap[match.name]} result={r} />
        })}
      </div>
    )
  }
}
