import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import Paper from 'material-ui/Paper'

import {amberA700, blue500, grey300,grey400,grey200,lightGreen500, orange200,deepOrange500, orange900,yellow500,green700, orange500, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100} from 'material-ui/styles/colors'
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




const today = moment(new Date());
const startDate = moment([2018, 5, 15]);


const style ={
  backgroundImage: "url(background.svg)",
}

const flags = ["f-sa","f-eg","f-uy","f-ma","f-ir","f-br","f-de","f-ar","f-ru","f-gb-eng","f-pt","f-es","f-fr","f-au","f-is","f-pe","f-dk","f-hr","f-ng","f-br","f-cr","f-rs","f-mx","f-ch","f-se","f-kr","f-be","f-pa","f-tn","f-co","f-jp","f-pl","f-sn"]

class Home extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (


      <div className="homePage" >
        <div style={{width: "100%", height: "200px", overflow: "hidden",backgroundPositionY: "-700px", backgroundImage: "url(background.svg)"}} >
        </div>
        <div style={{position: "absolute",
                     display: "inline-block", 
                     zIndex: "1",
                     left: "30px",
                     fontFamily: "Lato",
                     fontWeight: "bold",
                     top: "10px"
                     }}>
              <NavLink style={{textDecoration: "none",color: "rgba(220,220,220,0.8)"}} to="/bids">MEUS JOGOS</NavLink>
              <NavLink style={{textDecoration: "none",marginLeft: "20px", color: "rgba(220,220,220,0.8)"}} to="/leaderboard">TABELAO</NavLink>
              <a style={{textDecoration: "none",marginLeft: "20px", color: "rgba(220,220,220,0.8)"}} href="https://medium.com/bolão-dos-bolões-2018">BLOG</a>

          </div>


        <div style={{width: "100%", height: "260px"}} >
          <div className="stripe">
          <div style={{paddingTop: "130px"}}>
              <div className="scroll-left">
                <div>FALTAM <span style={{
                  paddingLeft: "6px", 
                  paddingRight: "6px",
                  marginLeft: "2px", 
                  marginRight: "4px",
                  // borderRadius: "40px",
                  backgroundColor: "rgba(255,255,255,0.3)",

                 fontSize: "40px", fontWeight: "bold", color: "red", fontFamily: "Lato"}}>{startDate.diff(today, 'days')}</span> DIAS PARA A COPA</div>
              </div>
            </div>

          <div style={{marginTop: "66px", 
                      overflow:"hidden",
                      whiteSpace: "nowrap",
                      marginLeft: "calc(-80vw)",
                      display: "inline-block"}}>
              {flags.map((clazz,i) => {
                return <div key={i} className={` ${clazz} flags-strip`} ></div>
              })}


            </div>
          </div>

          <div style={{position: "absolute", top: "30px", color: "white", textAlign: "left", marginLeft: "30px"}}>
            <p style={{fontSize: "40px", fontFamily: 'Roboto Condensed'}}>Bolão dos Bolões</p>
            <div style={{fontSize: "16px", marginTop: "-30px", width: "300px", fontFamily: 'Open Sans'}}>
            Façam seus palpites para a copa da Russia 2018! O ganhador é aquele com maior
            número de pontos entre todas as partidas da primera fase. 
            
              <FlatButton
                  label="Regulamento" 
                  style={{color: "white", 
                          marginTop: "16px",
                          height: "unset",
                          borderRadius: "48px",
                          border: `6px solid white`,
                          backgroundColor: "transparent",
                          fontFamily: "Roboto Condensed"
                        }}
                  href="/rules"
                />

              <FlatButton
                  label="Jogar" 
                  style={{color: "white", 
                          marginLeft: "20px",
                          marginTop: "16px",
                          height: "unset",
                          borderRadius: "48px",
                          border: "6px solid white",
                          fontFamily: "Roboto Condensed",
                          backgroundColor: "transparent"}}
                  href="/bids"
                />



            </div>

            
          </div>

            <div style={{fontWeight: "bold", color: "#2196f3", fontFamily: "Roboto Condensed", margin: "auto", marginTop: "30px"}}>SCROLL</div>
            <a href="#viz">
              <div className="arrow" style={{margin: "auto", marginTop: "5px"}}> </div>
            </a>
        </div>

        <div id="viz" style={{marginTop:"100px", width: "100%", overflow: "hidden"}} >
          <Viz />
        </div>








      </div>


    );
  }
}

export default Home;
