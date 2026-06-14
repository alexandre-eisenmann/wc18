import React, { useState, useEffect, Suspense, lazy } from 'react'
import { Route, BrowserRouter, Routes, Navigate, useLocation } from 'react-router-dom'
import Home from './Home'
import firebase from 'firebase/compat/app'

const NavBar = lazy(() => import('./NavBar'))
const Bid = lazy(() => import('./Bid'))
const Master = lazy(() => import('./Master'))
const Login = lazy(() => import('./Login'))
const Ranking = lazy(() => import('./Ranking'))
const Ranking2 = lazy(() => import('./Ranking2'))
const BarRace = lazy(() => import('./BarRace'))
const BarRace22 = lazy(() => import('./BarRace22'))
const BarRaceX = lazy(() => import('./BarRaceX'))
const RankFlow = lazy(() => import('./RankFlow'))
const Viz = lazy(() => import('./Viz'))
const VizHist = lazy(() => import('./VizHist'))
const Rules = lazy(() => import('./Rules'))
const Payment = lazy(() => import('./Payment'))

function RouteLoading() {
  return <div style={{ padding: 24, fontFamily: 'Lato', color: '#9097a1' }}>Carregando...</div>
}

function AppShell({ logged, user, onLogin, onLogout }) {
  const location = useLocation()

  return (
    <div>
      <div className="header">
        {location.pathname !== '/' && (
          <Suspense fallback={null}>
            <NavBar logged={logged} user={user} onLogin={onLogin} onLogout={onLogout} />
          </Suspense>
        )}
      </div>
      <div className="content">
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/*" element={<Login />} />
            <Route path="/bids" element={<Bid />} />
            <Route path="/abc" element={<Bid />} />
            <Route path="/master" element={<Master />} />
            <Route path="/leaderboard" element={<Ranking2 />} />
            <Route path="/ranking" element={<Navigate to="/leaderboard" replace />} />
            <Route path="/viz" element={<Viz />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/vizhist" element={<VizHist />} />
            <Route path="/ranking-classic" element={<Ranking />} />
            <Route path="/barrace" element={<BarRace />} />
            <Route path="/barrace22" element={<BarRace22 />} />
            <Route path="/race" element={<BarRaceX />} />
            <Route path="/rankflow" element={<RankFlow />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  )
}

export default function App() {
  const [logged, setLogged] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false
    import('firebase/compat/auth').then(() => {
      if (cancelled) return
      unsubscribe = firebase.auth().onAuthStateChanged((u) => {
        if (u) { setLogged(true); setUser(u) }
        else { setLogged(false); setUser(null) }
      })
    })
    return () => { cancelled = true; unsubscribe() }
  }, [])

  const login = async () => {
    await import('firebase/compat/auth')
    return firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
  }
  const logout = async () => {
    await import('firebase/compat/auth')
    return firebase.auth().signOut()
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppShell logged={logged} user={user} onLogin={login} onLogout={logout} />
    </BrowserRouter>
  )
}
