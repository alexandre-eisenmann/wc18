import React, { Component } from "react";

import * as firebase from 'firebase'

const provider = new firebase.auth.FacebookAuthProvider();


export default class Login extends Component {

  constructor(props) {
    super(props)
    this.state = {logged: null, user: null}
  }



  componentDidMount() {
    const self = this
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        self.setState({logged: true, user: user})
      } else {
        self.setState({logged: false, user: null})
      }
    });
  }


  login() {
    firebase.auth().signInWithRedirect(provider);
  }

  logout() {
    firebase.auth().signOut()
  }


  render() {
    return (
      <div>
        <div>{this.props.location.state && this.props.location.state.referrer}</div>
        <button onClick={this.login.bind(this)}>Login</button>
        <button onClick={this.logout.bind(this)}>Logout</button>
        <div>{this.state.logged} {this.state.user && this.state.user.uid}</div> 
      </div>
    );
  }
}

