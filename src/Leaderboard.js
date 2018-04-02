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

    console.log(this.state.matches)

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
    header.push(<Cell>Nome</Cell>)
    this.state.matches.map((match) => {
      header.push(<Cell ><div style={{width:"20px", height: "100px", writingMode: "vertical-rl"}}>{this.teams[match.home_team].name}</div></Cell>)
      header.push(<Cell ><div style={{width:"20px", height: "100px", writingMode: "vertical-rl"}}>{this.teams[match.away_team].name}</div></Cell>)
      header.push(<Cell ><div style={{width:"20px"}}></div></Cell>)
    })

    const rows=[]
    this.state.games.map((game) => {
      const row = []
      row.push(<Cell><div >{game.name}</div></Cell>)
      this.state.matches.map((match) => {
        const idx = match.name
        row.push(<Cell style={{fontFamily: "Lato"}}>{game[match.name].h}</Cell>)
        row.push(<Cell style={{fontFamily: "Lato"}}>{game[match.name].a}</Cell>)
        row.push(<Cell></Cell>)
      })
      rows.push(row)
    })


    return (
      <div>
        {rows.length == 0 &&  <div style={{backgroundColor: "white", textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>}
        {rows.length > 0 && <div style={{marginTop: '5px', width: '100%', height: '800px'}}>
          <StickyTable>
            <Row>
              {header}
            </Row>
            {rows.map((row) => {
              return <Row style={{height: "30px"}}>
                 {row}
               </Row>
            })}
          </StickyTable>
        </div>}
      </div>
    );
    // return (
      <div className="tabContainer">

      <div className="tabHeader">
            <div className="" >
              <div className="header column gameName">Name</div>
              <div className="header column gameEmail">Email</div>
              <div className="header column gameUserId">UserId</div>
              <div className="header column gameTransactionId" >TransactionId</div>
              <div className="header column gameId" >GameId</div>
              <div className="results">
              {this.state.matches.map((match) => {
                  const idx = match.name
                  return <div className="column result" key={idx}>
                  <div className="vertical column homeResult">{this.teams[match.home_team].name}</div>
                  <div className="vertical column awayResult">{this.teams[match.away_team].name}</div>
                  <div className="column pts"></div>
                  </div>
              })}
              </div>
            </div>
        </div>
        <div className="tabContent">
        {this.state.games.map((game) => {
            return <div className="tabGame" key={game.gameId}>
              <div className="column gameName">{game.name}</div>
              <div className="column gameEmail">{game.email}</div>
              <div className="column gameUserId">{game.userId}</div>
              <div className="column gameTransactionId" >{game.transactionId}</div>
              <div className="column gameId" >{game.gameId}</div>
              <div className="results">
              {this.state.matches.map((match) => {
                  const idx = match.name
                  return <div className="column result" key={idx}>
                  <div className="column homeResult">{game[idx].h}</div>
                  <div className="column awayResult">{game[idx].a}</div>
                  <div className="column pts"></div>
                  </div>
              })}
              </div>
            </div>
        })}
        </div>



      </div>


    // );
  }
}

