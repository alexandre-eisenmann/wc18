import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import Paper from 'material-ui/Paper'

import {pink300,amberA700, blue500, blue300,grey300,grey400,grey200,lightGreen500, orange200,deepOrange500, orange900,yellow500,green700, orange500, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100} from 'material-ui/styles/colors'
import './flags.css';
import './scroll.css';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ActionHome from 'material-ui/svg-icons/action/home';
import FontIcon from 'material-ui/FontIcon';
import moment from 'moment'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Viz from './Viz'
import * as firebase from 'firebase'
import * as d3 from 'd3';
import NodeGroup from 'react-move/NodeGroup';
import { easeExpInOut } from 'd3-ease';



const today = moment(new Date());
const startDate = moment([2018, 5, 15]);
const init = 1929
const x = d3.scaleLinear().domain([init, 2018]).range([10, 590]);
const w = Math.floor((590 - 10)/(2018-init))


const flags = ["f-sa","f-eg","f-uy","f-ma","f-ir","f-br","f-de","f-ar","f-ru","f-gb-eng","f-pt","f-es","f-fr","f-au","f-is","f-pe","f-dk","f-hr","f-ng","f-br","f-cr","f-rs","f-mx","f-ch","f-se","f-kr","f-be","f-pa","f-tn","f-co","f-jp","f-pl","f-sn"]

export default class VizHist extends Component {

  constructor(props) {
    super(props)
    this.state = {results: {}, tab: {}}
  }

  componentWillReceiveProps(props) {
    if (props.data) {
      this.setState({result: props.data.result, tab: props.data.tab})
    }
  }


  render() {
    if (!this.state.tab) return null
    const years = Object.keys(this.state.tab)
    const m = 5
    return (
      <svg viewBox="0 0 600 300"> 
      <g transform="translate(0,150)">
        <g >
        <rect x={x(init)} y={1} width={580} height={7} fill={"rgba(0,0,0,0.8)"} />
        <text dx={10} dy={-3} style={{fontFamily: "Lato", fontSize: "15px"}} >{this.props.country.toUpperCase()}</text>
        {[...Array(2018-init).keys()].map((key) => {
          const year = init + key
            return <g key={key}>
              {(year+2) % 4 == 0 && <text fill={"rgba(255,255,255,0.8)"} x={x(year)+w/2} y={6} style={{textAnchor: "middle", fontFamily: "Lato", fontSize: "4px"}}>{year}</text>}
            </g>
        })}
        
        <NodeGroup
            data={years}
            keyAccessor={(d) => d}

            start={(d,i) => ({
              height: 0,
            })}

            enter={(d,i) => ([{
              height: [1],
              timing: { delay: i*10,duration: 300, ease: easeExpInOut }

            }]

          )}
          >
            {(nodes) => (
              <g>
                {nodes.map(({key, data, state }) => {  
                  const { height, ...rest } = state;
                  const ve = (this.state.tab[key].v + this.state.tab[key].t)*m
                  const e = this.state.tab[key].t*m
                  const d = this.state.tab[key].l*m
                  const year = parseInt(key)
                  return <g  key={key}>
                          
                          {/* {(year+2) % 4 == 0 && <text fill={"rgba(255,255,255,0.8)"} x={x(year)+w/2} y={6} style={{textAnchor: "middle", fontFamily: "Lato", fontSize: "4px"}}>{key}</text>} */}
                          <rect x={x(year)} y={-ve*height} width={w} height={ve*height} fill={blue500} />
                          <rect x={x(year)} y={-e*height} width={w} height={e*height} fill={blue300} />
                          <rect x={x(year)} y={9} width={w} height={d*height} fill={pink300}/>
                        </g>
                })}
              </g>
            )}
        </NodeGroup>
        </g>
      </g>
    </svg>


    );
  }
}

