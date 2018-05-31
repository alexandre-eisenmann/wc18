import React, { Component } from "react";
import NodeGroup from 'react-move/NodeGroup';

import data from './data.json'
import moment from 'moment'
import { StickyTable, Row, Cell } from 'react-sticky-table';
import CircularProgress from 'material-ui/CircularProgress';
import 'react-sticky-table/dist/react-sticky-table.css';
import {blue500, grey300,grey400,grey200,lightGreen500, orange200,deepOrange500, orange900,yellow500,green700, orange500, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100} from 'material-ui/styles/colors'
import * as firebase from 'firebase'
import './flags.css';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import { easeExpInOut } from 'd3-ease';
import MathViz from './MatchViz'

export default class Viz extends Component {

  constructor(props) {
    super(props)

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
    this.upcomming = []
    sortedMatches.map((match) => {
      if (!today.isAfter(match.date) && this.upcomming.length<5) {
        this.upcomming.push(match)
      }
    })

  }

  componentWillUnmount() {
  }

  componentDidMount() {
  }


  render() {
    return  <div>
      <div style={{margin: "auto", textAlign: "left", fontWeight: "bold", paddingLeft:"20px", paddingRight: "20px", marginTop: "50px",width: "340px", fontSize: "30px", fontFamily: "Roboto Condensed"}} >ESPAÇO DE PALPIPES </div>
      <div style={{margin: "auto", fontFamily: "Open Sans", marginTop: "20px", paddingLeft:"20px", paddingRight: "20px", textAlign: "left", width: "340px"}} >
      Os gráficos abaixam representam a distribuição de palpites para os próximos jogos. A área de cada círculo é proporcional
      ao número de apostadores para o resultado. Observem que os empates situam-se bem na linha vertical que passa pela 
      origem (zero a zero) e o resultado 5 a 5. 
      </div>
      {this.upcomming.map((match,i) => {
        return <MathViz key={i} match={match} />
      })}
      
      
    </div>
  }
}
