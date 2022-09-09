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
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';






export default class Rules extends Component {

  constructor(props) {
    super(props)
    
  }

  render() {
    return (


      <div className="homePage" >
        <div style={{ width: "100%", overflow: "hidden"}} >

              <div id="regulamento" className="regulamento" >
                <div style={{fontFamily: "Open Sans",fontSize: "20px", textAlign: "left", marginBottom: "100px"}}>




                <h3 style={{fontFamily: 'Roboto Condensed'}}>Rules</h3>
                <p>Price R$ 30.00. The price is in brazilian Reals, it would be around USD 6.00 </p>
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

                <h3 style={{fontFamily: 'Roboto Condensed'}}>Regulamento</h3>

                <p>Preço R$ 30.00</p>
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
              </div>



              </div>          
        </div>








      </div>


    );
  }
}

