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
    this.loadCountry(db, "Russia")
    this.loadCountry(db, "Saudi Arabia")
    // this.loadCountry(db, "Brazil")
  }

  loadCountry(db,home_team) {
    const self = this
    const results = {}
    db.ref(`summary/${home_team}`).once('value', snapshot => {
      snapshot.forEach(function(childSnapshot) {
        var year = childSnapshot.key
        var matches = childSnapshot.val()
        matches.map((match) => {
          // if (match.home_team == "Portugal" || match.away_team == "Portugal") {
            const games = results[year] || []
            games.push(match)
            results[year] = games
          // }
        })
      });
      const clone = {...this.state.data}
      clone[home_team] = {results: results, tab: self.tabular(home_team, results)}
      self.setState({data: clone})
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
      <div style={{margin: "auto", width: "80%", position: "relative"}}>
         <VizHistCountry country="Russia" data={this.state.data['Russia']}/>
         <VizHistCountry country="Saudi Arabia" data={this.state.data['Saudi Arabia']}/>
         {/* <VizHistCountry country="Brazil" data={this.state.data['Brazil']}/> */}
      </div>


    );
  }
}

