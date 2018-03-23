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
import data from './data.json'
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import {green700} from 'material-ui/styles/colors';


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
    this.state = {logged: null, user: null, bids:[], currentBid: null, deleteBid: null, status: null}

  }

  isComplete() {
    for(let i=0; i < this.matches.length ; i++) {
        const row = this.matches[i]  
        if (this.readMatchFromState(row.name, 'h') === '' || this.readMatchFromState(row.name, 'a') === '') {
          return false
        }
    }
    return true
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

  calculateStatus(bids) {
    const global_status = {}
    Object.keys(bids).map((bid) => {
      const status={
        name: bids[bid].name ? true : false,
        email: bids[bid].email ? true : false
      }
      
      Object.keys(data.groups).map(group => {
          const matches = data.groups[group]["matches"]
            let complete = true
            for(let i=0; i< matches.length ; i++) {
                const result = bids[bid][matches[i].name]
                if (!(result && (result['h'] || result['h'] == 0) && (result['a'] || result['a'] == 0))) {
                  complete = false
                  break
                }
            }
          status[group] = complete
      })
      global_status[bid] = status
  
    })
    return global_status
    
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
          
          self.setState({bids:bids, status: self.calculateStatus(bids)})
        })
    
      } else {
        self.setState({logged: false, user: null})
      }
    });



  }

  isComplete(bid) {
    return bid && Object.values(this.state.status[bid]).filter((L) => !L).length == 0 
  }

  
  render() {

    let status = "Incompleto"
    let complete = false
    if (this.isComplete(this.state.currentBid)) {
      status = "Completo"
      complete = true
    }



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
      
      
      <div style={{backgroundColor: "#eeeeee"}}>
      {this.state.logged == false && <Redirect to='/login?fw=bids' />}
      {this.state.logged == null &&  <div style={{backgroundColor: "white", textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>}
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
           {this.isComplete(bid) ?
             <Avatar color={green700} fontSize={"10px"} backgroundColor={"#F5F5F5"} icon={<FontIcon className="material-icons">check_circle</FontIcon>} /> : 
             <Avatar color={"#666"} backgroundColor={"#F5F5F5"} icon={<FontIcon className="material-icons">mode_edit</FontIcon>} />
             }
            {`${this.state.bids[bid]['name']}`}
            </Chip>
            })}
            <FloatingActionButton secondary={true} style={{position: "absolute", 
                bottom:  "-18px", right: "25px"}}mini={true} onClick={this.onNewGame.bind(this)}>
              <ContentAdd />
            </FloatingActionButton>
        </div>
        
      { this.state.currentBid && 
        <div style={{marginLeft: "2px", marginTop: "20px"}}>
          <div style={{marginBottom: "20px", marginLeft: "20px", fontSize: "12px", color: complete ? "#ccc" : "red", fontWeight: "bold"}}>{`Jogo ${status}`}</div>
          <div style={{width: "256px", margin: "auto",marginBottom: "20px"}}>
            <TextField errorText={this.state.bids[this.state.currentBid]["name"] ? "" : "Campo obrigatório"} style={{fontSize: "12px", display: "block", marginRight: "10px"}} hintText="Name" value={this.state.bids[this.state.currentBid]["name"] || ''} onChange={this.onNameChange.bind(this)}/>
            <TextField errorText={this.state.bids[this.state.currentBid]["email"] ? "" : "Campo obrigatório"} style={{fontSize: "12px", display: "block", marginRight: "10px"}} hintText="Email" value={this.state.bids[this.state.currentBid]["email"] || ''} onChange={this.onEmailChange.bind(this)}/>
            <TextField style={{fontSize: "12px", display: "block", marginRight: "10px"}} hintText="Mobile Number" value={this.state.bids[this.state.currentBid]["mobile"] || ''} onChange={this.onMobileChange.bind(this)}/>
          </div>
          <div style={{textAlign: "center"}} >
          {['a','b','c','d','e','f','g','h'].map(group => (
            <GroupView complete={this.state.status ? this.state.status[this.state.currentBid][group] : false} userId={this.state.user.uid} bids={this.state.bids} gameId={this.state.currentBid} key={group} group={group}/>
          ))}
          </div>
        </div>}
      </div>}

      </div>
    );
  }
}
