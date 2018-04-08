import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import Paper from 'material-ui/Paper'
import { orange500,amberA700 } from "material-ui/styles/colors";
import './flags.css';



const style ={
  backgroundImage: "url(background3.svg)",
}

class Home extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (


      <div className="homePage" style={style}>


      <Paper className="hero" zDepth={2} >
            <div style={{
              margin: "auto", 
              color: "black",
              fontSize: "30px",
              fontFamily: "Roboto",
              textAlign: "center",
              marginLeft: "50px",
              marginRight: "50px",
            }}><p> Bolão da Copa do Mundo 2018</p></div>

            <div style={{width: "100%", paddingTop:  "0px", paddingBottom: "20px", backgroundImage: "url(background3.svg)", backgroundColor: amberA700}}>
    
            <div style={{paddingTop: "50px", margin: "auto", textAlign: "center", display: "inline-block"}}>
              <div className="f-br" style={{float: "left",width:"60px",height: "45px"}}></div>
              <div className="f-de" style={{float: "left",width:"60px",height: "45px"}}></div>
              <div className="f-ar" style={{float: "left",width:"60px",height: "45px"}}></div>
              <div className="f-ru" style={{float: "left",width:"60px",height: "45px"}}></div>
              <div className="f-gb-eng" style={{float: "left",width:"60px",height: "45px"}}></div>
            </div>

              <div className="regulamento" >
                <div style={{fontFamily: "Roboto",fontSize: "20px", textAlign: "left", marginBottom: "100px"}}>

                <h3>Regulamento</h3>
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


                <h3>Rules</h3>
                <p>The total net value (*) collected will be divided as follows:</p>
                <ul>
                <li>1st prize: 70% for the player  with the highest score. In case of a tie/draw between the two highest-ranked players/gamblers/competitors, they will each receive 47.5% of the total prize and the next ranked player/gambler will be considered the third prize winner. In case of a tie/draw between three or more players, the total prize (100%) will be divided equally between them.</li>
                <li>2nd prize: 25% for the second-best player:  In case of a tie/draw, the remaining 30% is equally divided between the tied-players.</li>
                <li>3rd prize: 5% for the third-best player: In case of a tie, the remaining 5% is equally divided between the tied-players.</li>
                </ul>

                <p>Scoring criteria:</p>
                <ul>
                <li>Guessing the exact match score: 8 points</li>
                <li>Guessing  a draw/tie, but missing the exact match score: 5 points</li>
                <li>Guessing the match winner and the goal difference between winner and loser but missing the exact score: 5 points</li>
                <li>Guessing the match winner but missing the goal difference between winner and loser</li>
                </ul>
                <p style={{fontSize: "12px"}}>(*) Total amount collected minus transaction costs (Paypal) and web hosting</p>

              </div>



              </div>
              
              </div>
            </Paper>




      </div>


    );
  }
}

export default Home;
