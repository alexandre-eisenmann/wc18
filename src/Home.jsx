import React, { useState } from 'react'
import { NavLink } from "react-router-dom"

import dayjs from 'dayjs'
import './flags.css'
import './scroll.css'
import Viz from './Viz'
import data26 from './data26.json'
import data22 from './data.json'
import data18 from './data2018.json'
import { DATABASE_WC18, DATABASE_WC22, DATABASE_WC26 } from './constants'

const today = dayjs()
const startDate = dayjs('2026-06-11')

const flags = ["f-mx","f-kr","f-za","f-ca","f-br","f-ma","f-us","f-de","f-nl","f-be","f-es","f-fr","f-ar","f-pt","f-gb-eng","f-hr","f-jp","f-sn","f-eg","f-au","f-ch","f-ec","f-co","f-uy","f-ir","f-ht","f-gb-sct","f-py","f-ci","f-se","f-tn","f-nz","f-cv","f-sa","f-iq","f-no","f-dz","f-at","f-cd","f-uz","f-gh","f-pa","f-tr","f-cw","f-ba","f-jo","f-qa"]

const YEARS = {
  '2026': { data: data26, dbNode: DATABASE_WC26 },
  '2022': { data: data22, dbNode: DATABASE_WC22 },
  '2018': { data: data18, dbNode: DATABASE_WC18 },
}


export default function Home() {
  const [selectedYear, setSelectedYear] = useState('2026')

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
            <div style={{ marginTop: "16px", fontSize: "9px", color: "rgba(255,255,255,0.35)", fontFamily: "Roboto Condensed", letterSpacing: "1px" }}>
              previous cups:{" "}
              <a href="/barrace" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>2018</a>
              {" · "}
              <a href="/barrace22" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>2022</a>
            </div>
          </div>
        </div>

        <div style={{ fontWeight: "bold", color: "#2196f3", fontFamily: "Roboto Condensed", margin: "auto", marginTop: "30px" }}>SCROLL</div>
        <a href="#viz">
          <div className="arrow" style={{ margin: "auto", marginTop: "5px" }}></div>
        </a>
      </div>

      <div style={{ marginTop: "100px", width: "100%", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingLeft: "60px", marginBottom: "8px" }}>
          {['2018', '2022', '2026'].map(year => (
            <span
              key={year}
              onClick={() => setSelectedYear(year)}
              style={{
                fontFamily: "Roboto Condensed",
                fontSize: "14px",
                fontWeight: "bold",
                color: selectedYear === year ? "#2196f3" : "#bbb",
                cursor: "pointer",
                borderBottom: selectedYear === year ? "2px solid #2196f3" : "2px solid transparent",
                paddingBottom: "2px",
              }}
            >{year}</span>
          ))}
        </div>
        <Viz key={selectedYear} tournamentData={YEARS[selectedYear].data} dbNode={YEARS[selectedYear].dbNode} />
      </div>
    </div>
  )
}
