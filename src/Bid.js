import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import GroupView from './GroupView.js'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'
import 'firebase/compat/database'
import {Link, Redirect} from "react-router-dom"
import FlatButton from 'material-ui/FlatButton'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {Tabs, Tab} from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import Chip from 'material-ui/Chip';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import data from './data.json'
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import {green700, blue600, cyan500,cyan600,cyan100, cyan200, cyan300, pink500,pink100,orange200} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import './bubbles.css'
import { DATABASE_ROOT_NODE } from './constants';

const chipStyles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const style ={
  backgroundImage: "url(background_gs.svg)",
  backgroundColor: "rgb(200,200,200)",
  backgroundOpacity: "0.5",
  backgroundPositionX: "0%"

}

const provider = new firebase.auth.GoogleAuthProvider();

export default class Bid extends Component {

  constructor(props) {
    super(props)
    this.state = {logged: null, user: null, bids:[], currentBid: null, deleteBid: null, status: null}
  }

  onNewGame() {
    const newRef = firebase.database().ref(`${DATABASE_ROOT_NODE}/` + this.state.user.uid).push()
    newRef.set({name: this.state.user.displayName, email: this.state.user.email, mobile: null})
    this.setState({currentBid: newRef.key})
    
  }

  onChangeGame(event,bid) {
    this.setState({currentBid: bid})
    document.getElementById("gameSection").scrollIntoView({block: 'start',  behavior: 'smooth'})
  }

