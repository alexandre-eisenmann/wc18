import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import GroupView from './GroupView.js'
import Header from './Header.js'
import * as firebase from 'firebase'
import {Redirect} from "react-router-dom"


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {logged: null, user: null, bids:[]}
  }


  componentDidMount() {
    const self = this
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        self.setState({logged: true, user: user})
        const ref = firebase.database().ref(`wc18/${user.uid}`)
        ref.on('value', snapshot => {
          const bids  = []
          snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            bids.push(childKey)
            
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
      {this.state.logged && this.state.bids.map((bid) => {
        return <a key={bid} href={`/bid/${bid}`}>{bid}</a>
      })}
      </div>
      {this.state.logged && this.state.user && ['a','b','c','d','e','f','g','h'].map(group => (
          <GroupView userId={this.state.user.uid} gameId={this.props.match.params.id} key={group} group={group}/>
      ))}
      </div>
    );
  }
}

export default App;
