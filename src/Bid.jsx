import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './App.css'
import GroupView from './GroupView'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'
import {
  Button, Fab, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  CircularProgress, TextField, Avatar, IconButton, Icon
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart'
import PaymentIcon from '@mui/icons-material/Payment'
import DoneIcon from '@mui/icons-material/Done'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import EditIcon from '@mui/icons-material/Edit'
import { green, blue, cyan, pink, orange } from '@mui/material/colors'
import data from './data26.json'
import './bubbles.css'
import { DATABASE_ROOT_NODE } from './constants'
import { LanguageContext } from './i18n'

const green700 = green[700]
const blue600 = blue[600]
const cyan500 = cyan[500]
const cyan600 = cyan[600]
const cyan100 = cyan[100]
const cyan200 = cyan[200]
const cyan300 = cyan[300]
const pink500 = pink[500]
const pink100 = pink[100]
const orange200 = orange[200]

const style = {
  backgroundImage: "url(background_gs.svg)",
  backgroundColor: "rgb(200,200,200)",
  backgroundOpacity: "0.5",
  backgroundPositionX: "0%"
}

const provider = new firebase.auth.GoogleAuthProvider()

export default class Bid extends Component {

  static contextType = LanguageContext

  constructor(props) {
    super(props)
    this.state = { logged: null, user: null, bids: [], currentBid: null, deleteBid: null, status: null }
  }

  onNewGame() {
    const newRef = firebase.database().ref(`${DATABASE_ROOT_NODE}/` + this.state.user.uid).push()
    newRef.set({ name: this.state.user.displayName, email: this.state.user.email, mobile: null })
    this.setState({ currentBid: newRef.key })
  }

  onChangeGame(event, bid) {
    this.setState({ currentBid: bid })
    document.getElementById("gameSection").scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  onNameChange(event) {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.currentBid}/name`).set(event.target.value)
  }

  onEmailChange(event) {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.currentBid}/email`).set(event.target.value)
  }

  onMobileChange(event) {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.currentBid}/mobile`).set(event.target.value)
  }

  onRequestDelete(event, bid) {
    this.setState({ deleteBid: bid })
  }

  handleClose() {
    this.setState({ deleteBid: null })
  }

  handleDelete() {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.deleteBid}`).remove()
    if (this.state.deleteBid === this.state.currentBid)
      this.setState({ currentBid: null })
    this.setState({ deleteBid: null })
  }

  calculateStatus(bids) {
    const global_status = {}
    Object.keys(bids).map((bid) => {
      const status = {
        name: bids[bid].name ? true : false,
        email: bids[bid].email ? true : false
      }
      Object.keys(data.groups).map(group => {
        const matches = data.groups[group]["matches"]
        let complete = true
        for (let i = 0; i < matches.length; i++) {
          const result = bids[bid][matches[i].name]
          if (!(result && (result['h'] || result['h'] === 0) && (result['a'] || result['a'] === 0))) {
            complete = false
            break
          }
        }
        status[group] = complete
      })
      global_status[bid] = status
    })
    return global_status
  }

  componentWillUnmount() {
    if (this.ref) this.ref.off('value')
    this.unsubscribe()
  }

  componentDidMount() {
    const self = this
    this.unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        self.setState({ logged: true, user: user })
        self.ref = firebase.database().ref(`${DATABASE_ROOT_NODE}/${user.uid}`)
        self.ref.on('value', snapshot => {
          const bids = {}
          snapshot.forEach(function (childSnapshot) {
            bids[childSnapshot.key] = childSnapshot.val()
          })
          self.setState({ bids: bids, status: self.calculateStatus(bids) })
        })
      } else {
        self.setState({ logged: false, user: null })
      }
    })
  }

  handleAddToCard() {
    if (this.state.currentBid) {
      firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.currentBid}/status`).set("readytopay")
      const y = document.getElementById("flowSection").getBoundingClientRect().y
      window.scrollTo(0, y)
    }
  }

  handleRemoveFromCard() {
    if (this.state.currentBid) {
      firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.currentBid}/status`).remove()
    }
  }

  isComplete(bid) {
    const games = this.state.status[bid]
    const vals = Object.keys(games).map((key) => games[key])
    return bid && vals.filter((L) => !L).length === 0
  }

  render() {
    const { t } = this.context
    let status = t('bid.statusIncomplete')
    let complete = false
    let edit = true

    if (this.state.currentBid && this.state.bids[this.state.currentBid]) {
      if (this.state.bids[this.state.currentBid].status === "readytopay") {
        status = t('bid.statusWaiting')
        edit = false
      } else if (this.state.bids[this.state.currentBid].status === "payed") {
        status = t('bid.statusPaid')
        edit = false
      } else if (this.isComplete(this.state.currentBid)) {
        status = t('bid.statusComplete')
        complete = true
      }
    }

    const avatarIcon = (bid) => {
      if (this.state.bids[bid].status === "readytopay")
        return <Avatar sx={{ color: green700, bgcolor: "transparent", width: 24, height: 24 }}><DoneIcon fontSize="small" /></Avatar>
      else if (this.state.bids[bid].status === "payed")
        return <Avatar sx={{ color: green700, bgcolor: "transparent", width: 24, height: 24 }}><DoneAllIcon fontSize="small" /></Avatar>
      else if (this.isComplete(bid))
        return null
      else
        return <Avatar sx={{ color: "#666", bgcolor: "transparent", width: 24, height: 24 }}><EditIcon fontSize="small" /></Avatar>
    }

    const canEdit = (bid) => !this.state.bids[bid].status

    let anyReadyToPay = false
    let anyPayed = false

    return (
      <div id="flowSection" style={style}>
        {this.state.logged === false && <div style={{ background: orange200, textAlign: "center", fontSize: "14px", padding: "8px" }}>
          <div>
            <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => { firebase.auth().signInWithRedirect(provider) }}>
              {t('auth.login')}
            </span><span>{t('auth.loginToSeeYourBids')}</span>
          </div>
        </div>}

        {this.state.logged === null && <div style={{ backgroundColor: "white", textAlign: "center", marginTop: "10%", width: "100%" }}><CircularProgress size={60} thickness={7} /></div>}

        {this.state.logged && this.state.user && <div>
          <Dialog open={this.state.deleteBid != null}>
            <DialogTitle>{t('bid.deleteTitle', { name: this.state.bids[this.state.deleteBid] ? this.state.bids[this.state.deleteBid]["name"] : "" })}</DialogTitle>
            <DialogContent>
              <DialogContentText>{t('bid.deleteContent')}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={this.handleClose.bind(this)}>{t('auth.cancel')}</Button>
              <Button color="primary" onClick={this.handleDelete.bind(this)}>{t('bid.deleteConfirm')}</Button>
            </DialogActions>
          </Dialog>

          <div>
            <div style={{ backgroundColor: cyan500, padding: "5px", fontSize: "10px", paddingTop: "10px", paddingLeft: "27px", paddingBottom: "0px", color: "rgba(255, 255, 255, 0.7)" }}>
              {t('bid.draftHeader')}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", minHeight: "40px", position: "relative", paddingLeft: "20px", paddingRight: "60px", paddingTop: "5px", paddingBottom: "13px", backgroundColor: cyan500 }}>
              {this.state.bids.length === 0 && <div style={{ textAlign: "center", width: "100%" }}><CircularProgress sx={{ color: pink500 }} size={30} thickness={4} /></div>}
              {Object.keys(this.state.bids).map((bid) => {
                if (!this.state.bids[bid].status) {
                  const onDelete = canEdit(bid) ? (event) => this.onRequestDelete(event, bid) : undefined
                  return (
                    <Chip
                      key={bid}
                      avatar={avatarIcon(bid)}
                      label={`${this.state.bids[bid]['name']}`}
                      onClick={(event) => this.onChangeGame(event, bid)}
                      onDelete={onDelete}
                      style={{ backgroundColor: this.state.currentBid === bid ? cyan200 : cyan100, margin: "4px" }}
                    />
                  )
                } else if (this.state.bids[bid].status === "readytopay") {
                  anyReadyToPay = true
                } else if (this.state.bids[bid].status === "payed") {
                  anyPayed = true
                }
                return null
              })}
              {!anyReadyToPay && !this.state.currentBid && <div className="newgame-bubble">{t('bid.newGameBubble')}</div>}
              <Fab color="secondary" size="small" style={{ position: "absolute", top: "0px", right: "25px" }} onClick={this.onNewGame.bind(this)}>
                <AddIcon />
              </Fab>
            </div>
          </div>

          {anyReadyToPay && <div id="agdoPagto">
            <div style={{ backgroundColor: cyan300, padding: "5px", fontSize: "10px", paddingTop: "10px", paddingLeft: "27px", paddingBottom: "0px", color: "rgba(255, 255, 255, 0.7)" }}>
              {t('bid.waitingPaymentHeader')}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", minHeight: "40px", position: "relative", paddingLeft: "20px", paddingRight: "60px", paddingTop: "5px", paddingBottom: "13px", backgroundColor: cyan300 }}>
              <div className="agdopagto-bubble">
                {t('bid.payBubble')}
              </div>
              {Object.keys(this.state.bids).map((bid) => {
                if (this.state.bids[bid].status === "readytopay") {
                  const onDelete = canEdit(bid) ? (event) => this.onRequestDelete(event, bid) : undefined
                  return (
                    <Chip
                      key={bid}
                      avatar={avatarIcon(bid)}
                      label={`${this.state.bids[bid]['name']}`}
                      onClick={(event) => this.onChangeGame(event, bid)}
                      onDelete={onDelete}
                      style={{ backgroundColor: this.state.currentBid === bid ? cyan200 : cyan100, margin: "4px" }}
                    />
                  )
                }
                return null
              })}
              <Fab
                component={Link}
                to="/payment"
                color="secondary"
                size="small"
                aria-label={t('bid.payAria')}
                style={{ position: "absolute", top: "0px", right: "25px", zIndex: 10 }}
              >
                <PaymentIcon />
              </Fab>
            </div>
          </div>}

          {anyPayed && <div>
            <div style={{ backgroundColor: cyan600, padding: "5px", fontSize: "10px", paddingTop: "10px", paddingLeft: "27px", paddingBottom: "0px", color: "rgba(255, 255, 255, 0.7)" }}>
              {t('bid.paidHeader')}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", minHeight: "40px", position: "relative", paddingLeft: "20px", paddingRight: "60px", paddingTop: "5px", paddingBottom: "13px", backgroundColor: cyan600 }}>
              {Object.keys(this.state.bids).map((bid) => {
                if (this.state.bids[bid].status === "payed") {
                  const onDelete = canEdit(bid) ? (event) => this.onRequestDelete(event, bid) : undefined
                  return (
                    <Chip
                      key={bid}
                      avatar={avatarIcon(bid)}
                      label={`${this.state.bids[bid]['name']}`}
                      onClick={(event) => this.onChangeGame(event, bid)}
                      onDelete={onDelete}
                      style={{ backgroundColor: this.state.currentBid === bid ? cyan200 : cyan100, margin: "4px" }}
                    />
                  )
                }
                return null
              })}
            </div>
          </div>}

          <div style={{ position: "relative" }} id="gameSection">
            {this.state.currentBid && this.state.bids[this.state.currentBid] &&
              <div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", padding: "8px 16px", justifyContent: "space-between" }}>
                  <span style={{ color: "#333", fontStyle: "italic", fontSize: "10px" }}>{status}</span>
                  <div>
                    <Button variant="contained" disabled={!edit} size="small">{t('bid.save')}</Button>
                    <IconButton disabled={!complete} onClick={this.handleAddToCard.bind(this)}>
                      <AddShoppingCartIcon />
                    </IconButton>
                    <IconButton disabled={this.state.bids[this.state.currentBid].status !== 'readytopay'} onClick={this.handleRemoveFromCard.bind(this)}>
                      <RemoveShoppingCartIcon />
                    </IconButton>
                  </div>
                </div>

                <div style={{ marginLeft: "2px", marginTop: "20px" }}>
                  {this.state.bids[this.state.currentBid].status === 'readytopay' && <div className="addtocard-bubble remove">
                    {t('bid.removeBubble')}
                  </div>}
                  {!this.state.bids[this.state.currentBid].status && <div className="addtocard-bubble">
                    {t('bid.addToCartBubble')}
                  </div>}

                  <div style={{ width: "256px", margin: "auto", marginBottom: "20px" }}>
                    <TextField
                      disabled={!edit}
                      error={!this.state.bids[this.state.currentBid]["name"]}
                      helperText={this.state.bids[this.state.currentBid]["name"] ? "" : t('bid.fieldRequired')}
                      style={{ fontSize: "20px", display: "block", marginRight: "10px" }}
                      placeholder={t('bid.namePlaceholder')}
                      value={this.state.bids[this.state.currentBid]["name"] || ''}
                      onChange={this.onNameChange.bind(this)}
                      variant="standard"
                    />
                    <TextField
                      disabled={!edit}
                      error={!this.state.bids[this.state.currentBid]["email"]}
                      helperText={this.state.bids[this.state.currentBid]["email"] ? "" : t('bid.fieldRequired')}
                      style={{ fontSize: "12px", display: "block", marginRight: "10px" }}
                      placeholder={t('bid.emailPlaceholder')}
                      value={this.state.bids[this.state.currentBid]["email"] || ''}
                      onChange={this.onEmailChange.bind(this)}
                      variant="standard"
                    />
                    <TextField
                      disabled={!edit}
                      style={{ fontSize: "12px", display: "block", marginRight: "10px" }}
                      placeholder={t('bid.mobilePlaceholder')}
                      value={this.state.bids[this.state.currentBid]["mobile"] || ''}
                      onChange={this.onMobileChange.bind(this)}
                      variant="standard"
                    />
                  </div>

                  <div style={{ textAlign: "center" }}>
                    {Object.keys(data.groups).map(group => (
                      <GroupView
                        viewMode={!edit}
                        complete={this.state.status ? this.state.status[this.state.currentBid][group] : false}
                        userId={this.state.user.uid}
                        bids={this.state.bids}
                        gameId={this.state.currentBid}
                        key={group}
                        group={group}
                      />
                    ))}
                  </div>
                </div>
              </div>}
          </div>
        </div>}
      </div>
    )
  }
}