  onNameChange(event, value) {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.currentBid}/name`).set(value)
  }

  onEmailChange(event, value) {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.currentBid}/email`).set(value)
  }

  onMobileChange(event, value) {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.currentBid}/mobile`).set(value)
  }
  
  onRequestDelete(event, bid) {
    this.setState({deleteBid: bid})
  }

  handleClose() {
    this.setState({deleteBid: null})
  }

  handleDelete() {
    firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.deleteBid}`).remove()
    if (this.state.deleteBid == this.state.currentBid)
      this.setState({currentBid: null})
    this.setState({deleteBid: null})
  }

  calculateStatus(bids) {
    const global_status = {}
    Object.keys(bids).map((bid) => {
      const status={
        name: bids[bid].name ? true : false,
        email: bids[bid].email ? true : false
      }
      
      Object.keys(data.groups).map(group => {
          const matches = data.groups[group]["matches"]
            let complete = true
            for(let i=0; i< matches.length ; i++) {
                const result = bids[bid][matches[i].name]
                if (!(result && (result['h'] || result['h'] == 0) && (result['a'] || result['a'] == 0))) {
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

    if (this.ref) {
      this.ref.off('value')
    }
    this.unsubscribe()
  }

  componentDidMount() {

    const self = this
    this.unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        self.setState({logged: true, user: user})
        self.ref = firebase.database().ref(`${DATABASE_ROOT_NODE}/${user.uid}`)
        self.ref.on('value', snapshot => {
          const bids  = {}
          snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key
            var childData = childSnapshot.val()

            bids[childKey] = childData
            
            
          });
          
          self.setState({bids:bids, status: self.calculateStatus(bids)})
        })
    
      } else {
        self.setState({logged: false, user: null})
      }
    });

  }

  handleAddToCard() {

    if (this.state.currentBid) {

      firebase.database().ref(`${DATABASE_ROOT_NODE}/${this.state.user.uid}/${this.state.currentBid}/status`).set("readytopay")
      const y = document.getElementById("flowSection").getBoundingClientRect().y
      window.scrollTo(0,y)
  
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
    return bid && vals.filter((L) => !L).length == 0 
  }

  
  render() {

    let status = "Incompleto"
    let complete = false
    let edit = true

    if (this.state.currentBid && this.state.bids[this.state.currentBid]) {
      if (this.state.bids[this.state.currentBid].status == "readytopay") {
          status = "Aguardando Pagamento"
          edit = false
      } else if  (this.state.bids[this.state.currentBid].status == "payed") {
         status = "Pago"
         edit = false
      } else if (this.isComplete(this.state.currentBid)) {
        status = "Completo" 
        complete = true
      }

    }

    const avatar = (bid) => {
      if (this.state.bids[bid].status == "readytopay")
        return <Avatar color={green700} fontSize={"10px"} backgroundColor={"transparent"} icon={<FontIcon className="material-icons">done</FontIcon>} />
      else if  (this.state.bids[bid].status == "payed")
        return <Avatar color={green700} fontSize={"10px"} backgroundColor={"transparent"} icon={<FontIcon className="material-icons">done_all</FontIcon>} />
      else if (this.isComplete(bid)) 
        return null
      else 
        return <Avatar color={"#666"} backgroundColor={"transparent"} icon={<FontIcon className="material-icons">mode_edit</FontIcon>} />
    }

    const canEdit = (bid) => !this.state.bids[bid].status

    let anyReadyToPay = false
    let anyPayed = false

    return (
      
      
      <div id="flowSection" style={style}>
      {/* {this.state.logged == false && <Redirect to='/login?fw=bids' />}  */}
      {this.state.logged == false && <div style={{background: orange200, textAlign: "center", fontSize: "14px", padding: "8px"}}>
          <div>
            <span style={{textDecoration: "underline", cursor: "pointer"}}onClick={() => {firebase.auth().signInWithRedirect(provider); return false;}}>
              Login
              </span><span> para ver seus jogos</span>
          </div>
          </div>
        }

      {this.state.logged == null &&  <div style={{backgroundColor: "white", textAlign: "center", marginTop: "10%", width:"100%"}}><CircularProgress size={60} thickness={7} /></div>}
      {this.state.logged && this.state.user && <div>
        <Dialog
          title={`Apagar ${this.state.bids[this.state.deleteBid] ? this.state.bids[this.state.deleteBid]["name"] : ""}?`}
          actions={[
            <FlatButton
              label="Cancelar"
              primary={true}
              onClick={this.handleClose.bind(this)}
            />,
            <FlatButton
              label="Apague"
              primary={true}
              onClick={this.handleDelete.bind(this)}
            />,
          ]}
          modal={true}
          open={this.state.deleteBid != null}
        >
          Confira se é este o jogo que você deseja apagar
        </Dialog>
        <div>
        <div style={{backgroundColor: cyan500,padding: "5px", fontSize: "10px",  paddingTop: "10px", paddingLeft: "27px", paddingBottom: "0px", color: "rgba(255, 255, 255, 0.7)"}}>
        RASCUNHO (draft)
        </div>          
        <div style={{display: "flex", flexWrap: "wrap", minHeight: "40px", position: "relative", paddingLeft: "20px", paddingRight: "60px", paddingTop: "5px",paddingBottom: "13px", backgroundColor: cyan500}}>
            
            {this.state.bids.length == 0 &&  <div style={{ textAlign: "center", width:"100%"}}><CircularProgress color={pink500} size={30} thickness={4} /></div>}
            {Object.keys(this.state.bids).map((bid) => {
               if (!this.state.bids[bid].status ) {
                const params = {onClick: (event) => this.onChangeGame(event,bid)}
                if (canEdit(bid)) params['onRequestDelete'] = (event) => this.onRequestDelete(event,bid)
                
               return <Chip href="#gameSection" {...params} style={{backgroundColor: this.state.currentBid == bid ? cyan200 : cyan100, margin: "4px" }} key={bid} >
                 {avatar(bid)}
                 {`${this.state.bids[bid]['name']}`}
               </Chip>
               } else if (this.state.bids[bid].status == "readytopay") {
                anyReadyToPay = true
               } else if (this.state.bids[bid].status == "payed") {
                anyPayed = true
               }
            })}
            {!anyReadyToPay && !this.state.currentBid && <div className="newgame-bubble">Clique aqui para criar o seu jogo. Ei, vc pode criar quantos jogos quiser! Lembre-se de mudar o nome para evitar duplicação</div>}
            
            <FloatingActionButton secondary={true} style={{position: "absolute", 
                top:  "0px", right: "25px"}} mini={true} onClick={this.onNewGame.bind(this)}>
              <ContentAdd />
            </FloatingActionButton>
            
        </div>
        </div>

        {anyReadyToPay && <div id="agdoPagto">
        <div style={{backgroundColor: cyan300,padding: "5px", fontSize: "10px",  paddingTop: "10px", paddingLeft: "27px", paddingBottom: "0px", color: "rgba(255, 255, 255, 0.7)"}}>
        AGUARDANDO PAGAMENTO (waiting payment)
        </div>          
        <div style={{display: "flex", flexWrap: "wrap", minHeight: "40px", position: "relative", paddingLeft: "20px", paddingRight: "60px", paddingTop: "5px",paddingBottom: "13px", backgroundColor: cyan300}}>
            {<div className="agdopagto-bubble">
                Não esqueça de pagar seus jogos!
                {/* Apostas encerradas :( */}
            </div>}

            {Object.keys(this.state.bids).map((bid) => {
               if (this.state.bids[bid].status == "readytopay") {
                
                const params = {onClick: (event) => this.onChangeGame(event,bid)}
                if (canEdit(bid)) params['onRequestDelete'] = (event) => this.onRequestDelete(event,bid)
 
               return <Chip {...params} style={{backgroundColor: this.state.currentBid == bid ? cyan200 : cyan100, margin: "4px" }} key={bid} >
                 {avatar(bid)}
                 {`${this.state.bids[bid]['name']}`}
               </Chip>
               }
            })}
            <FloatingActionButton href="/payment" disabled={true} secondary={true} style={{position: "absolute",  
             /* <FloatingActionButton href="/payment" disabled={!anyReadyToPay} secondary={true} style={{position: "absolute",  */
                top:  "0px", right: "25px"}} mini={true} >
              <FontIcon className="material-icons">payment</FontIcon>
            </FloatingActionButton>
        </div>
        </div>}


        {anyPayed && <div>
        <div style={{backgroundColor: cyan600,padding: "5px", fontSize: "10px",  paddingTop: "10px", paddingLeft: "27px", paddingBottom: "0px", color: "rgba(255, 255, 255, 0.7)"}}>
          PAGOS (payed)</div>          
        <div style={{display: "flex", flexWrap: "wrap", minHeight: "40px", position: "relative", paddingLeft: "20px", paddingRight: "60px", paddingTop: "5px",paddingBottom: "13px", backgroundColor: cyan600}}>

            {Object.keys(this.state.bids).map((bid) => {
               if (this.state.bids[bid].status == "payed") {
                const params = {onClick: (event) => this.onChangeGame(event,bid)}
                if (canEdit(bid)) params['onRequestDelete'] = (event) => this.onRequestDelete(event,bid)
 
               return <Chip {...params} style={{backgroundColor: this.state.currentBid == bid ? cyan200 : cyan100, margin: "4px" }} key={bid} >
                 {avatar(bid)}
                 {`${this.state.bids[bid]['name']}`}
               </Chip>
               }
            })}
        </div>
        </div>}

      <div style={{position: "relative"}} id="gameSection">
      { this.state.currentBid && this.state.bids[this.state.currentBid] && 
        <div>
          
          <Toolbar style={{backgroundColor: "rgba(255,255,255,0.5)"}}>
            <ToolbarGroup firstChild={true}>
              <ToolbarTitle style={{color: "#333", width: "60px",fontStyle: "italic", marginLeft: "20px", fontSize: "10px"}} text={status} />
            </ToolbarGroup>
            <ToolbarGroup >
              <RaisedButton label="Salvar" disabled={!edit} />
              <IconButton disabled={!complete} onClick={this.handleAddToCard.bind(this)}>
                  <FontIcon className="material-icons">add_shopping_cart</FontIcon>
              </IconButton>
              <IconButton  disabled={this.state.bids[this.state.currentBid].status != 'readytopay'} onClick={this.handleRemoveFromCard.bind(this)}>
                  <FontIcon className="material-icons">remove_shopping_cart</FontIcon>
              </IconButton>
            </ToolbarGroup>
          </Toolbar>
        <div style={{marginLeft: "2px", marginTop: "20px"}}>
          
          {this.state.bids[this.state.currentBid].status == 'readytopay' && <div className="addtocard-bubble remove">
            Você pode voltar seu jogo ao estágio rascunho acionando este botão aqui
          </div>}
          {!this.state.bids[this.state.currentBid].status && <div className="addtocard-bubble">
            Depois de completar todos os resultados não esqueça de acionar o botão carrinho de compras para selecionar o jogo para pagamento.
          </div>}

          <div style={{width: "256px", margin: "auto",marginBottom: "20px"}}>
            <TextField disabled={!edit} errorText={this.state.bids[this.state.currentBid]["name"] ? "" : "Campo obrigatório"} style={{fontSize: "20px", display: "block", marginRight: "10px"}} hintText="Name" value={this.state.bids[this.state.currentBid]["name"] || ''} onChange={this.onNameChange.bind(this)}/>
            <TextField disabled={!edit} errorText={this.state.bids[this.state.currentBid]["email"] ? "" : "Campo obrigatório"} style={{fontSize: "12px", display: "block", marginRight: "10px"}} hintText="Email" value={this.state.bids[this.state.currentBid]["email"] || ''} onChange={this.onEmailChange.bind(this)}/>
            <TextField disabled={!edit} style={{fontSize: "12px", display: "block", marginRight: "10px"}} hintText="Mobile Number" value={this.state.bids[this.state.currentBid]["mobile"] || ''} onChange={this.onMobileChange.bind(this)}/>
          </div>
          <div style={{textAlign: "center"}} >
          {['a','b','c','d','e','f','g','h'].map(group => (
            <GroupView viewMode={!edit}  complete={this.state.status ? this.state.status[this.state.currentBid][group] : false} userId={this.state.user.uid} bids={this.state.bids} gameId={this.state.currentBid} key={group} group={group}/>
          ))}
          </div>
        </div>
        </div>}
        </div>


      </div>}

      </div>
    );
  }
}
