import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'
import Main from './Main'

const config = {
  apiKey: "AIzaSyBdQGJm5ziMBTEUa588Z3B93OQxm3MELow",
  authDomain: "bolaodosboloes.com",
  databaseURL: "https://worldcup-27dc4.firebaseio.com",
  projectId: "worldcup-27dc4",
  storageBucket: "worldcup-27dc4.appspot.com",
  messagingSenderId: "596164130928"
}
firebase.initializeApp(config)

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: 'red' }}>
          <h2>Render error</h2>
          <pre>{this.state.error.toString()}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Main />
  </ErrorBoundary>
)
