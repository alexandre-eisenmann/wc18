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
  height: 780,
  width: 290,
  marginRight: "20px",
  marginBottom: "20px",
  display: 'inline-block',
};

export default class GroupView extends Component {

  constructor(props) {
    super(props)

    this.teams = data.teams.reduce((acc, elem) => {
      acc[elem.id] = elem

      return acc
    }, {})

    
    this.matches = data.groups[this.props.group].matches
    this.emptyMatches = this.matches.reduce((acc, elem) => {
        acc[elem.name] = {a: null, h: null}
        return acc
    },{})
    this.flags = require.context("./flags/4x3/", false, /.*\.svg$/);
    
    this.state = Object.assign({}, {gameId: this.props.gameId}, this.props.bids[this.props.gameId])
    console.log('state', this.state)

  
  }


  componentWillReceiveProps(props) {
    console.log("matches", this.emptyMatches)
    const upcoming = Object.assign({}, {gameId:props.gameId}, this.emptyMatches, props.bids[props.gameId])
    this.setState(upcoming)
    console.log('upcoming', upcoming)


  }

  flagSvg(iso2code) {
    return <div style={{width:"480px",height: "60px", background:`url(${this.flags(`./${iso2code}.svg`)}) no-repeat top left`,backgroundSize: "contain"}}></div>

  }


  handleUserChange(event) {
    const fieldTokens = event.target.getAttribute('name').match(/([^-]*)-(.*)/)
    const matchId = fieldTokens[1]
    const team = fieldTokens[2]
    let value = parseInt(event.target.value,10)
    if (isNaN(value)) value = null
    firebase.database().ref(`wc18/${this.props.userId}/${this.props.gameId}/${matchId}/${team}`).set(value)
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
      <div style={{float: "left", marginRight: "20px" }}>
        <div style={{marginLeft: "20px", marginBottom: "30px", marginTop: "20px", textAlign: "left"}}>
          Group {this.props.group.toUpperCase()}
        </div>
        <div>
        {this.matches.map((row,i) => {
            const homeTeam = this.teams[row.home_team]
            const awayTeam = this.teams[row.away_team]
            return (
              <div style={{clear: "both", marginLeft: "20px",height: "120px", marginBottom: "0px", width: "400px", textAlign: "center",position: "relative" }}>

                  <div style={{ float: "left", width: "90px"}}>
                     <div style={{textAlign: "left", fontSize: "14px", marginBottom: "2px"}}>{homeTeam.name}</div>
                     <div>{this.flagSvg(homeTeam.iso2)}</div>
                  </div>



                  <span style={{float: "left", marginTop: "10px"}}>
                    <input
                      type="text" 
                      className='inputNumber'
                      onClick={(event) => event.target.setSelectionRange(0, event.target.value.length)} 
                      pattern="[0-9]" 
                      value={this.readMatchFromState(row.name,'h')}
                      onChange={this.handleUserChange.bind(this)}
                      name={`${row.name}-h`} 
                      maxLength="1" 
                      size="1"/>
                  </span>

                  <span style={{float: "left", marginTop: "16px", marginLeft:  "4px", marginRight: "4px" }}>
                    x
                  </span>
                
                  <span style={{float: "left", marginTop: "10px"}}>
                          <input 
                            type="text" 
                            className='inputNumber'
                            onClick={(event) => event.target.setSelectionRange(0, event.target.value.length)} 
                            pattern="[0-9]" 
                            value={this.readMatchFromState(row.name,'a')} 
                            onChange={this.handleUserChange.bind(this)} 
                            name={`${row.name}-a`} 
                            maxLength="1" 
                            size="1" />
                    </span>

                  <div style={{float: "left", marginLeft: "10px", width: "100px"}}>
                    <div  style={{textAlign: "left",fontSize: "14px" , marginBottom: "2px" }}>{awayTeam.name}</div>
                    <div style={{}} >{this.flagSvg(awayTeam.iso2)}</div>
                  </div>



              </div>

            
            )})}
        </div>
      </div>
      </Paper>








    //   <Paper style={style} zDepth={1} >
    //     <Table style={{tableLayout: 'auto'}}>
    //     <TableHeader   style={{borderBottom: "none"}} adjustForCheckbox={false} displaySelectAll={false}>
    //       <TableRow style={{borderBottom: "none"}}>
    //         <TableHeaderColumn colSpan="7" style={{textAlign: 'left'}}>
    //             Group {this.props.group.toUpperCase()}
    //         </TableHeaderColumn>
    //       </TableRow>
    //     </TableHeader>
    //     <TableBody  displayRowCheckbox={false}>
    //       {this.matches.map((row,i) => {
    //         const homeTeam = this.teams[row.home_team]
    //         const awayTeam = this.teams[row.away_team]
    //         return (<TableRow style={{paddingRight: "0px"}} selectable={false} style={{borderBottom: "none"}} key={i}>
    //           <TableRowColumn style={{paddingLeft: "0px",paddingRight: "0px"}}>{this.flagSvg(homeTeam.iso2)}</TableRowColumn>
    //           <TableRowColumn style={{paddingLeft: "Opx",paddingRight: "0px"}}>{homeTeam.name}</TableRowColumn>
    //           <TableRowColumn style={{paddingLeft: "Opx",paddingRight: "0px"}}>
    //             <input value={this.readMatchFromState(row.name,'h')} onChange={this.handleUserChange.bind(this)} style={numberInput} type="text" name={`${row.name}-h`} maxLength="1" size="1"/>
    //           </TableRowColumn>
    //           <TableRowColumn style={{paddingRight: "0px"}}>x</TableRowColumn>
    //           <TableRowColumn style={{paddingLeft: "Opx",paddingRight: "0px"}}>
    //             <input value={this.readMatchFromState(row.name,'a')}  onChange={this.handleUserChange.bind(this)} style={numberInput} type="text" name={`${row.name}-a`} maxLength="1" size="1"/>
    //           </TableRowColumn>
    //           <TableRowColumn style={{paddingLeft: "Opx",paddingRight: "0px"}}>{awayTeam.name}</TableRowColumn>
    //           <TableRowColumn style={{paddingLeft: "Opx",paddingRight: "0px"}}>{this.flagSvg(awayTeam.iso2)}</TableRowColumn>
    //         </TableRow>)
    //       })}
    //     </TableBody>
    //   </Table>
    // </Paper>
      
    )  
  }
}
