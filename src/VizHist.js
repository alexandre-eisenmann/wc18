import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import Paper from 'material-ui/Paper'

import {pink300,amberA700, blue500, blue300,grey300,grey400,grey200,lightGreen500, orange200,deepOrange500, orange900,yellow500,green700, orange500, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100} from 'material-ui/styles/colors'
import './flags.css';
import './scroll.css';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ActionHome from 'material-ui/svg-icons/action/home';
import FontIcon from 'material-ui/FontIcon';
import moment from 'moment'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import VizHistCountry from './VizHistCountry'
import * as firebase from 'firebase'
import * as d3 from 'd3';
import NodeGroup from 'react-move/NodeGroup';
import { easeExpInOut } from 'd3-ease';
import MathViz from './MatchViz'





const today = moment(new Date());
const startDate = moment([2018, 5, 15]);
const init = 1929
const x = d3.scaleLinear().domain([init, 2018]).range([10, 590]);
const w = Math.floor((590 - 10)/(2018-init))


const flags = ["f-sa","f-eg","f-uy","f-ma","f-ir","f-br","f-de","f-ar","f-ru","f-gb-eng","f-pt","f-es","f-fr","f-au","f-is","f-pe","f-dk","f-hr","f-ng","f-br","f-cr","f-rs","f-mx","f-ch","f-se","f-kr","f-be","f-pa","f-tn","f-co","f-jp","f-pl","f-sn"]

export default class VizHist extends Component {

  constructor(props) {
    super(props)
    this.state = {data: {}}
  }

  componentDidMount() {
    const db = firebase.app().database(`https://worldcup-27dc4-741d7.firebaseio.com/`)
    this.loadCountry(db, "Brazil", "Germany")
    this.loadCountry(db, "Germany")
    // this.loadCountry(db, "Brazil")
  }

  loadCountry(db,team, other_team) {
    const self = this
    const results = {}
    const collect = []
    db.ref(`summary/${team}`).once('value', snapshot => {
      snapshot.forEach(function(childSnapshot) {
        var year = childSnapshot.key
        var matches = childSnapshot.val()
        matches.map((match) => {
            if (other_team) {
              if (match.home_team == other_team) {
                collect.push({gameId: match.id, res: {a: match.home_score,h: match.away_score}})
              } else if (match.away_team == other_team) {
                collect.push({gameId: match.id,res: {a: match.away_score,h: match.home_score}})
              }
            }

            const games = results[year] || []
            games.push(match)
            results[year] = games
        })
      });
      const clone = {...this.state.data}
      clone[team] = {results: results, tab: self.tabular(team, results)}
      self.setState({data: clone})
      if (other_team) {
        console.log(collect)
        self.setState({cross: collect})
      }
    })
    
  }

  tabular(team, results) {
    const tab = {}
    Object.keys(results).map((key) => {
      const stat = {v: 0, l:0, t: 0}
        results[key].map((match) => {
        
          if (match.home_team == team) {
            if (match.home_score > match.away_score) {
              stat.v++
            } else if (match.home_score < match.away_score) {
              stat.l++
            } else {
              stat.t++
            }
          } else {
            if (match.home_score > match.away_score) {
              stat.l++
            } else if (match.home_score < match.away_score) {
              stat.v++
            } else {
              stat.t++
            }
          }
      })
      tab[key] = stat
    })
    return tab;
  }
  

  render() {
    return (
      <div style={{paddingTop: "20px", paddingBottom: "300px", paddingLeft: "10%", paddingRight: "10%", width: "80%", position: "relative", backgroundColor: "black"}}>
         <div style={{fontFamily: "Lato", textAlign: "center", fontSize: "15px", color: "white"}}>BRAZIL</div>
         <VizHistCountry country="Brazil" data={this.state.data['Brazil']}/>
         <MathViz homeTeam="Brazil" awayTeam="Germany" games={this.state.cross} darkMode={true}/>
         <VizHistCountry country="Germany" data={this.state.data['Germany']}/>
         <div style={{fontFamily: "Lato", textAlign: "center", fontSize: "15px", color: "white"}}>GERMANY</div>
      </div>


    );
  }
}

