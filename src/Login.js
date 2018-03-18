import React, { Component } from "react"
import {Redirect} from "react-router-dom"
import queryString from 'query-string'
import CircularProgress from 'material-ui/CircularProgress';

import * as firebase from 'firebase'

const provider = new firebase.auth.FacebookAuthProvider();

export default class Login extends Component {

  constructor(props) {
    super(props)
    this.state = {logged: null, user: null, goTo: null}
    this.queryStringParams = queryString.parse(this.props.location.search)

  }


  componentDidMount() {

    const self = this


    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {

        if (self.queryStringParams && self.queryStringParams.fw) {
          self.setState({goTo: `/${self.queryStringParams.fw}` })
        }
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
        {this.state.logged && this.state.goTo && <Redirect to={this.state.goTo} />}
        {this.state.logged == null &&  <div style={{textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>}
        <button onClick={this.login.bind(this)}>Login</button>
        <button onClick={this.logout.bind(this)}>Logout</button>
      </div>
    );
  }
}
