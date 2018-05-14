import React, { Component } from "react";

import data from './data.json'
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





export default class Leaderboard extends Component {

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
    this.state = {games: [], matches: [], render: false, expanded: true}



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
      })
      self.ref2 = firebase.database().ref(`wc18/master/gabarito`)
      const res = self.ref2.on('value', snapshot => {
        const results  = {}
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
    const games = []
    firebase.database().ref(`wc18`).once('value', snapshot => {
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key
        var childData = childSnapshot.val()

        Object.keys(childData).map((key) => {
          const id = key
          const details = childData[key]
          
          if (details.status == "payed") {
            Object.assign(details, {gameId: id, userId: childKey})
            
            games.push(details)
          }

        })
        
      });

      
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
      this.setState({games: sortedGames, matches: matches, render: true})
      
    })
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
    if (!this.state.render) 
      return <div style={{backgroundColor: "white", textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>

    const header = []
    header.push(<Cell key={"nome"}></Cell>)
    this.state.matches.map((match,i) => {
      header.push(<Cell key={`ha${i}`}>
        <div style={{position: "relative", marginTop: "6px", marginBottom: "6px", marginLeft: "4px", marginRight: "4px"  }}>
        <div style={{color: "black", textAlign: "center", paddingLeft: "7px", fontSize: "small", fontWeight: "bold", fontFamily: "Lato", textOrientation: "upright", writingMode: "vertical-rl"}}>
          {this.teams[match.home_team].name.substring(0,3).toUpperCase()}
        </div>
        <div style={{ marginTop: "4px"}}><div className={`leaderboard-flags f-${this.teams[match.home_team].iso2}`}></div></div>
        <div style={{ marginTop: "4px", textAlign: "center"}}>{match.home_result != null ? match.home_result : "."}</div>
        </div>
      </Cell>)
      header.push(<Cell key={`hb${i}`}>
        <div style={{position: "relative", marginBottom: "6px", marginLeft: "4px", marginRight: "4px"  }}>
        <div style={{color: "black",textAlign: "center", paddingLeft: "7px", fontSize: "small", fontWeight: "bold", fontFamily: "Lato",  textOrientation: "upright", writingMode: "vertical-rl"}}>
          {this.teams[match.away_team].name.substring(0,3).toUpperCase()}
        </div>
        <div style={{ marginTop: "4px"}}><div className={`leaderboard-flags f-${this.teams[match.away_team].iso2}`}></div></div>
        <div style={{ marginTop: "4px", textAlign: "center"}}>{match.away_result != null ? match.away_result : "."}</div>
        </div>
      </Cell>)
      header.push(<Cell key={`hc${i}`}>
        <div style={{marginBottom: "6px", width: "40px"}}>
        <div style={{color: "black", textAlign: "center", paddingLeft: "7px", fontSize: "small", fontWeight: "bold", fontFamily: "Lato", height: "60px", textOrientation: "upright", writingMode: "vertical-rl"}}>
        </div>
        </div>
      </Cell>)
    })

    const self = this
    const rows=[]
    this.state.games.map((game,i) => {
      const row = []
      if (self.state.search === undefined || !self.state.search || game.name.toLowerCase().indexOf(self.state.search.toLowerCase()) >= 0) {
        row.push(<Cell className="nameColumn" style={{  paddingTop: "10px", paddingBottom: "10px", paddingRight: "10px"}} key={`g${i}`} >
        <div >
          <span style={{marginTop: "0px", fontFamily: "Lato", float: "left", width: "20px", textAlign: "right"}}>{game.position}</span>
          <span className="nameSize" style={{marginTop: "3px", fontSize: "10px", color:"rgba(50, 50, 50, 0.9)", fontFamily: "Lato", marginLeft: "10px",float: "left"}}><div style={{width: "130px", overflow: "hidden"}}> {game.name}</div></span>
          <span className="ptsColumn" style={{ marginTop: "0px", color: "white", fontWeight: "bold", fontFamily: "Lato", marginLeft: "2px", textAlign: "right"}}> {game.total}</span>
        </div>
        </Cell>)
        this.state.matches.map((match,j) => {

        row.push(<Cell key={`ra${i}-${j}`} style={{color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato",textAlign: "center"}}>{game[match.name].h}</Cell>)
        row.push(<Cell key={`rb${i}-${j}`} style={{color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato",textAlign: "center"}}>{game[match.name].a}</Cell>)
        row.push(<Cell key={`rc${i}-${j}`} style={{color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato",textAlign: "center", position: "relative"}}>
          {this.renderPts(game[match.name].pts)}
          </Cell>)
      })
      rows.push(<Row key={`row${i}`} style={{height: "30px"}}>{row}</Row>)
      }
    })

    if (rows.length == 0 ) {
      const row = []
      row.push(<Cell className="nameColumn" style={{  paddingTop: "10px", paddingBottom: "10px", paddingRight: "10px"}} key={`g${0}`} >
      <div >
        <span style={{marginTop: "0px", fontFamily: "Lato", float: "left", width: "20px", textAlign: "right"}}></span>
        <span className="nameSize" style={{marginTop: "3px", fontSize: "12px", color:"rgba(50, 50, 50, 0.9)", fontFamily: "Roboto", marginLeft: "10px",float: "left"}}></span>
        <span className="ptsColumn" style={{ marginTop: "0px", color: "white", fontWeight: "bold", fontFamily: "Lato", marginLeft: "2px", textAlign: "right"}}></span>
      </div>
      </Cell>)
    this.state.matches.map((match,j) => {
        row.push(<Cell key={`ra${0}-${j}`} style={{color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato",textAlign: "center"}}></Cell>)
        row.push(<Cell key={`rb${0}-${j}`} style={{color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato",textAlign: "center"}}></Cell>)
        row.push(<Cell key={`rc${0}-${j}`} style={{color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato",textAlign: "center", position: "relative"}}></Cell>)
      })
      rows.push(<Row key={`rowt`} style={{height: "30px"}}>{row}</Row>)
    }


    return (
      <div >

        {this.state.render && <div style={{ 
          position: "relative", 
          width: '100%',
          height: this.state.expanded ? "calc(100vh - 119px)": "100vh"
        }}>

          <IconButton 
            style={{
              position: "absolute",
              top: "0px",
              left: "10px",
              zIndex: "1000",
              cursor: "pointer"
            }}          
            onClick={this.expandOrCollapse.bind(this)}>
                {this.state.expanded ? 
                <FontIcon className="material-icons">expand_less</FontIcon> :
                <FontIcon className="material-icons">expand_more</FontIcon> }
          </IconButton>


          <SearchBar
            onChange={(value) => this.setState({search: value})}
            onRequestSearch={() =>{}}
            style={{
              margin: '0 auto',
              position: "absolute",
              top: "60px",
              zIndex: "1000",
              width: "236px",
              boxShadow: "unset",
              height: "40px",
              left: "13px",
              width: "219px"
            }} />
          <StickyTable>
            <Row >
              {header}
            </Row>
            {rows}
          </StickyTable>
        </div>}
      </div>
    );
  }
}

