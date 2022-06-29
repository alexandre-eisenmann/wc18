import React, { Component } from "react";

export default class NumberRing extends Component {
  
    constructor(props) {
        super(props)
        this.state = {pressed: false, value: this.props.value, over: null}
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
    }

    UNSAFE_componentWillReceiveProps(props) {
        this.setState({value: props.value})
    }

    onMouseDown(event) {
        this.setState({pressed: true})
    }

    onMouseUp(event) {
        this.setState({pressed: false})
    }

    // onMouseOut(event) {
    //     this.setState({pressed: false})
    // }

    onMouseOver(n) {
        this.setState({over: n})
    }

    onNumber(n) {
        this.props.onChange(this.props.match, this.props.team, n)
        this.setState({value: n, pressed: false, over: null})
    }   

    render() {
    return (
      <svg viewBox="0 0 100 100"> 
        <g style={{userSelect: "none", cursor: "pointer", zIndex: "9999"}}transform={`translate(50,50)`} onTouchEnd={this.onMouseUp} onMouseUp={this.onMouseUp} >
        <circle stroke="black"  strokeWidth={2} fill={"#fff"} r={this.state.pressed ? 30 : 20} onTouchStart={this.onMouseDown} onMouseDown={this.onMouseDown}/>
        {this.state.pressed && <circle stroke="black" strokeWidth={2}  fill={"rgba(255,255,255,0.8)"} r={48}/>}
        <text dy={2} style={{userSelect: "none", fontSize: "34px"}} pointerEvents={"none"} textAnchor="middle" alignmentBaseline="middle">{this.state.value}</text>

        {/* <g style={{cursor: "pointer", zIndex: "9999"}}> */}
        {this.state.pressed && [0,1,2,3,4,5,6,7,8,9].map(n => {
            const radians = (2*Math.PI)* n / 10 
            const x = Math.cos(radians)*39
            const y = Math.sin(radians)*39
            const isOver = this.state.over == n
            return <text stroke={isOver ? "red" : "black"} style={{userSelect: "none"  }} dy={1} onTouchMove={this.onMouseOver} onMouseOver={this.onMouseOver} onTouchEnd={this.onNumber.bind(this,n)} onMouseUp={this.onNumber.bind(this,n)} key={n} x={x} y={y} textAnchor="middle" alignmentBaseline="middle">{n}</text>
        })}
        {/* </g> */}

        </g>
      </svg>


    );
  }
}