import React, { Component } from "react";
import {
  Route,
  Link,
  BrowserRouter,
  Redirect,
  withRouter
} from "react-router-dom"
import Bid from './Bid'
import Master from './Master'
import Home from './Home'
import Login from './Login'
// import Leaderboard from './Leaderboard'
import Leaderboard from './Leaderboard3'
import Ranking from './Ranking'
import RankingBars from './RankingBars'
import BarRace from './BarRace'
import Viz from './Viz'
import VizHist from './VizHist'
import Rules from './Rules'
import NotAvailable from './NotAvailable'
import Payment from './Payment'
import firebase from 'firebase/compat/app';
import {Tabs, Tab} from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {green700, blue600,cyan500} from 'material-ui/styles/colors';



const bgColor = blue600

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

    
    const params = {}
    if (this.state.logged) {
      params['iconElementRight'] = toolbar(`${this.state.user.photoURL}`)
    }
    

    return (
        <MuiThemeProvider>
        <BrowserRouter>

          <div>

            
            <div className="header">
            <Route render={(props) => {
              if (!(props.location.pathname == "/")) {
                return <div>
                <AppBar style={{boxShadow: "none", backgroundColor: bgColor}}
                title={"Bolão dos Bolões"}
                showMenuIconButton={false}
                {...params}
                >
                </AppBar>

                <Tabs style={{backgroundColor: bgColor}} initialSelectedIndex={["/","/bids"].indexOf(window.location.pathname)}>
                <Tab style={{backgroundColor: bgColor}} label="HOME" containerElement={<Link to="/" />} />
                <Tab style={{backgroundColor: bgColor}} label="JOGOS" containerElement={<Link to="/bids" />} />
                <Tab style={{backgroundColor: bgColor}} label="TABELÃO" containerElement={<Link to="/leaderboard" />} />
                <Tab style={{backgroundColor: bgColor}} label="RANKING" containerElement={<Link to="/barrace" />} />
                <Tab style={{backgroundColor: bgColor}} label="BLOG" containerElement={<a href="https://medium.com/bolão-dos-bolões-2018" />} />

                </Tabs>
                </div>
              } else { 
                return null
              }
              
            }} />

            </div>

            <div className="content">
              <Route exact path="/" component={Home}/>
              <Route path="/login" component={Login}/>
              <Route path="/login/*" component={Login}/>
              <Route path="/bids" component={Bid}/>
              <Route path="/abc" component={Bid}/>
              <Route path="/master" component={Master}/>
              <Route path="/payment" component={Payment}/>
              <Route path="/leaderboard" component={Leaderboard}/>
              <Route path="/viz" component={Viz}/>
              <Route path="/rules" component={Rules}/>
              <Route path="/vizhist" component={VizHist}/>
              <Route path="/ranking" component={Ranking}/>
              <Route path="/barrace" component={BarRace}/>
              {/* <Route path="/rankingbars" component={RankingBars}/> */}

            </div>

          </div>

        </BrowserRouter>
        </MuiThemeProvider>

    );
  }
}

export default Main;
