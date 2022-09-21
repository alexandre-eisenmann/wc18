import React, { Component } from "react";
import NodeGroup from 'react-move/NodeGroup';

import data from './data.json'
import moment from 'moment'
import { StickyTable, Row, Cell } from 'react-sticky-table';
import CircularProgress from 'material-ui/CircularProgress';
// import 'react-sticky-table/dist/react-sticky-table.css';
import {blue500, grey300,grey400,grey200,lightGreen500, orange200,deepOrange500, orange900,yellow500,green700, orange500, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100} from 'material-ui/styles/colors'
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

import './flags.css';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import { easeExpInOut } from 'd3-ease';
import MatchViz from './MatchViz'
import { DATABASE_WC18, DATABASE_ROOT_NODE } from "./constants";

export default class Viz extends Component {

  constructor(props) {
    super(props)

    this.state = {gamesMap: {}, resultsMap:{}, upcomming: []}


  }

  componentWillUnmount() {
  }

  componentDidMount() {
    const matches = ['a','b','c','d','e','f','g','h'].map((group) => data.groups[group].matches).reduce((acc,ele) => acc.concat(ele),[])
    const sortedMatches = matches.sort((a,b) => {
      if (moment(a.date).isBefore(moment(b.date) )) 
        return -1
      else if (moment(a.date).isAfter(moment(b.date)))
        return 1 
      return 0
    })
    this.matchesRef = sortedMatches.reduce((acc, ele, i) => {acc[ele.name] = i; return acc}, {})
    this.matches = sortedMatches
    this.teams = data.teams.reduce((acc,ele) => {acc[ele.id] = ele; return acc}, {})
    const today = moment(new Date());
    const up = []
    sortedMatches.map((match) => {
      // if (up.length<5) {
        // if (!today.add(-1,'hours').isAfter(match.date) && up.length<5) {
        up.push(match)
      // }
    })

    this.setState({upcomming: up})
    this.loadGames(up)
  }

  loadGames = (upcomming) => {
    const self = this
    const map = {}
    const results = {}
    firebase.database().ref(`${DATABASE_ROOT_NODE}`).once('value', snapshot => {
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key
        var childData = childSnapshot.val()

        Object.keys(childData).map((key) => {
          const id = key
          
          upcomming.map((match) => {
            const matchId = match.name
            const details = { res:childData[key][matchId],status:childData[key].status}
          
            if (details.status == "payed") {
              Object.assign(details, {gameId: id, userId: childKey})
              let games = map[matchId]
              if (!games) games = []
              games.push(details)
              map[matchId] = games
            }
            if (id == "gabarito") {
              results[matchId] = childData[key][matchId]
            }
              
          })

      })
      });
      this.setState({gamesMap: map, resultsMap: results})
    })
  }


  render() {
    return  <div>
      <div id="viz" style={{margin: "auto", textAlign: "left", fontWeight: "bold", marginTop: "50px", paddingLeft: "60px", width: "340px", fontSize: "30px", fontFamily: "Roboto Condensed"}} >CHUVA DE PALPIPES</div>
      <div style={{margin: "auto", fontFamily: "Open Sans", marginTop: "20px", paddingLeft:"20px", paddingRight: "20px", textAlign: "left", width: "340px"}} >
      Os gráficos abaixam representam a distribuição de palpites para os próximos jogos. A área de cada círculo é proporcional
      ao número de apostadores para o resultado. Observem que os empates situam-se bem na linha vertical que passa pela 
      origem (zero a zero) e o resultado 5 a 5. 
      </div>
      { this.state.upcomming.map((match,i) => {
        let r = this.state.resultsMap[match.name]
        return <MatchViz key={i} homeTeam={this.teams[match.home_team].name} awayTeam={this.teams[match.away_team].name} games={this.state.gamesMap[match.name]}  result={r} />
      })}
      
      
    </div>
  }
}

