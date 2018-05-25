  import React, { Component } from "react";
  import NodeGroup from 'react-move/NodeGroup';

  import data from './data.json'
  import moment from 'moment'
  import { StickyTable, Row, Cell } from 'react-sticky-table';
  import CircularProgress from 'material-ui/CircularProgress';
  import 'react-sticky-table/dist/react-sticky-table.css';
  import {blue500, grey300,grey400,grey200,lightGreen500, orange200,deepOrange500, orange900,yellow500,green700, orange500, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100} from 'material-ui/styles/colors'
  import * as firebase from 'firebase'
  import './flags.css';
  import SearchBar from 'material-ui-search-bar'
  import FontIcon from 'material-ui/FontIcon';
  import IconButton from 'material-ui/IconButton';
  import { easeExpInOut } from 'd3-ease';

  export default class MatchViz extends Component {

    constructor(props) {
      super(props)
      this.teams = data.teams.reduce((acc,ele) => {acc[ele.id] = ele; return acc}, {})
      this.state = {games: [], summary: {}}
    }

    componentWillUnmount() {
    }

    componentDidMount() {
        this.loadGames(this.props.match.name)
    }

    loadGames = (matchId) => {
      const games = []
      firebase.database().ref(`wc18`).once('value', snapshot => {
        snapshot.forEach(function(childSnapshot) {
          var childKey = childSnapshot.key
          var childData = childSnapshot.val()

          Object.keys(childData).map((key) => {
            const id = key
            const details = { res:childData[key][matchId],status:childData[key].status}
            
            if (details.status == "payed") {
              Object.assign(details, {gameId: id, userId: childKey})
              
              games.push(details)
            }
        })
        });
        this.setState({games: games})
      })
    }

    render() {
      // const summary = this.state.games.reduce((acc,ele) => {acc[ele.res.a+"-"+ele.res.h]=(acc[ele.res.a+"-"+ele.res.h] ? acc[ele.res.a+"-"+ele.res.h] : 0)+1 ; return acc},{})
      const self = this
      const unit = 20

      return <div>
                {/* <div style={{position: "absolute", left: "300px"}}>
                  <div className={`viz-flags f-${this.teams[this.props.match.home_team].iso2}`}></div>
                  <div className={`viz-flags f-${this.teams[this.props.match.away_team].iso2}`}></div>
                </div> */}

              <svg viewBox="0 0 200 110"> 

                <g transform="translate(100,100) rotate(225 0 0)">
                    <line x1={-0*unit} y1={-0*unit} x2={-0*unit} y2={100} style={{stroke: "black",strokeWidth: 0.4}} opacity={0.2}/>
                    <text transform="rotate(180 100 0) " style={{fontSize:"4px", fontFamily: "Lato"}}  x={100} dy={4} y={0} >{this.teams[this.props.match.away_team].name.toUpperCase()}</text>
                    <line x1={-0*unit} y1={-0*unit} x2={100} y2={-0*unit} style={{stroke: "black", strokeWidth: 0.4}} opacity={0.2}/>
                    <text transform="rotate(90 0 100)" style={{ fontSize:"4px", fontFamily: "Lato"}} textAnchor={"end"}  x={0} dy={4} y={100} >{this.teams[this.props.match.home_team].name.toUpperCase()}</text>

                    {Object.keys(this.state.summary).map((key,i) => {
                      const qtd = this.state.summary[key]
                      const a = key.substring(0,1) 
                      const h = key.substring(2,3)
                      // const r = Math.sqrt(qtd/Math.PI)*5 
                      const r = qtd
                      if (a != h) {
                        const color = a > h ? "red" : "blue"
                        return <circle key={i} fill={color} cx={a*unit} cy={h*unit} r={r} opacity={0.5}/>
                      } else {
                        const rr = Math.sin(Math.PI/4)*(r)
                        return <g key={i} >
                          <path fill={"red"} d = {`M${a*unit-rr},${h*unit-rr} L${a*unit+rr},${h*unit+rr} A${r},${r} 0 1,0 ${a*unit-rr},${h*unit-rr} z`} opacity={0.5}/>
                          <path fill={"blue"}  d = {`M${a*unit-rr},${h*unit-rr} L${a*unit+rr},${h*unit+rr} A${r},${r} 0 1,1 ${a*unit-rr},${h*unit-rr} z`}opacity={0.5} />
                        </g>

                      }
                    } )}



                    <NodeGroup
                      data={this.state.games}
                      keyAccessor={(d) => d.gameId}

                      start={(d,i) => ({
                        opacity: 0.5,
                        x: 0,
                        y: 0 
                      })}

                      enter={(d,i) => ([{
                        opacity: [0.5],
                        x: [d.res.a],
                        y: [d.res.h],
                        timing: { delay: i*80,duration: 750, ease: easeExpInOut },
                        events: {
                          end() { // runs in the context of the node
                            
                            const bag = {...self.state.summary}
                            bag[d.res.a+"-"+d.res.h]=( bag[d.res.a+"-"+d.res.h] ? bag[d.res.a+"-"+d.res.h] : 0)+1
                            self.setState({summary: bag })
                          },
                        },



                      },{
                        opacity: [0],
                        timing: {delay:(i*80)+750}
                      }]

                    )}
                    >
                      {(nodes) => (
                        <g>
                          {nodes.map(({ key, data, state }) => {  
                            const { opacity, x, y, ...rest } = state;
                            

                            return (
                                <g key={key}>
                                <circle 
                                  stroke={"black"}
                                  fill={"transparent"}
                                  opacity={opacity} 
                                  cx={x*unit}
                                  cy={y*unit}
                                  strokeWidth={0.6}
                                  r={2}
                                />
                                </g>
                            );
                          })}
                        </g>
                      )}
                  </NodeGroup>
                </g>
            </svg>
        </div>
    }
  }

