import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import GroupView from './GroupView.js'
import firebase from 'firebase/compat/app';
import {Link, Redirect} from "react-router-dom"
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
import {green700, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import { DATABASE_ROOT_NODE } from './constants';

const style ={
  backgroundImage: "url(background_gs.svg)",
  backgroundColor: "rgb(200,200,200)",
  backgroundOpacity: "0.5",
  backgroundPositionX: "0%"
}

export default class Master extends Component {

  constructor(props) {
    super(props)
    this.state = {logged: null, user: null, bids:[], edit: false}

  }


  componentWillUnmount() {

    if (this.ref) this.ref.off('value')
    if (this.unsubscribe) this.unsubscribe()
  }

  componentDidMount() {
    const self = this
    this.unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        const canEdit = ['alexandre.eisenmann@gmail.com', 'ricardoke@gmail.com','joao@idst.com.br','felipe.lara19@gmail.com'].includes(user.email)
        self.setState({logged: true, user: user, edit: canEdit})
        self.ref = firebase.database().ref(`${DATABASE_ROOT_NODE}/master`)
        self.ref.on('value', snapshot => {
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
    return (
      <div style={style}>
        {this.state.logged == false && <Redirect to='/login?fw=master' />}
        {this.state.logged == null &&  <div style={{backgroundColor: "white", textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>}
        {this.state.logged && this.state.user && <div>
          <div id="gameSection">
            <div>
              <div style={{paddingLeft: "2px", paddingTop: "20px"}}>
                <div style={{textAlign: "center"}} >
                {['a','b','c','d','e','f','g','h'].map(group => (
                  <GroupView viewMode={!this.state.edit}  complete={true} userId={"master"} bids={this.state.bids} gameId={"gabarito"} key={group} group={group}/>
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>}
      </div>
    );
  }
}
