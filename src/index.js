import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Main from './Main';
import registerServiceWorker from './registerServiceWorker';
import * as firebase from 'firebase'

const config = {
  apiKey: "AIzaSyBdQGJm5ziMBTEUa588Z3B93OQxm3MELow",
  authDomain: "worldcup-27dc4.firebaseapp.com",
  databaseURL: "https://worldcup-27dc4.firebaseio.com",
  projectId: "worldcup-27dc4",
  storageBucket: "worldcup-27dc4.appspot.com",
  messagingSenderId: "596164130928"
};
firebase.initializeApp(config);



ReactDOM.render(<Main />, document.getElementById('root'));
registerServiceWorker();
