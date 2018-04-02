import React, { Component } from "react"
import {Redirect} from "react-router-dom"
import queryString from 'query-string'
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog';

import * as firebase from 'firebase'

const provider = new firebase.auth.FacebookAuthProvider();

export default class Login extends Component {

  constructor(props) {
    super(props)
    this.state = {logged: null, user: null, goTo: null, open:true}
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


  handleCancel() {
    this.setState({open: false})
  }

  render() {

    return (
      <div>
        {this.state.logged && this.state.goTo && <Redirect to={this.state.goTo} />}
        {this.state.logged == null &&  <div style={{textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>}
        {!this.state.open && <Redirect to="/" /> }
        {this.state.logged == false && <Dialog contentStyle={{width: "350px"}}
          title="Login"
          modal={false}
          open={this.state.open}
        >
            <div>
            <div style={{float: "left"}}><button style={{cursor: "pointer",  width: "202px", border: "none", height: "46px", background: "url(login_facebook.png)"}} onClick={this.login.bind(this)}></button></div>
            
            <div style={{float: "right"}}><FlatButton
              label="Cancel"
              primary={true}
              onClick={this.handleCancel.bind(this)}
            />
            </div>
            
            </div>
          
        </Dialog>}
        
        {/* <div style={{float: "right"}}><FlatButton
              label="Logout"
              primary={true}
              onClick={this.logout.bind(this)}
            /></div> */}


      </div>
    );
  }
}
