import React, { Component } from "react";
import * as firebase from 'firebase'
import data from './data.json'
import moment from 'moment'
import { StickyTable, Row, Cell } from 'react-sticky-table';
import CircularProgress from 'material-ui/CircularProgress';
import 'react-sticky-table/dist/react-sticky-table.css';

export default class Leaderboard extends Component {

  constructor(props) {
    super(props)
    this.state = {games: []}

    const matches = ['a','b','c','d','e','f','g','h'].map((group) => data.groups[group].matches).reduce((acc,ele) => acc.concat(ele),[])

    this.state = {games: [],
       matches: matches.sort((a,b) => {
        if (moment(a.date).isBefore(moment(b.date) )) 
          return -1
        else if (moment(a.date).isAfter(moment(b.date)))
          return 1 
        return 0
    })
    }


    this.teams = data.teams.reduce((acc,ele) => {acc[ele.id] = ele; return acc}, {})

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

      

      
      this.setState({games: games.sort((a,b) => {
        var nameA = a.name.toUpperCase()
        var nameB = b.name.toUpperCase() 
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
      
        return 0;
      })})
      
    })
    

  }




  render() {


    const header = []
    header.push(<Cell key={"nome"}>Nome</Cell>)
    this.state.matches.map((match,i) => {
      header.push(<Cell key={`ha${i}`}><div style={{width:"20px", height: "100px", writingMode: "vertical-rl"}}>{this.teams[match.home_team].name}</div></Cell>)
      header.push(<Cell key={`hb${i}`}><div style={{width:"20px", height: "100px", writingMode: "vertical-rl"}}>{this.teams[match.away_team].name}</div></Cell>)
      header.push(<Cell key={`hc${i}`}><div style={{width:"20px"}}></div></Cell>)
    })

    const rows=[]
    this.state.games.map((game,i) => {
      const row = []
      row.push(<Cell key={`g${i}`} ><div >{game.name}</div></Cell>)
      this.state.matches.map((match,j) => {
        const idx = match.name
        row.push(<Cell key={`ra${i}-${j}`} style={{fontFamily: "Lato"}}>{game[match.name].h}</Cell>)
        row.push(<Cell key={`rb${i}-${j}`} style={{fontFamily: "Lato"}}>{game[match.name].a}</Cell>)
        row.push(<Cell key={`rc${i}-${j}`}></Cell>)
      })
      rows.push(row)
    })


    return (
      <div>
        {rows.length == 0 &&  <div style={{backgroundColor: "white", textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>}
        {rows.length > 0 && <div style={{marginTop: '5px', width: '100%', height: '900px'}}>
          <StickyTable>
            <Row>
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

