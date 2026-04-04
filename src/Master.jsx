import React, { Component } from 'react'
import './App.css'
import GroupView from './GroupView'
import firebase from 'firebase/compat/app'
import { Navigate } from "react-router-dom"
import { CircularProgress } from '@mui/material'
import data from './data.json'
import { DATABASE_ROOT_NODE } from './constants'

const style = {
  backgroundImage: "url(background_gs.svg)",
  backgroundColor: "rgb(200,200,200)",
  backgroundOpacity: "0.5",
  backgroundPositionX: "0%"
}

export default class Master extends Component {

  constructor(props) {
    super(props)
    this.state = { logged: null, user: null, bids: [], edit: false }
  }

  componentWillUnmount() {
    if (this.ref) this.ref.off('value')
    if (this.unsubscribe) this.unsubscribe()
  }

  componentDidMount() {
    const self = this
    this.unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        const canEdit = ['alexandre.eisenmann@gmail.com', 'ricardoke@gmail.com', 'joao@idst.com.br', 'felipe.lara19@gmail.com'].includes(user.email)
        self.setState({ logged: true, user: user, edit: canEdit })
        self.ref = firebase.database().ref(`${DATABASE_ROOT_NODE}/master`)
        self.ref.on('value', snapshot => {
          const bids = {}
          snapshot.forEach(function (childSnapshot) {
            bids[childSnapshot.key] = childSnapshot.val()
          })
          self.setState({ bids: bids })
        })
      } else {
        self.setState({ logged: false, user: null })
      }
    })
  }

  render() {
    return (
      <div style={style}>
        {this.state.logged === false && <Navigate to='/login?fw=master' replace />}
        {this.state.logged === null && <div style={{ backgroundColor: "white", textAlign: "center", marginTop: "10%", width: "100%" }}><CircularProgress size={60} thickness={7} /></div>}
        {this.state.logged && this.state.user && <div>
          <div id="gameSection">
            <div>
              <div style={{ paddingLeft: "2px", paddingTop: "20px" }}>
                <div style={{ textAlign: "center" }}>
                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(group => (
                    <GroupView viewMode={!this.state.edit} complete={true} userId={"master"} bids={this.state.bids} gameId={"gabarito"} key={group} group={group} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>}
      </div>
    )
  }
}
