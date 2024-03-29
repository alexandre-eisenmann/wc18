import React, { Component } from "react";
import NodeGroup from 'react-move/NodeGroup';
import data from './data.json'
import moment from 'moment'
import { StickyTable, Row, Cell } from 'react-sticky-table';
import CircularProgress from 'material-ui/CircularProgress';
// import 'react-sticky-table/dist/react-sticky-table.css';
import {blue500, grey300,grey400,grey200,lightGreen500, orange200,deepOrange500, orange900,yellow500,green700, orange500, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100} from 'material-ui/styles/colors'
import firebase from 'firebase/compat/app';
import './flags.css';
import SearchBar from 'material-ui-search-bar'
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import { easeExpInOut } from 'd3-ease';
import { connect } from "tls";
import { Animate } from "react-move";
  

  export default class MatchViz extends Component {

    constructor(props) {
      super(props)
      this.teams = data.teams.reduce((acc,ele) => {acc[ele.id] = ele; return acc}, {})
      this.state = {render: false, games: this.props.games, summary: {}}
      this.ref = React.createRef()

    }

    UNSAFE_componentWillReceiveProps(props) {
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
                          {gols < 6 ?
                            <g>
                              {gols>0 && 
                                <text opacity={0.5} fill={color} transform={`rotate(180 ${gols*unit} 100)`} style={{fontSize:"4px", fontFamily: "Lato"}}  x={gols*unit} dx={-4} dy={-2} y={200} >{gols}</text>}
                              
                              <text opacity={0.5} fill={color} transform={`rotate(90 100 ${gols*unit})`} style={{fontSize:"4px", fontFamily: "Lato"}}  x={100} dx={1} dy={-2} y={100+gols*unit} >{gols}</text>
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
                      const r = Math.sqrt(qtd/Math.PI)*3 
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
                    
                    {this.state.render && this.props.result && <Animate
                        start={{
                          opacity: 0,
                          opacity2: 0,
                          opacity3: 0.2,
                          opacity4: 0,
                          _a: 5,
                          _h: 5,
                          r_coeff:0
                        }}

                        enter={[
                          {
                            opacity: [1],
                            opacity4: [1],
                            _a: [this.props.result.a],
                            _h: [this.props.result.h],
                            r_coeff: [1],
                            timing: {delay: this.props.games.length*100 + 1000, duration: 2000, ease: easeExpInOut },                            
                          },
                          {
                            opacity2: [1],
                            opacity3: [0],
                            opacity4: [0],
                            _a: [this.props.result.a],
                            _h: [this.props.result.h],
                            timing: {delay: this.props.games.length*100 + 3000 + 100, duration: 1000, ease: easeExpInOut },                            
                          }
                        ]
                        }

                      >
                        {(state) => {
                          const { _a, _h, r_coeff, opacity, opacity2, opacity3, opacity4 } = state ;
                          const a = _a*unit
                          const h = _h*unit
                          const ar = this.props.result.a
                          const hr = this.props.result.h
                          const key = ar+"-"+hr
                          const qtd = this.state.summary[key]
                          const r = (qtd ? Math.sqrt(qtd/Math.PI)*3 : 3)*r_coeff
                          return <g>
                              {[...Array(10).keys()].map((av) => {
                                return [...Array(10).keys()].map((hv) => {
                                  const keyv = av+"-"+hv
                                  const qtdv = this.state.summary[keyv]
                                  if (qtdv) {
                                    const rv = Math.sqrt(qtdv/Math.PI)*3
                                    if (av != ar ||  hv != hr) {
                                      if ( av-hv == ar-hr) {
                                        return <circle key={`result-2${av}${hv}`} fill={`transparent`} strokeWidth={1} stroke={"rgba(0,0,0,0.8)"} cx={av*unit} cy={hv*unit} r={rv+0.5} opacity={opacity2}/>
                                      } else if (av > hv && ar > hr || av < hv && ar < hr) {
                                        return <circle key={`result-3${av}${hv}`} fill={`transparent`} strokeWidth={0.5} stroke={"rgba(0,0,0,0.8)"} cx={av*unit} cy={hv*unit} r={rv+0.25} opacity={opacity2}/>
                                      }
                                    }
                                  }
                                })
                              })}


                              }
                              <circle key={"result"} fill={`rgba(0,0,0,${opacity3})`} strokeWidth={1.5} stroke={"rgba(0,0,0,1)"} cx={a} cy={h} r={r+0.75} opacity={opacity}/>
                              <g transform={`rotate(45 ${a} ${h})`}>
                                <line x1={a} y1={h-r-4} x2={a} y2={h+r+4} strokeWidth={1.0} stroke="black" opacity={opacity} />
                                <line x1={a-r-4} y1={h} x2={a+r+4} y2={h} strokeWidth={1.0} stroke="black" opacity={opacity} />
                              </g>


                          </g>
                        }}
                      </Animate>}

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

