import React, { Component } from "react";
import {
  Route,
  Link,
  BrowserRouter,
  NavLink,
  Redirect
} from "react-router-dom"
import Bid from './Bid'
import Home from './Home'
import Login from './Login'
import Leaderboard from './Leaderboard'
import Payment from './Payment'
import * as firebase from 'firebase'
import {Tabs, Tab} from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {green700, blue600,cyan500} from 'material-ui/styles/colors';




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


  logout() {
    firebase.auth().signOut()
  }
  

  render() {


      const toolbar = (url) => <div>
        <div style={{position: "relative"}} > 
          <FlatButton
                label="Logout"
                onClick={this.logout.bind(this)}
                labelStyle={{fontSize: "10px", color: "#ccc"}}
                style ={{position: "absolute", top: "0px", left: "-80px"}}
              />


          <Avatar size={30} src={url} /> 
        </div>
      </div>


    return (
        <MuiThemeProvider>
        <BrowserRouter>

          <div>
            <div className="header">
            <AppBar style={{boxShadow: "none", backgroundColor: blue600}}
                title={"Copa do Mundo 2018"}
                showMenuIconButton={false}
                iconElementRight={this.state.logged && toolbar(this.state.user.photoURL)}>
            </AppBar>

            <Tabs style={{backgroundColor: blue600}}>
              <Tab style={{backgroundColor: blue600}} label="HOME" containerElement={<NavLink to="/" />} />
              <Tab style={{backgroundColor: blue600}} label="MEUS JOGOS" containerElement={<NavLink to="/bids" />} />
              <Tab style={{backgroundColor: blue600}} label="PAGAMENTO" containerElement={<NavLink to="/payment" />} />
            </Tabs>
            </div>

            <div className="content">
              <Route exact path="/" component={Home}/>
              <Route path="/login" component={Login}/>
              <Route path="/login/*" component={Login}/>
              <Route path="/bids" component={Bid}/>
              <Route path="/payment" component={Payment}/>
              <Route path="/leaderboard" component={Leaderboard}/>


            </div>

          </div>

        </BrowserRouter>
        </MuiThemeProvider>

    );
  }
}

export default Main;
