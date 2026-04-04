import React, { useState, useEffect } from 'react'
import { Route, Link, BrowserRouter, Routes, useLocation } from 'react-router-dom'
import Bid from './Bid'
import Master from './Master'
import Home from './Home'
import Login from './Login'
import Leaderboard from './Leaderboard3'
import Ranking from './Ranking'
import BarRace from './BarRace'
import BarRace22 from './BarRace22'
import Viz from './Viz'
import VizHist from './VizHist'
import Rules from './Rules'
import firebase from 'firebase/compat/app'
import { AppBar, Tabs, Tab, Avatar, Button } from '@mui/material'
import { blue } from '@mui/material/colors'

const bgColor = blue[600]

function NavBar({ logged, user, onLogin, onLogout }) {
  const location = useLocation()
  const tabPaths = ['/', '/bids', '/leaderboard', '/ranking']
  const currentTab = tabPaths.indexOf(location.pathname)

  if (location.pathname === '/') return null

  return (
    <div>
      <AppBar position="static" style={{ boxShadow: 'none', backgroundColor: bgColor }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 }}>
          <span style={{ color: 'white', fontWeight: 'bold', paddingLeft: 16, fontSize: 18 }}>
            Bolão dos Bolões
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 8 }}>
            {logged && user && <>
              <Button onClick={onLogout} sx={{ fontSize: '10px', color: '#ccc' }}>Logout</Button>
              <Avatar sx={{ width: 30, height: 30 }} src={user.photoURL} />
            </>}
            {logged === false &&
              <Button onClick={onLogin} sx={{ fontSize: '10px', color: '#ccc' }}>Login</Button>
            }
          </div>
        </div>
      </AppBar>
      <Tabs
        value={currentTab === -1 ? false : currentTab}
        style={{ backgroundColor: bgColor }}
        TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
      >
        <Tab sx={{ color: 'white !important' }} label="HOME" component={Link} to="/" />
        <Tab sx={{ color: 'white !important' }} label="JOGOS" component={Link} to="/bids" />
        <Tab sx={{ color: 'white !important' }} label="TABELÃO" component={Link} to="/leaderboard" />
        <Tab sx={{ color: 'white !important' }} label="RANKING" component={Link} to="/ranking" />
      </Tabs>
    </div>
  )
}

export default function App() {
  const [logged, setLogged] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((u) => {
      if (u) { setLogged(true); setUser(u) }
      else { setLogged(false); setUser(null) }
    })
    return unsubscribe
  }, [])

  const login = () => firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
  const logout = () => firebase.auth().signOut()

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div>
        <div className="header">
          <NavBar logged={logged} user={user} onLogin={login} onLogout={logout} />
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/*" element={<Login />} />
            <Route path="/bids" element={<Bid />} />
            <Route path="/abc" element={<Bid />} />
            <Route path="/master" element={<Master />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/viz" element={<Viz />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/vizhist" element={<VizHist />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/barrace" element={<BarRace />} />
            <Route path="/barrace22" element={<BarRace22 />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
