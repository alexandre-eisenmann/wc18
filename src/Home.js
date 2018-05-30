import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import Paper from 'material-ui/Paper'
import { orange500,amberA700 } from "material-ui/styles/colors";
import './flags.css';
import './scroll.css';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ActionHome from 'material-ui/svg-icons/action/home';
import FontIcon from 'material-ui/FontIcon';
import moment from 'moment'



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
              <div class="scroll-left">
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
            <p style={{fontSize: "16px", marginTop: "-30px", width: "300px", fontFamily: 'Open Sans'}}>
            Façam seus palpites para a copa da Russia 2018! Você terá oportunidade de fazer pontos mesmo que 
            não acerte o resultado em cheio. O ganhador será aquele com maior número de pontos entre todas 
            as partidas da primeria fase. <a  style={{color: "white"}} href="#regulamento">Veja o regulamento abaixo</a>.

            </p>

            
          </div>
            <div style={{marginTop: "30px"}}>
            <FloatingActionButton secondary={true} style={{}}
            href = "/bids"
            >
            <FontIcon className="material-icons">arrow_forward_ios</FontIcon>
            </FloatingActionButton>
            </div>
          
        </div>

        <div style={{marginTop:"100px", width: "100%", overflow: "hidden"}} >



              
              <div id="regulamento" className="regulamento" >
                <div style={{fontFamily: "Open Sans",fontSize: "20px", textAlign: "left", marginBottom: "100px"}}>


                <h3 style={{fontFamily: 'Roboto Condensed'}}>Regulamento</h3>

                <p>Preço R$ 20</p>
                <p>O valor total líquido(*) arrecadado será dividido da seguinte forma:</p>
                <ul>
                <li>70% para aquele que somar mais pontos: Se houver empate entre dois competidores, eles dividirão o prêmio de 95% e o próximo premiado será o terceiro colocado. Se houver empate entre mais de dois competidores o prêmio total (100%) será dividido entre eles.</li>
                <li>25% para o segundo colocado: Se houver empate, divide-se todo o restante do prêmio (30%).</li> 
                <li>5% para o terceiro colocado: Se houver empate, divide-se todo o restante do prêmio (5%). </li>
                </ul>

                <p>O critério para contagem de pontos é o seguinte: Para Quem:</p>
                <ul>
                <li>Acertar totalmente o placar do jogo: 8 pontos.</li>
                <li>Acertar o empate, mas errar o placar: 5 pontos.</li>
                <li>Acertar o vencedor, acertar a diferença de gols entre o vencedor e o perdedor, mas errar o placar: 5 pontos.</li>
                <li>Acertar o vencedor, mas errar a diferença de gols entre o vencedor e o perdedor: 3 pontos.</li>
                </ul>
                <p style={{fontSize: "12px"}}>(*) Valor total arrecadado menos custos de transação (Paypal) e hosting.</p>


                <h3 style={{fontFamily: 'Roboto Condensed'}}>Rules</h3>
                <p>Price R$ 20</p>
                <p>The total net value (*) collected will be divided as follows:</p>
                <ul>
                <li>1st prize: 70% for the player with the highest score. In case of a tie between the two highest-ranked players, they will each receive 47.5% of the total prize and the next ranked player will be considered the third prize winner. In case of a tie between three or more players, the total prize (100%) will be divided equally between them.</li>
                <li>2nd prize: 25% for the second-best player:  In case of a tie, the remaining 30% is equally divided between the tied-players.</li>
                <li>3rd prize: 5% for the third-best player: In case of a tie, the remaining 5% is equally divided between the tied-players.</li>
                </ul>

                <p>Scoring criteria:</p>
                <ul>
                <li>Guessing the exact match score: 8 points</li>
                <li>Guessing a tie, but missing the exact match score: 5 points</li>
                <li>Guessing the match winner and the goal difference between winner and loser but missing the exact score: 5 points</li>
                <li>Guessing the match winner but missing the goal difference between winner and loser: 3 points</li>
                </ul>
                <p style={{fontSize: "12px"}}>(*) Total amount collected minus transaction costs (Paypal) and web hosting</p>

              </div>



              </div>          
        </div>








      </div>


    );
  }
}

export default Home;
