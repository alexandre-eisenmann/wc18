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
    this.state = {showButton: true, paymentStatus: null,transactionId: null,logged: null, user: null, bids:[], currentBid: null, status: null, item_list: []}
  }

  isReady(bid) {
    return bid.status && bid.status == "readytopay"
  }




  showPaypalButton() {
      const self = this
      window.paypal.Button.render({

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
                            amount: { total: self.state.item_list.reduce((acc,item) => acc + item.price ,0) , currency: 'BRL' },
                            item_list: {
                              items: self.state.item_list
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
                    firebase.database().ref(`wc18/${self.state.user.uid}/${item.sku}/status`).set("payed")
                  })
                })
                document.getElementById("paypal-button").remove()
                // The payment is complete!
                // You can now show a confirmation message to the customer
            });
        }

    }, '#paypal-button');

  }

  componentWillUnmount() {

    if (this.ref) {
      this.ref.off('value')
    }
    this.unsubscribe()
  }

  componentDidMount() {
    document.getElementById("paypal-button").style.visibility="hidden"
    const self = this
    this.unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        self.setState({logged: true, user: user})
        self.ref = firebase.database().ref(`wc18/${user.uid}`)
        self.ref.on('value', snapshot => {
          const bids  = {}, list=[]
          snapshot.forEach(function(childSnapshot) {
            const childKey = childSnapshot.key
            const childData = childSnapshot.val()

            if (self.isReady(childData)) {
              bids[childKey] = childData 
              list.push({
                sku : childKey,
                name: childData.name,
                description: `${user.uid}/${childKey}`,
                quantity: 1,
                price: 10.00,
                currency: 'BRL'
              })
            }
            
            
          });
          
          self.setState({bids:bids, item_list:list})
          if (self.state.item_list.length > 0) {
            document.getElementById("paypal-button").style.visibility="visible"
          } else {
            document.getElementById("paypal-button").style.visibility="hidden"
          }

        })
    
      } else {
        self.setState({logged: false, user: null})
      }

      self.showPaypalButton()            
    });

 



  }

  
  render() {

    return (
      
      
      <div style={{padding: "50px", backgroundColor: "#eeeeee"}}>
        {this.state.logged == false && <Redirect to='/login?fw=payment' />}

        <div style={{marginBottom: "20px"}}>
          {this.state.transactionId && <div style={{marginBottom: "10px"}}><span style={{color:  "#555", display: "inline-block",width: "150px"}}>Transaction ID</span><span>{this.state.transactionId}</span></div>}
          {this.state.paymentStatus && <div><span style={{color:  "#555", display: "inline-block", width: "150px"}}>Status</span><span> {this.state.paymentStatus}</span></div>}
        </div>
        {this.state.item_list.length > 0 && <div style={{marginBottom: "20px"}}>
          <Paper zDepth={1} > 
          <Table>
            <TableHeader   style={{borderBottom: "none"}} adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn>Nome</TableHeaderColumn>
                <TableHeaderColumn>Código</TableHeaderColumn>
                <TableHeaderColumn style={{textAlign: "right"}}>Valor</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {this.state.item_list.map((bid) => {
                return <TableRow key={bid.sku}>
                    <TableRowColumn>{bid.name}</TableRowColumn>
                    <TableRowColumn>{bid.sku}</TableRowColumn>
                    <TableRowColumn style={{textAlign: "right"}}>{bid.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableRowColumn>
                  </TableRow>
                })}
              <TableRow  style={{marginBottom: "20px"}}>
                <TableRowColumn colSpan="3" style={{textAlign: 'right',marginBottom: "40px", fontSize: "20px"}}>
                  {`Total ${this.state.item_list.reduce((acc,item) => acc + item.price ,0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }`}
                </TableRowColumn>
              </TableRow>
                
            </TableBody>
          </Table>
          </Paper>
        </div>}
        <div style={{float: "right"}} id="paypal-button"></div>
      </div>
    );
  }
}
