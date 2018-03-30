import React, { Component } from "react";
import {NavLink} from "react-router-dom";
import Paper from 'material-ui/Paper'
import { orange500,amberA700 } from "material-ui/styles/colors";


const style ={
  backgroundImage: "url(background3.svg)",
}

class Home extends Component {

  constructor(props) {
    super(props)

    this.flags = require.context("./flags/4x3/", false, /.*\.svg$/);

  }


  flagSvg(iso2code) {
    return <div style={{width:"60px",height: "45px", background:`url(${this.flags(`./${iso2code}.svg`)}) no-repeat top left`,backgroundSize: "contain"}}></div>

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
            }}><p> Bolão <span style={{ fontFamily: "Lato"}}>EISENMANN</span> da Copa do Mundo 2018</p></div>

            <div style={{width: "100%", paddingTop:  "0px", paddingBottom: "20px", backgroundImage: "url(background3.svg)", backgroundColor: amberA700}}>
    
            <div style={{paddingTop: "50px", margin: "auto", textAlign: "center", display: "inline-block"}}>
              <div style={{float: "left"}}>{this.flagSvg("br")}</div>
              <div style={{float: "left"}}>{this.flagSvg("ar")}</div>
              <div style={{float: "left"}}>{this.flagSvg("gr")}</div>
              <div style={{float: "left"}}>{this.flagSvg("al")}</div>
              <div style={{float: "left"}}>{this.flagSvg("us")}</div>
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

              </div>

              </div>
              
              </div>
            </Paper>




      </div>


    );
  }
}

export default Home;
