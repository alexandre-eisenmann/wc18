import React, { Component } from "react";

import data from './data.json'
import moment from 'moment'
import { StickyTable, Row, Cell } from 'react-sticky-table';
import CircularProgress from 'material-ui/CircularProgress';
import 'react-sticky-table/dist/react-sticky-table.css';
import {green700, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100} from 'material-ui/styles/colors';
import * as firebase from 'firebase'
import queryString from 'query-string'




const style ={
  // backgroundImage: "url(background3.svg)",
  // backgroundOpacity: 0.1,

}



export default class Leaderboard extends Component {

  constructor(props) {
    super(props)
    this.state = {games: []}

    const matches = ['a','b','c','d','e','f','g','h'].map((group) => data.groups[group].matches).reduce((acc,ele) => acc.concat(ele),[])
    const sortedMatches = matches.sort((a,b) => {
      if (moment(a.date).isBefore(moment(b.date) )) 
        return -1
      else if (moment(a.date).isAfter(moment(b.date)))
        return 1 
      return 0
    })
    this.queryString = queryString.parse(props.location.search)
    Object.keys(this.queryString).map((matchIdx) => {
      const result = this.queryString[matchIdx].split('x')
      sortedMatches[matchIdx-1].home_result = parseInt(result[0],0)
      sortedMatches[matchIdx-1].away_result = parseInt(result[1],0)
    })




    this.state = {games: [],
       matches: sortedMatches
    }


    this.teams = data.teams.reduce((acc,ele) => {acc[ele.id] = ele; return acc}, {})
    this.flags = require.context("./flags/4x3/", false, /.*\.svg$/);

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
            }
            total += game[match.name].pts || 0 

        }
      })
      game["total"] = total
    })
  }


  flagSvg(iso2code) {
    return <div style={{ width:"32px",height: "24px", background:`url(${this.flags(`./${iso2code}.svg`)}) no-repeat top left`,backgroundSize: "contain"}}></div>
  }

  componentWillUnmount() {

    if (this.ref) {
      this.ref.off('value')
    }
  }

  componentDidMount() {

    const games = []
    this.ref = firebase.database().ref(`wc18`)
    this.ref.once('value', snapshot => {
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key
        var childData = childSnapshot.val()


        Object.entries(childData).map(([id,details]) => {
          if (details.status == "payed") {
            Object.assign(details, {gameId: id, userId: childKey})
            
            games.push(details)
          }

        })
        
        
      });

      this.calculate(games, this.state.matches)
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
      this.setState({games: sortedGames})
      
    })
    

  }




  render() {

    const header = []
    header.push(<Cell key={"nome"}></Cell>)
    this.state.matches.map((match,i) => {
      header.push(<Cell key={`ha${i}`}>
        <div style={{position: "relative", marginTop: "6px", marginBottom: "6px", marginLeft: "4px", marginRight: "4px"  }}>
        <div style={{color: "black", textAlign: "center", paddingLeft: "7px", fontSize: "small", fontWeight: "bold", fontFamily: "Lato", textOrientation: "upright", writingMode: "vertical-rl"}}>
          {this.teams[match.home_team].name.substring(0,3).toUpperCase()}
        </div>
        <div style={{ marginTop: "4px"}}>{this.flagSvg(this.teams[match.home_team].iso2)}</div>
        <div style={{ marginTop: "4px", textAlign: "center"}}>{match.home_result != null ? match.home_result : "."}</div>
        </div>
      </Cell>)
      header.push(<Cell key={`hb${i}`}>
        <div style={{position: "relative", marginBottom: "6px", marginLeft: "4px", marginRight: "4px"  }}>
        <div style={{color: "black",textAlign: "center", paddingLeft: "7px", fontSize: "small", fontWeight: "bold", fontFamily: "Lato",  textOrientation: "upright", writingMode: "vertical-rl"}}>
          {this.teams[match.away_team].name.substring(0,3).toUpperCase()}
        </div>
        <div style={{ marginTop: "4px"}}>{this.flagSvg(this.teams[match.away_team].iso2)}</div>
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

    const rows=[]
    this.state.games.map((game,i) => {
      const row = []
      row.push(<Cell style={{  paddingTop: "10px", paddingBottom: "10px", paddingRight: "10px"}} key={`g${i}`} >
        <div >
          <span style={{ float: "left", width: "20px", textAlign: "right"}}>{game.position}</span>
          <span style={{marginLeft: "10px",float: "left"}}>{game.name}</span>
          <span style={{marginLeft: "2px",float: "right"}}> {game.total}</span>
        </div>
        </Cell>)
      this.state.matches.map((match,j) => {

        row.push(<Cell key={`ra${i}-${j}`} style={{color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato",textAlign: "center"}}>{game[match.name].h}</Cell>)
        row.push(<Cell key={`rb${i}-${j}`} style={{color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato",textAlign: "center"}}>{game[match.name].a}</Cell>)
        row.push(<Cell key={`rc${i}-${j}`} style={{color: "rgba(50, 50, 50, 0.9)", paddingTop: "10px", fontFamily: "Lato",textAlign: "center"}}>{game[match.name].pts}</Cell>)
      })
      rows.push(row)
    })


    return (
      <div style={style}>
        {rows.length == 0 &&  <div style={{backgroundColor: "white", textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>}
        {rows.length > 0 && <div style={{ width: '100%', height: '900px'}}>
          <StickyTable>
            <Row >
              {header}
            </Row>
            {rows.map((row, i) => {
              return <Row key={`row${i}`} style={{height: "30px"}}>
                 {row}
               </Row>
            })}
          </StickyTable>
        </div>}
      </div>
    );
  }
}

