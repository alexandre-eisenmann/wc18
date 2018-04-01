import React, { Component } from "react";
import * as firebase from 'firebase'

export default class Leaderboard extends Component {

  constructor(props) {
    super(props)
    this.state = {games: []}

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

      
      console.log(games)

      
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
    return (
      <div>
        <div className="tabContainer">
        {this.state.games.map((game) => {
            return <div className="tabGame" key={game.gameId}>
              <div className="column gameName">{game.name}</div>
              <div className="column gameEmail">{game.email}</div>
              <div className="column gameUserId">{game.userId}</div>
              <div className="column gameTransactionId" >{game.transactionId}</div>
              <div className="column gameId" >{game.gameId}</div>
              <div className="results">
              {[...Array(47).keys()].map((result) => {
                  const idx = result + 1
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


    );
  }
}

