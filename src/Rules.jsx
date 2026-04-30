import React, { Component } from "react"
import { NavLink } from "react-router-dom"
import './flags.css'
import './scroll.css'

export default class Rules extends Component {
  render() {
    return (
      <div className="homePage">
        <div style={{ width: "100%", overflow: "hidden" }}>
          <div id="regulamento" className="regulamento">
            <div style={{ fontFamily: "Open Sans", fontSize: "20px", textAlign: "left", marginBottom: "100px" }}>
              <h3 style={{ fontFamily: 'Roboto Condensed' }}>Rules</h3>
              <p>The total net value (*) collected will be divided as follows:</p>
              <ul>
                <li><strong>1st place:</strong> 70%</li>
                <li><strong>2nd place:</strong> 25%</li>
                <li><strong>3rd place:</strong> 5%</li>
              </ul>
              <p>In case of a tie, the tied players share equally the combined value of all prizes they occupy — no prize passes to the next rank. For example: two players tied for 1st split the 1st + 2nd prizes together (70% + 25% = 95%, so 47.5% each), and the next player is 3rd.</p>
              <p>Scoring:</p>
              <ul>
                <li>Exact score: <strong>8 points</strong></li>
                <li>Correct goal difference (but wrong score): <strong>5 points</strong></li>
                <li>Correct result (win/draw/loss) but wrong goal difference: <strong>3 points</strong></li>
                <li>Wrong result: <strong>0 points</strong></li>
              </ul>
              <p style={{ fontSize: "12px" }}>(*) Total amount collected minus transaction costs and web hosting.</p>
              <p><strong>Prize payout:</strong> credit card payments take around 30 days to clear through our payment processor, so prizes will only be paid out once those funds have settled after the end of the World Cup.</p>

              <h3 style={{ fontFamily: 'Roboto Condensed' }}>Regulamento</h3>
              <p>O valor total líquido (*) arrecadado será dividido da seguinte forma:</p>
              <ul>
                <li><strong>1º lugar:</strong> 70%</li>
                <li><strong>2º lugar:</strong> 25%</li>
                <li><strong>3º lugar:</strong> 5%</li>
              </ul>
              <p>Em caso de empate, os jogadores empatados dividem igualmente o valor combinado de todos os prêmios que ocupam — nenhum prêmio passa para a próxima posição. Por exemplo: dois jogadores empatados em 1º dividem os prêmios de 1º + 2º juntos (70% + 25% = 95%, ou seja, 47,5% cada), e o próximo jogador é o 3º.</p>
              <p>Pontuação:</p>
              <ul>
                <li>Placar exato: <strong>8 pontos</strong></li>
                <li>Diferença de gols correta (mas placar errado): <strong>5 pontos</strong></li>
                <li>Resultado correto (vitória/empate/derrota) mas diferença de gols errada: <strong>3 pontos</strong></li>
                <li>Resultado errado: <strong>0 pontos</strong></li>
              </ul>
              <p style={{ fontSize: "12px" }}>(*) Valor total arrecadado menos custos de transação e hosting.</p>
              <p><strong>Pagamento dos prêmios:</strong> os pagamentos via cartão de crédito levam cerca de 30 dias para serem compensados pelo nosso sistema de pagamentos, por isso os prêmios só serão pagos depois que esses valores forem liberados, após o término da Copa.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
