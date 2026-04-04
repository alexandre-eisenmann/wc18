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
              <p>In case of a tie, the tied players share all the prizes they occupy equally, and no prize is left for the next rank. For example: two players tied for 1st means there is no 2nd place — the next player goes straight to 3rd.</p>
              <p>Scoring:</p>
              <ul>
                <li>Exact score: <strong>8 points</strong></li>
                <li>Correct goal difference (but wrong score): <strong>5 points</strong></li>
                <li>Correct result (win/draw/loss) but wrong goal difference: <strong>3 points</strong></li>
                <li>Wrong result: <strong>0 points</strong></li>
              </ul>
              <p style={{ fontSize: "12px" }}>(*) Total amount collected minus transaction costs and web hosting.</p>

              <h3 style={{ fontFamily: 'Roboto Condensed' }}>Regulamento</h3>
              <p>O valor total líquido (*) arrecadado será dividido da seguinte forma:</p>
              <ul>
                <li><strong>1º lugar:</strong> 70%</li>
                <li><strong>2º lugar:</strong> 25%</li>
                <li><strong>3º lugar:</strong> 5%</li>
              </ul>
              <p>Em caso de empate, os jogadores empatados dividem igualmente todos os prêmios que ocupam, e nenhum prêmio sobra para a posição seguinte. Por exemplo: dois jogadores empatados em 1º significa que não há 2º lugar — o próximo jogador vai direto para o 3º.</p>
              <p>Pontuação:</p>
              <ul>
                <li>Placar exato: <strong>8 pontos</strong></li>
                <li>Diferença de gols correta (mas placar errado): <strong>5 pontos</strong></li>
                <li>Resultado correto (vitória/empate/derrota) mas diferença de gols errada: <strong>3 pontos</strong></li>
                <li>Resultado errado: <strong>0 pontos</strong></li>
              </ul>
              <p style={{ fontSize: "12px" }}>(*) Valor total arrecadado menos custos de transação e hosting.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
