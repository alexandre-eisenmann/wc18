import React, { Component } from "react";

import data from './data.json'
import gamesFromFile from './games.json'
import moment from 'moment'
import { StickyTable, Row, Cell } from 'react-sticky-table';
import CircularProgress from 'material-ui/CircularProgress';
import 'react-sticky-table/dist/react-sticky-table.css';
import {blue500, grey300,grey400,grey200,lightGreen500, orange200,deepOrange500, orange900,yellow500,green700, orange500, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100} from 'material-ui/styles/colors'
import * as firebase from 'firebase'
import './flags.css';
import SearchBar from 'material-ui-search-bar'
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import { amber300 } from "material-ui/styles/colors";





export default class Ranking extends Component {

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
    this.state = {games: gamesFromFile, matches: this.matches,  expanded: true, updating: false, render: false}

  }


  calculatePosition(sortedGames) {
    if (sortedGames.length <= 0)
      return

    let k = 1
    let pos = 1
    let total = sortedGames[0].total
    sortedGames.map((game) => {
        if (game.total != total) {
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
            if (h == rh && a == ra) {
              game[match.name].pts = 8
            } else if (rh-ra == h-a ) {
              game[match.name].pts = 5
            } else if (Math.sign(rh-ra) == Math.sign(h-a)) {
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
    
    
    self.ref1 = firebase.database().ref(`wc18/master/gabarito`)
    self.ref1.on('child_removed', function(data) {
        matches[self.matchesRef[data.key]].away_result = null
        matches[self.matchesRef[data.key]].home_result = null
        self.setState({updating: true})
        self.loadGames(matches)

    })
    self.ref2 = firebase.database().ref(`wc18/master/gabarito`)
    const res = self.ref2.on('value', snapshot => {
      const results  = {}
      self.setState({updating: true})
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key
        var childData = childSnapshot.val()

        results[childKey] = childData
        
      });


      Object.keys(results).map((key) => {
        const result = results[key]
        const a = result.a == undefined ? null : result.a
        const h = result.h == undefined ? null : result.h
        matches[self.matchesRef[key]].away_result = a
        matches[self.matchesRef[key]].home_result = h
    })

      self.loadGames(matches)
    })

  }


  expandOrCollapse = (event) => {
    if (this.state.expanded) 
      document.getElementsByClassName("header")[0].style.display = "none"
    else 
      document.getElementsByClassName("header")[0].style.display = "block"
    this.setState({expanded: !this.state.expanded})
  }




  loadGames = (matches) => {
    const games = gamesFromFile
      
    this.calculate(games, matches)
    const sortedGames = games.sort((a,b) => {
      const diff = b.total - a.total
      if (diff != 0) return diff 
      else {
        var nameA = a.name.toUpperCase()
        var nameB = b.name.toUpperCase() 
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
      
        return 0;
      }
    })
    this.calculatePosition(sortedGames)
    setTimeout(() => {
      this.setState({games: sortedGames, matches: matches, render: true, updating: false})
    }, 100)
    
  }



  renderPts = (pts) => {
    const colors = {8: blue500, 5: grey400, 3: "white"}
    const fontColors = {8: "white", 5: "white", 3: "rgb(150,150,150)", 0: "#fff"}
    if (pts != null) {
      return  <div style={{width: "20px",height: "20px",
      backgroundColor: colors[pts],
      borderRadius: "10px",
      position: "absolute",left: "10px"}}>
      <div style={{color: fontColors[pts], fontSize: "10px", marginTop: "3px"}}>
        {pts == 0 ? "x" : pts}
      </div>
    </div>
    }
    return null
  }

  render() {
    if (!this.state.render) {
      return <div style={{backgroundColor: "white", textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>
    }

    const self = this
    const rows=[]
    this.state.games.map((game,i) => {
      const row = []
        row.push(<div  key={`g${i}`} >
        <div style={{position: "relative", height: "60px"}}>
          <div style={{color: "white",position: "absolute", top: "24px",  marginLeft: "-25px",fontFamily: "Lato", fontSize: "8px", textAlign: "right", display: "inline-block", width: "20px"}}> {game.position}<sup>o</sup></div>
          <div style={{display: "inline-block", height: "100%", width: "calc(100vw - 60px)", marginTop:"6px", marginBottom: "6px",height: "100%"}}>
             <svg width="100%" height="100%" >
              <text x={10} y={30} style={{fontFamily: "Lato", fontSize: "15px"}}>{game.name}</text>
            </svg> 
          </div>
          <div style={{display: "inline-block", position: "absolute", width: "20px", top: "20px", color: pink500, fontWeight: "bold", fontFamily: "Lato", textAlign: "right"}}> {game.total}</div>
        </div>
        </div>)
      rows.push(<div key={`row${i}`} >{row}</div>)
    })


    return (
      <div>
      <div className="whitebar">
         <div style={{paddingLeft:"20px", paddingTop: "35px", fontFamily: "Roboto Condensed", fontSize: "30px", color: "#ddd"}}>Ranking</div>
      </div>
      <div className="degrade">
        <div className="checkers">
          
          {rows}
        </div>
      </div>
      </div>
    );
  }
}

