import React, { Component } from "react"
import { NavLink } from "react-router-dom"
import { Button } from '@mui/material'
import dayjs from 'dayjs'
import './flags.css'
import './scroll.css'
import Viz from './Viz'

const today = dayjs()
const startDate = dayjs('2026-06-11')

const flags = ["f-sa","f-eg","f-uy","f-ma","f-ir","f-br","f-de","f-ar","f-ru","f-gb-eng","f-pt","f-es","f-fr","f-au","f-is","f-pe","f-dk","f-hr","f-ng","f-br","f-cr","f-rs","f-mx","f-ch","f-se","f-kr","f-be","f-pa","f-tn","f-co","f-jp","f-pl","f-sn"]

class Home extends Component {
  render() {
    return (
      <div className="homePage">
        <div style={{ width: "100%", height: "200px", overflow: "hidden", backgroundPositionY: "-700px", backgroundImage: "url(background.svg)" }}>
        </div>
        <div style={{
          position: "absolute",
          display: "inline-block",
          zIndex: "1",
          left: "30px",
          fontFamily: "Lato",
          fontWeight: "bold",
          top: "10px"
        }}>
          <NavLink style={{ textDecoration: "none", color: "rgba(220,220,220,0.8)" }} to="/bids">JOGOS</NavLink>
          <NavLink style={{ textDecoration: "none", marginLeft: "20px", color: "rgba(220,220,220,0.8)" }} to="/leaderboard">TABELÃO</NavLink>
          <NavLink style={{ textDecoration: "none", marginLeft: "20px", color: "rgba(220,220,220,0.8)" }} to="/ranking">RANKING</NavLink>
          <a style={{ textDecoration: "none", marginLeft: "20px", color: "rgba(220,220,220,0.8)" }} href="https://medium.com/bolão-dos-bolões-2018">BLOG</a>
        </div>

        <div style={{ width: "100%", height: "260px" }}>
          <div className="stripe">
            <div style={{ paddingTop: "130px" }}>
              <div className="scroll-left">
                <div>FALTAM <span style={{
                  paddingLeft: "6px",
                  paddingRight: "6px",
                  marginLeft: "2px",
                  marginRight: "4px",
                  backgroundColor: "rgba(255,255,255,0.3)",
                  fontSize: "40px", fontWeight: "bold", color: "red", fontFamily: "Lato"
                }}>{startDate.diff(today, 'day')}</span> DIAS PARA A COPA</div>
              </div>
            </div>

            <div style={{
              marginTop: "66px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              marginLeft: "calc(-80vw)",
              display: "inline-block"
            }}>
              {flags.map((clazz, i) => (
                <div key={i} className={` ${clazz} flags-strip`}></div>
              ))}
            </div>
          </div>

          <div style={{ position: "absolute", top: "30px", color: "white", textAlign: "left", marginLeft: "30px" }}>
            <p style={{ fontSize: "40px", fontFamily: 'Roboto Condensed' }}>Bolão dos Bolões</p>
            <div style={{ fontSize: "16px", marginTop: "-30px", width: "300px", fontFamily: 'Open Sans' }}>
              Façam seus palpites para a primeria fase da copa USA/Canada/México 2026!
              Aprenda como os pontos são calculados no nosso <a style={{ color: "white" }} href="/rules">regulamento</a>.
              <br />
              <Button
                href="/ranking"
                style={{
                  color: "white",
                  marginTop: "16px",
                  height: "unset",
                  borderRadius: "48px",
                  boxShadow: "0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08)",
                  border: "2px solid white",
                  backgroundColor: "transparent",
                  fontSize: "10px",
                  fontFamily: "Roboto Condensed",
                  minWidth: "unset",
                  padding: "4px 12px"
                }}
              >2022</Button>
              <Button
                href="/barrace"
                style={{
                  color: "white",
                  marginTop: "16px",
                  marginLeft: "10px",
                  height: "unset",
                  borderRadius: "48px",
                  boxShadow: "0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08)",
                  border: "2px solid white",
                  backgroundColor: "transparent",
                  fontFamily: "Roboto Condensed",
                  minWidth: "unset",
                  padding: "4px 12px"
                }}
              >2018</Button>
            </div>
          </div>

          <div style={{ fontWeight: "bold", color: "#2196f3", fontFamily: "Roboto Condensed", margin: "auto", marginTop: "30px" }}>SCROLL</div>
          <a href="#viz">
            <div className="arrow" style={{ margin: "auto", marginTop: "5px" }}></div>
          </a>
        </div>

        <div style={{ marginTop: "100px", width: "100%", overflow: "hidden" }}>
          <Viz />
        </div>
      </div>
    )
  }
}

export default Home
