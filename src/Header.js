import React, { Component } from "react";

import data from './data.json'
import * as firebase from 'firebase'
import FlatButton from 'material-ui/FlatButton';
import AppBar from 'material-ui/AppBar';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';


import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import {
  Tab,
  Tabs
} from 'material-ui/Tabs';




const provider = new firebase.auth.FacebookAuthProvider();


export default class Header extends Component {

  constructor(props) {
    super(props)
    this.state = {}
    
  }



  login() {
    firebase.auth().signInWithRedirect(provider);
  }

  logout() {
      const self = this
      firebase.auth().signOut().then(function() {
        self.setState({user: null})
      }).catch(function(error) {
        // An error happened.
      });
  }

  newGame() {
    const newRef = firebase.database().ref('wc18/' + this.state.user.uid).push()
    
    const game = {1: [2,1], 2: [3,0]}

    newRef.set(game)
  }



  componentDidMount() {
    const self = this
    firebase.auth().getRedirectResult().then(function(result) {
      if (result.credential) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var token = result.credential.accessToken;
        // ...
      }
      // The signed-in user info.
      var user = result.user;

      if (result.user) {
        console.log("User just sign in", result.user, result.credential)
        self.setState({
          user: result.user
        })
      } else if (firebase.auth().currentUser) {
        const profile = firebase.auth().currentUser

        console.log("Sign-in provider: " + profile.providerId);
        console.log("  Provider-specific UID: " + profile.uid);
        console.log("  Name: " + profile.displayName);
        console.log("  Email: " + profile.email);
        console.log("  Photo URL: " + profile.photoURL)

        self.setState({
          user: profile
        })

      } else {
        console.log('no user!!')
        self.setState({user: null})
      }

    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });


  }
  
  render() {
    // <div>
    // <FlatButton label="Login" onClick={this.login.bind(this)}/>
    // <FlatButton label="logout" onClick={this.logout.bind(this)}/>
    // </div>
    // <AppBar title="Worldcup 2018" iconElementRight={<FlatButton label="Login" onClick={this.login.bind(this)}/>} />

    const Logged = (props) => (
      <span>
        <FlatButton  label="new game" onClick={this.newGame.bind(this)}/>  
        <div>{this.state.user.uid}</div>
      <Avatar src={props.user.photoURL} />
      <FlatButton  label="logout" onClick={this.logout.bind(this)}/>
      </span>
      
    );

    Logged.muiName = 'IconMenu';

    const login = <FlatButton  label="Login" onClick={this.login.bind(this)}/>

  // { <AppBar showMenuIconButton={false} title="Worldcup 2018" iconElementRight={this.state.user == null ?  login : <Logged user={this.state.user}/>} /> }

    return (
      <AppBar showMenuIconButton={false} title="XXXX"
       iconElementRight={this.state.user == null ?  login : <Logged user={this.state.user}/>} />
      
    )  
  }
}
