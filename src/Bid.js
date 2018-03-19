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
import Chip from 'material-ui/Chip';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

const chipStyles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

export default class Bid extends Component {

  constructor(props) {
    super(props)
    this.state = {logged: null, user: null, bids:[], currentBid: null, deleteBid: null}
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
  
  onRequestDelete(event, bid) {
    this.setState({deleteBid: bid})
  }

  handleClose() {
    this.setState({deleteBid: null})
  }

  handleDelete() {
    firebase.database().ref(`wc18/${this.state.user.uid}/${this.state.deleteBid}`).remove()
    if (this.state.deleteBid == this.state.currentBid)
      this.setState({currentBid: null})
    this.setState({deleteBid: null})
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

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose.bind(this)}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        onClick={this.handleDelete.bind(this)}
      />,
    ];

    return (
      
      
      <div >
      {this.state.logged == false && <Redirect to='/login?fw=bids' />}
      {this.state.logged == null &&  <div style={{textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>}
      {this.state.logged && this.state.user && <div>
        <Dialog
          title={`Delete ${this.state.bids[this.state.deleteBid] ? this.state.bids[this.state.deleteBid]["name"] : ""}?`}
          actions={actions}
          modal={true}
          open={this.state.deleteBid != null}
        >
          Make sure this bid is the one you intent do delete.
        </Dialog>

        <div style={{display: "flex", flexWrap: "wrap", minHeight: "40px", position: "relative", paddingLeft: "20px", paddingRight: "20px", paddingTop: "5px",paddingBottom: "5px", backgroundColor: "#E0E0E0"}}>
            {Object.keys(this.state.bids).map((bid) => {
            return <Chip style={{backgroundColor: "#F5F5F5", margin: "4px"}} key={bid} 
            onClick={(event) => this.onChangeGame(event,bid)}
            onRequestDelete={(event) => this.onRequestDelete(event,bid)}
            >
            {`${this.state.bids[bid]['name']}`}
            </Chip>
            })}
            <FloatingActionButton secondary={true} style={{position: "absolute", 
                bottom:  "-18px", right: "25px"}}mini={true} onClick={this.onNewGame.bind(this)}>
              <ContentAdd />
            </FloatingActionButton>
        </div>
        
      { this.state.currentBid && 
        <div style={{marginLeft: "5px", marginTop: "20px"}}>
          <div style={{marginBottom: "20px"}}>
            <TextField style={{fontSize: "12px", display: "block", marginRight: "10px"}} hintText="Name" value={this.state.bids[this.state.currentBid]["name"] || ''} onChange={this.onNameChange.bind(this)}/>
            <TextField style={{fontSize: "12px", display: "block", marginRight: "10px"}} hintText="Email" value={this.state.bids[this.state.currentBid]["email"] || ''} onChange={this.onEmailChange.bind(this)}/>
            <TextField style={{fontSize: "12px", display: "block", marginRight: "10px"}} hintText="Mobile Number" value={this.state.bids[this.state.currentBid]["mobile"] || ''} onChange={this.onMobileChange.bind(this)}/>
          </div>
          <div>
          {['a','b','c','d','e','f','g','h'].map(group => (
            <GroupView userId={this.state.user.uid} bids={this.state.bids} gameId={this.state.currentBid} key={group} group={group}/>
          ))}
          </div>
        </div>}
      </div>}

      </div>
    );
  }
}
