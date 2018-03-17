import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import GroupView from './GroupView.js'
import Header from './Header.js'
import * as firebase from 'firebase'
import {Redirect} from "react-router-dom"
import FlatButton from 'material-ui/FlatButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';




export default class Bid extends Component {

  constructor(props) {
    super(props)
    this.state = {logged: null, user: null, bids:[], currentBid: null}
  }


  onNewGame() {
    const newRef = firebase.database().ref('wc18/' + this.state.user.uid).push()
    newRef.set({name: this.state.user.displayName, email: this.state.user.email, mobile: null})
    this.setState({currentBid: newRef.key})
    
  }

  onChangeGame(event,bid) {
    this.setState({currentBid: bid})
  }

  onNameChange(event, value) {
    firebase.database().ref(`wc18/${this.state.user.uid}/${this.state.currentBid}/name`).set(value)
  }

  onEmailChange(event, value) {
    firebase.database().ref(`wc18/${this.state.user.uid}/${this.state.currentBid}/email`).set(value)
  }

  onMobileChange(event, value) {
    firebase.database().ref(`wc18/${this.state.user.uid}/${this.state.currentBid}/mobile`).set(value)
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
      
      
      <div >
      {this.state.logged == false && <Redirect to="/login"/>}
      {this.state.logged == null && <div>loading...</div>}
      {this.state.logged && this.state.user && <div>
      
        <div style={{position: "relative", paddingLeft: "20px", paddingRight: "20px", paddingTop: "5px",paddingBottom: "5px", backgroundColor: "rgb(232, 232, 232)"}}>
            {Object.keys(this.state.bids).map((bid) => {
            return <FlatButton style={{borderRadius: "16px",
              border: "1px solid #ccc", 
              
              height: "30px", margin: "2px",lineHeight: "0px"
              }}
              labelStyle={{
              fontSize: "10px",
              textTransform: "unset",
              fontFamily: "Lato", 
              fontWeight: "bold",
              color: "#bbb"
            }} key={bid} label={`${this.state.bids[bid]['name']}`} onClick={(event) => this.onChangeGame(event,bid)}/>  
            })}
            <FloatingActionButton secondary={true} style={{position: "absolute", 
                bottom:  "-18px", right: "25px"}}mini={true} onClick={this.onNewGame.bind(this)}>
              <ContentAdd />
            </FloatingActionButton>
        </div>
        
      { this.state.currentBid && 
        <div style={{marginLeft: "20px", marginTop: "20px"}}>
          <div>
            <TextField style={{marginRight: "10px"}} hintText="Name" value={this.state.bids[this.state.currentBid]["name"] || ''} onChange={this.onNameChange.bind(this)}/>
            <TextField style={{marginRight: "10px"}} hintText="Email" value={this.state.bids[this.state.currentBid]["email"] || ''} onChange={this.onEmailChange.bind(this)}/>
            <TextField style={{marginRight: "10px"}} hintText="Mobile Number" value={this.state.bids[this.state.currentBid]["mobile"] || ''} onChange={this.onMobileChange.bind(this)}/>
          </div>
          {['a','b','c','d','e','f','g','h'].map(group => (
            <GroupView userId={this.state.user.uid} bids={this.state.bids} gameId={this.state.currentBid} key={group} group={group}/>
          ))}
        </div>}
      </div>}

      </div>
    );
  }
}
