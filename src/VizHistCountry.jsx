import React, { Component } from "react"
import { amber } from '@mui/material/colors'
import * as d3 from 'd3'
import { NodeGroup } from 'react-move'
import { easeExpInOut } from 'd3'

const amber500 = amber[500]
const amber300 = amber[300]

const init = 1929
const x = d3.scaleLinear().domain([init, 2018]).range([10, 590])
const w = Math.floor((590 - 10) / (2018 - init))

export default class VizHistCountry extends Component {

  constructor(props) {
    super(props)
    this.state = { results: {}, tab: {} }
  }

  UNSAFE_componentWillReceiveProps(props) {
    if (props.data) {
      this.setState({ result: props.data.result, tab: props.data.tab })
    }
  }

  render() {
    if (!this.state.tab) return null
    const years = Object.keys(this.state.tab)
    const m = 4
    return (
      <svg viewBox="0 0 600 200" style={{ border: "1px solid black", backgroundColor: "black" }}>
        <g transform="translate(0,100)">
          <g>
            <rect x={x(init)} y={1} width={580} height={7} fill={"rgba(80,80,80,0.8)"} />
            {[...Array(2018 - init).keys()].map((key) => {
              const year = init + key
              return (
                <g key={key}>
                  {(year + 2) % 4 === 0 && <text fill={"rgba(255,255,255,0.8)"} x={x(year) + w / 2} y={6} style={{ textAnchor: "middle", fontFamily: "Lato", fontSize: "4px" }}>{year}</text>}
                </g>
              )
            })}

            <NodeGroup
              data={years}
              keyAccessor={(d) => d}
              start={() => ({ height: 0 })}
              enter={(d, i) => ([{
                height: [1],
                timing: { delay: i * 10, duration: 300, ease: easeExpInOut }
              }])}
            >
              {(nodes) => (
                <g>
                  {nodes.map(({ key, data, state }) => {
                    const { height } = state
                    const ve = (this.state.tab[key].v + this.state.tab[key].t) * m
                    const e = this.state.tab[key].t * m
                    const d = this.state.tab[key].l * m
                    const year = parseInt(key)
                    return (
                      <g key={key}>
                        <rect x={x(year)} y={-ve * height} width={w} height={ve * height} fill={amber500} />
                        <rect x={x(year)} y={-e * height} width={w} height={e * height} fill={amber300} />
                        <rect x={x(year)} y={9} width={w} height={d * height} fill={"rgb(100,100,100)"} />
                      </g>
                    )
                  })}
                </g>
              )}
            </NodeGroup>
          </g>
        </g>
      </svg>
    )
  }
}
