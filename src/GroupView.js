import React, { Component } from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import Paper from 'material-ui/Paper';
import data from './data.json'
import * as firebase from 'firebase'
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

const style = {
  height: 400,
  width: 600,
  margin: 20,
  display: 'inline-block',
};

const numberInput = {
  fontSize: "16px",
  textAlign: "center",
  border: "none",
  borderBottom: "2px solid #ccc"
}



export default class GroupView extends Component {

  constructor(props) {
    super(props)

    this.teams = data.teams.reduce((acc, elem) => {
      acc[elem.id] = elem
      return acc
    }, {})

    this.matches = data.groups[this.props.group].matches
    this.flags = require.context("./flags/4x3/", false, /.*\.svg$/);
    
    this.state = {gameId: this.props.gameId}

  
  }


  flagSvg(iso2code) {
    return <div style={{width:"40px",height: "30px", background:`url(${this.flags(`./${iso2code}.svg`)}) no-repeat top left`,backgroundSize: "contain"}}></div>

  }


  handleUserChange(event) {
    const fieldTokens = event.target.getAttribute('name').match(/([^-]*)-(.*)/)
    const matchId = fieldTokens[1]
    const team = fieldTokens[2]
    let value = parseInt(event.target.value,10)
    if (isNaN(value)) value = null
    firebase.database().ref(`wc18/${this.props.userId}/${this.props.gameId}/${matchId}/${team}`).set(value)
  }


  componentDidMount() {
        

        this.matches.map(row => {
          const ref = firebase.database().ref(`wc18/${this.props.userId}/${this.props.gameId}/${row.name}`)

          ref.on('value', snap => {
              this.setState({[row.name]: snap.val()})
          })

          // ref.once('value').then(snap => {
          //     if (snap.val())
          //       this.setState({[row.name]: snap.val()})
          //   })
        })
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
      <Paper style={style} zDepth={1} >
        <Table style={{tableLayout: 'auto'}}>
        <TableHeader   style={{borderBottom: "none"}} adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow style={{borderBottom: "none"}}>
            <TableHeaderColumn colSpan="7" style={{textAlign: 'left'}}>
                Group {this.props.group.toUpperCase()}
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody  displayRowCheckbox={false}>
          {this.matches.map((row,i) => {
            const homeTeam = this.teams[row.home_team]
            const awayTeam = this.teams[row.away_team]
            return (<TableRow selectable={false} style={{borderBottom: "none"}} key={i}>
              <TableRowColumn >{this.flagSvg(homeTeam.iso2)}</TableRowColumn>
              <TableRowColumn>{homeTeam.name}</TableRowColumn>
              <TableRowColumn >
                <input value={this.readMatchFromState(row.name,'h')} onChange={this.handleUserChange.bind(this)} style={numberInput} type="text" name={`${row.name}-h`} maxLength="1" size="1"/>
              </TableRowColumn>
              <TableRowColumn>x</TableRowColumn>
              <TableRowColumn >
                <input value={this.readMatchFromState(row.name,'a')}  onChange={this.handleUserChange.bind(this)} style={numberInput} type="text" name={`${row.name}-a`} maxLength="1" size="1"/>
              </TableRowColumn>
              <TableRowColumn>{awayTeam.name}</TableRowColumn>
              <TableRowColumn >{this.flagSvg(awayTeam.iso2)}</TableRowColumn>
            </TableRow>)
          })}
        </TableBody>
      </Table>
    </Paper>
      
    )  
  }
}
