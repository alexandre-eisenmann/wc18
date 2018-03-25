import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import GroupView from './GroupView.js'
import Header from './Header.js'
import * as firebase from 'firebase'
import {Redirect} from "react-router-dom"
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
import {green700, blue600, cyan500, cyan100,pink500} from 'material-ui/styles/colors';
import Paper from 'material-ui/Paper'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
  TableFooter,
} from 'material-ui/Table';



export default class Payment extends Component {

  constructor(props) {
    super(props)
    this.state = {showButton: true, paymentStatus: null,transactionId: null,logged: null, user: null, bids:[], currentBid: null, status: null}
    this.item_list = []
  }

  isReady(bid) {
    if (!bid.name) return false
    if (!bid.email) return false
    if (bid.transactionId) return false
    let complete = true
    Object.keys(data.groups).map(group => {
        const matches = data.groups[group]["matches"]
        for(let i=0; i< matches.length ; i++) {
            const result = bid[matches[i].name]
            if (!(result && (result['h'] || result['h'] == 0) && (result['a'] || result['a'] == 0))) {
              complete = false
              break
            }
        }
    })
    return complete
  }





  componentDidMount() {
    const self = this
    this.item_list = []
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        self.setState({logged: true, user: user})
        const ref = firebase.database().ref(`wc18/${user.uid}`)
        ref.once('value', snapshot => {
          const bids  = {}
          snapshot.forEach(function(childSnapshot) {
            const childKey = childSnapshot.key
            const childData = childSnapshot.val()

            if (self.isReady(childData)) {
              bids[childKey] = childData 
              self.item_list.push({
                sku : childKey,
                name: childData.name,
                description: `${user.uid}/${childKey}`,
                quantity: 1,
                price: 10.00,
                currency: 'BRL'
              })
            }
            
            
          });
          
          self.setState({bids:bids})
        })
    
      } else {
        self.setState({logged: false, user: null})
      }
    });

    const paypal = window.paypal
    paypal.Button.render({

      env: 'sandbox', // Or 'sandbox'

      client: {
          sandbox:    'AWz28dUNaYipwd1ced45MtW3333jBNxPxaxck9txl8oiYaad_Vh9e-bxYY5fvrViPK6gMAGCwH_ziFNt',
          production: 'xxxxxxxxx'
      },

      commit: true, // Show a 'Pay Now' button

      payment: function(data, actions) {
          console.log('data+actions init',data,actions)
          return actions.payment.create({
              payment: {
                  transactions: [
                      {
                          amount: { total: self.item_list.reduce((acc,item) => acc + item.price ,0) , currency: 'BRL' },
                          item_list: {
                            items: self.item_list
                          }
                      }
                  ]
              }
          });
      },

      onAuthorize: function(data, actions) {
         console.log('data+actions', data, actions)
          
          self.setState({paymentStatus: "authorized", showButton: false})

          return actions.payment.execute().then(function(payment) {
              self.setState({paymentStatus: "sent"})
              console.log('payment',payment)
              
              payment.transactions.map((transaction) => {
                const transactionId = transaction.related_resources[0].sale.id
                const status = transaction.related_resources[0].sale.state
                self.setState({paymentStatus: status, transactionId: transactionId})
                transaction.item_list.items.map((item) => {

                  console.log('pago', transactionId, item.sku)
                  firebase.database().ref(`wc18/${self.state.user.uid}/${item.sku}/transactionId`).set(transactionId)
                })
              })
              document.getElementById("paypal-button").remove()
              // The payment is complete!
              // You can now show a confirmation message to the customer
          });
      }

  }, '#paypal-button');


  }

  
  render() {

    return (
      
      
      <div style={{padding: "50px", backgroundColor: "#eeeeee"}}>

        <div>
          <span>{this.state.transactionId}</span>
          <span>{this.state.paymentStatus}</span>
        </div>
        <div style={{marginBottom: "20px"}}>
          <Paper zDepth={1} > 
          <Table>
            <TableHeader   style={{borderBottom: "none"}} adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn>Código</TableHeaderColumn>
                <TableHeaderColumn>Nome</TableHeaderColumn>
                <TableHeaderColumn style={{textAlign: "right"}}>Valor</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {this.item_list.map((bid) => {
                return <TableRow key={bid.sku}>
                    <TableRowColumn>{bid.sku}</TableRowColumn>
                    <TableRowColumn>{bid.name}</TableRowColumn>
                    <TableRowColumn style={{textAlign: "right"}}>{`R$ ${bid.price}`}</TableRowColumn>
                  </TableRow>
                })}
              <TableRow  style={{marginBottom: "20px"}}>
                <TableRowColumn colSpan="3" style={{textAlign: 'right',marginBottom: "40px", fontSize: "20px"}}>
                  {`Total R$ ${this.item_list.reduce((acc,item) => acc + item.price ,0) }`}
                </TableRowColumn>
              </TableRow>
                
            </TableBody>
          </Table>
          </Paper>
        </div>
        <div style={{float: "right"}} id="paypal-button"></div>
      </div>
    );
  }
}
