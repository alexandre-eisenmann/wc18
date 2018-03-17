import React, { Component } from "react";
import {
  Route,
  NavLink,
  BrowserRouter,
  Redirect
} from "react-router-dom"
import Bid from './Bid'
import Home from './Home'
import Login from './Login'
import Leaderboard from './Leaderboard'
import * as firebase from 'firebase'
import {Tabs, Tab} from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';




class Main extends Component {

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

  render() {


    const toolbar = (url) => <div>
        <Avatar size={30} src={url} />
      </div>


    return (
        <MuiThemeProvider>
        <BrowserRouter>

          <div>
            <div className="header">
            <AppBar style={{boxShadow: "none"}}
                title={"Worldcup 2018"}
                showMenuIconButton={false}
                iconElementRight={this.state.logged && toolbar(this.state.user.photoURL)}>
            </AppBar>

            <Tabs >
              <Tab label="HOME" containerElement={<NavLink exact to="/" />} />
              <Tab label="LOGIN" containerElement={<NavLink to="/login" />} />
              <Tab label="MY BIDS" containerElement={<NavLink to="/bids" />} />
              <Tab label="LEADERBOARD" containerElement={<NavLink to="/leaderboard" />} />
            </Tabs>
            </div>

            <div className="content">
            <Route exact path="/" component={Home}/>
            <Route path="/login" component={Login}/>
            <Route path="/bids" component={Bid}/>
            <Route path="/leaderboard" component={Leaderboard}/>

            </div>

          </div>

        </BrowserRouter>
        </MuiThemeProvider>

    );
  }
}

export default Main;
