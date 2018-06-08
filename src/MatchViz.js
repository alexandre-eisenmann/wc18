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
import { connect } from "tls";
  

  export default class MatchViz extends Component {

    constructor(props) {
      super(props)
      this.teams = data.teams.reduce((acc,ele) => {acc[ele.id] = ele; return acc}, {})
      this.state = {render: false, games: this.props.games, summary: {}}
      this.ref = React.createRef()

    }

    componentWillReceiveProps(props) {
      if (props.games && props.games.length > 0) {
        this.checkIfInViewport()
        this.setState({games: props.games})
      }
    }

    isInViewport() {
      if (!this.ref.current) return false;
      const rect = this.ref.current.getBoundingClientRect()
      const top = rect.top;
      const height = rect.height
      return top < window.innerHeight && (top + height) > 0
    }
  
    checkIfInViewport() {
      if (this.isInViewport()) {
        this.setState({render: true})
      } 
    }

    componentDidMount() {
      this.checkIfInViewport()
      window.addEventListener('scroll', this.handleScroll.bind(this))
      
    }
  
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll.bind(this))
    }
  
    handleScroll(event)  {
      this.checkIfInViewport()
    }


   render() {
      const self = this
      const unit = 20

      const color = this.props.darkMode ? "white" : "black"

      return <div ref={this.ref} style={{margin: "auto", maxWidth: "500px", position: "relative"}}>
              <svg viewBox="0 0 180 180"> 
                <g transform="translate(90,160) rotate(225 0 0)">
                    <line x1={-0*unit} y1={-0*unit} x2={-0*unit} y2={100} style={{stroke: color,strokeWidth: 0.6}} opacity={0.8}/>
                    {[...Array(6).keys()].map((gols) => {
                        return <g key={gols}>
                          <line x1={gols*unit} y1={-0*unit} x2={gols*unit} y2={100} style={{stroke: color,strokeWidth: 0.2}} opacity={0.2}/>
                          <line x1={-0*unit} y1={gols*unit} x2={100} y2={gols*unit} style={{stroke: color, strokeWidth: 0.2}} opacity={0.2}/>
                          {gols < 5 ?
                            <g>
                              <text opacity={0.5} fill={color} transform={`rotate(180 ${gols*unit} 100)`} style={{fontSize:"4px", fontFamily: "Lato"}}  x={gols*unit} dx={-4} dy={4} y={100} >{gols}</text>
                              <text opacity={0.5} fill={color} transform={`rotate(90 100 ${gols*unit})`} style={{fontSize:"4px", fontFamily: "Lato"}}  x={100} dx={1} dy={4} y={gols*unit} >{gols}</text>
                            </g>: null}
                        </g>
                    })}
 
                    <text transform="rotate(180 100 0) " fill={color} style={{fontSize:"6px", fontFamily: "Lato"}}  x={100} dy={8} y={0} >{this.props.awayTeam.toUpperCase()}</text>
                    <line x1={-0*unit} y1={-0*unit} x2={100} y2={-0*unit} style={{stroke: color, strokeWidth: 0.6}} opacity={0.8}/>
                    <text transform="rotate(90 0 100)" fill={color} style={{ fontSize:"6px", fontFamily: "Lato"}} textAnchor={"end"}  x={0} dy={8} y={100} >{this.props.homeTeam.toUpperCase()}</text>

                    {Object.keys(this.state.summary).map((key,i) => {
                      const qtd = this.state.summary[key]
                      const a = key.substring(0,1) 
                      const h = key.substring(2,3)
                      const r = Math.sqrt(qtd/Math.PI)*5 
                      // const r = qtd
                      if (a != h) {
                        const color = a > h ? pink500 : blue500
                        return <circle key={i} fill={color} cx={a*unit} cy={h*unit} r={r} opacity={0.8}/>
                      } else {
                        const rr = Math.sin(Math.PI/4)*(r)
                        return <g key={i} >
                          <path fill={pink500} d = {`M${a*unit-rr},${h*unit-rr} L${a*unit+rr},${h*unit+rr} A${r},${r} 0 1,0 ${a*unit-rr},${h*unit-rr} z`} opacity={0.8}/>
                          <path fill={blue500}  d = {`M${a*unit-rr},${h*unit-rr} L${a*unit+rr},${h*unit+rr} A${r},${r} 0 1,1 ${a*unit-rr},${h*unit-rr} z`}opacity={0.8} />
                        </g>

                      }
                    } )}


                    {this.state.render && this.state.games && <NodeGroup
                      data={this.state.games}
                      keyAccessor={(d) => d.gameId}

                      start={(d,i) => ({
                        opacity: 0.8,
                        opacity2: 0.0,
                        x: -0.2,
                        y: -0.2 
                      })}

                      enter={(d,i) => ([{
                        opacity: [0.8],
                        opacity2: [0.5],
                        x: [d.res.a],
                        y: [d.res.h],
                        timing: { delay: i*100,duration: 1000, ease: easeExpInOut },
                        events: {
                          end() { // runs in the context of the node
                            
                            const bag = {...self.state.summary}
                            bag[d.res.a+"-"+d.res.h]=( bag[d.res.a+"-"+d.res.h] ? bag[d.res.a+"-"+d.res.h] : 0)+1
                            self.setState({summary: bag })
                          },
                        },



                      },{
                        opacity: [0],
                        opacity2: [0],
                        timing: {delay:(i*100)+1000}
                      }]

                    )}
                    >
                      {(nodes) => (
                        <g>
                          {nodes.map(({ key, data, state }) => {  
                            const { opacity, opacity2, x, y, ...rest } = state;
                            

                            return (
                                <g key={key}>
                                <circle 
                                  fill={data.res.a > data.res.h ? pink500 : blue500}
                                  opacity={opacity} 
                                  cx={x*unit}
                                  cy={y*unit}
                                  strokeWidth={0.6}
                                  r={1.5}
                                />
                                <text 
                                  transform={`rotate(135 ${x*unit} ${y*unit})`}
                                  style={{fontSize:"4px", fontFamily: "Lato"}}
                                  opacity={opacity2} 
                                  textAnchor="middle"
                                  x={x*unit}
                                  y={y*unit}
                                  dy={-5}
                                  strokeWidth={0.6}
                                  fill={color}
                                >{`${data.res.a} x ${data.res.h}`}</text>
                                
                                </g>
                            );
                          })}
                        </g>
                      )}
                  </NodeGroup>}
                </g>
            </svg>
        </div>
    }
  }

