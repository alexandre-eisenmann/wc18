import React, { Component } from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import Paper from 'material-ui/Paper'
import data from './data.json'
import firebase from 'firebase/compat/app';
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import {green700, blue600, cyan500, cyan100,pink500} from 'material-ui/styles/colors'
import moment from 'moment'
import './flags.css'
import { DATABASE_ROOT_NODE } from "./constants";



export default class GroupView extends Component {

  constructor(props) {
    super(props)

    this.teams = data.teams.reduce((acc, elem) => {
      acc[elem.id] = elem

      return acc
    }, {})

    
    this.matches = data.groups[this.props.group].matches.sort((a,b) => {
        if (moment(a.date).isBefore(moment(b.date) )) 
          return -1
        else if (moment(a.date).isAfter(moment(b.date)))
          return 1 
        return 0
    })
    this.emptyMatches = this.matches.reduce((acc, elem) => {
        acc[elem.name] = {a: null, h: null}
        return acc
    },{})
    
    this.state = Object.assign({}, {gameId: this.props.gameId, complete: false}, this.props.bids[this.props.gameId])
    

  
  }

  UNSAFE_componentWillReceiveProps(props) {
    const upcoming = Object.assign({}, {gameId:props.gameId}, this.emptyMatches, props.bids[props.gameId])
    this.setState(upcoming)
    
  }

  updateResult(match,team,value) {
    if (isNaN(value)) value = null
    firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.props.userId}/${this.props.gameId}/${match}/${team}`).set(value)
  }


  handleUserChange(event) {
    const fieldTokens = event.target.getAttribute('name').match(/([^-]*)-(.*)/)
    const matchId = fieldTokens[1]
    const team = fieldTokens[2]
    let value = parseInt(event.target.value,10)
    if (isNaN(value)) value = null
    firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.props.userId}/${this.props.gameId}/${matchId}/${team}`).set(value)
  }


  readMatchFromState(match, team) {
    if (this.state[match]) {
      const result = this.state[match][team]
      if (result || result == 0) 
         return result
    }
    return ''
  }

  render() {
    return (

      <Paper style={{ marginLeft: "10px", marginRight: "10px", marginBottom: "20px", display: 'inline-block'}} zDepth={1} >
      <div style={{float: "left", paddingRight: "18px", border: this.props.complete ? "2px solid transparent" : `2px solid ${pink500}`  }} className="groupbox">
        <div style={{marginLeft: "20px", marginBottom: "30px", marginTop: "20px", textAlign: "left"}}>
          Group {this.props.group.toUpperCase()}
        </div>
        <div>
        {this.matches.map((row,i) => {
            const homeTeam = this.teams[row.home_team]
            const awayTeam = this.teams[row.away_team]
            return (
              <div key={i} style={{clear: "both", marginLeft: "18px",height: "120px", marginBottom: "0px", textAlign: "center",position: "relative" }} className="grouprow">

                  <div style={{ float: "left"}}>
                     <div style={{textAlign: "left", fontSize: "14px", marginBottom: "2px"}}>{homeTeam.name}</div>
                     <div><div className={`bids-flags f-${homeTeam.iso2}`}></div></div>
                  </div>


                  <span style={{float: "left", marginLeft: "10px", marginTop: "10px", postion: "relative"}}>
                    <input
                      type="text" 
                      className='inputNumber'
                      style={{marginRight: "2px"}}
                      value={this.readMatchFromState(row.name,'h')}
                      onChange={this.handleUserChange.bind(this)}
                      name={`${row.name}-h`} 
                      maxLength="1" 
                      pattern="[0-9]"
                      size="1"
                      disabled={this.props.viewMode}
                      />
                  </span>

                  <span style={{float: "left", marginTop: "26px", marginLeft:  "4px", marginRight: "4px", fontSize: "12px"}}>
                    x
                  </span>

                  <span style={{float: "left", marginTop: "10px"}}>
                
                    <input 
                      type="text" 
                      className='inputNumber'
                      style={{marginLeft: "2px"}}
                      value={this.readMatchFromState(row.name,'a')} 
                      onChange={this.handleUserChange.bind(this)} 
                      name={`${row.name}-a`} 
                      maxLength="1" 
                      pattern="[0-9]"
                      size="1"
                      disabled={this.props.viewMode}
                      />
                    </span>

                  <div style={{float: "left", marginLeft: "10px"}}>
                    <div  style={{textAlign: "left",fontSize: "14px" , marginBottom: "2px" }}>{awayTeam.name}</div>
                    <div><div className={`bids-flags f-${awayTeam.iso2}`}></div></div>

                  </div>



              </div>

            
            )})}
        </div>
      </div>
      </Paper>

      
    )  
  }
}
