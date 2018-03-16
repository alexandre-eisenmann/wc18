import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import GroupView from './GroupView.js'
import Header from './Header.js'
import * as firebase from 'firebase'
import {Redirect} from "react-router-dom"
import FlatButton from 'material-ui/FlatButton';


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {logged: null, user: null, bids:[], currentBid: null}
  }


  onNewGame() {
    const newRef = firebase.database().ref('wc18/' + this.state.user.uid).push()
    newRef.set({name: "Unknown"})
  }

  onChangeGame(event,bid) {
    this.setState({currentBid: bid})
  }

  componentDidMount() {
    const self = this
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        self.setState({logged: true, user: user})
        const ref = firebase.database().ref(`wc18/${user.uid}`)
        ref.on('value', snapshot => {
          const bids  = {}
          snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key
            var childData = childSnapshot.val()
            console.log(childKey, childData)

            bids[childKey] = childData
            
          });
          self.setState({bids:bids})
        })
    
      } else {
        self.setState({logged: false, user: null})
      }
    });



  }
  
  render() {

    return (
      
      
      <div className="App">
      {this.state.logged == false && <Redirect to="/login"/>}
      {this.state.logged == null && <div>loading...</div>}
      
      <div>
      <div>{this.state.currentBid}</div>  
      <FlatButton  label="new game" onClick={this.onNewGame.bind(this)}/>  
      {this.state.logged && Object.keys(this.state.bids).map((bid) => {
        return <FlatButton hello={2} key={bid} label={`${bid}`} onClick={(event) => this.onChangeGame(event,bid)}/>  
      })}
      </div>
      {this.state.logged && this.state.currentBid && this.state.user && ['a','b','c','d','e','f','g','h'].map(group => (
          <GroupView userId={this.state.user.uid} bids={this.state.bids} gameId={this.state.currentBid} key={group} group={group}/>
      ))}
      </div>
    );
  }
}

export default App;
