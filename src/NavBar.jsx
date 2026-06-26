import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AppBar, Tabs, Tab, Avatar, Button, Icon } from '@mui/material'
import { blue } from '@mui/material/colors'
import { useT, LanguageSwitcher } from './i18n'

const bgColor = blue[600]

export default function NavBar({ logged, user, onLogin, onLogout }) {
  const location = useLocation()
  const { t } = useT()
  const tabPaths = ['/bids', '/leaderboard', '/rankflow', '/badges']
  const currentTab = tabPaths.indexOf(location.pathname)

  return (
    <div>
      <AppBar position="static" style={{ boxShadow: 'none', backgroundColor: bgColor }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16, paddingTop: 4, paddingBottom: 2 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', paddingLeft: 16 }}>
            <Icon style={{ color: 'white', fontSize: 22 }}>home</Icon>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
              {t('app.brand')}
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 8 }}>
            <LanguageSwitcher color="rgba(255,255,255,0.7)" separatorColor="rgba(255,255,255,0.4)" activeColor="white" />
            {logged && user && <>
              <Button onClick={onLogout} sx={{ fontSize: '10px', color: '#ccc' }}>{t('auth.logout')}</Button>
              <Avatar sx={{ width: 30, height: 30 }} src={user.photoURL} />
            </>}
            {logged === false &&
              <Button onClick={onLogin} sx={{ fontSize: '10px', color: '#ccc' }}>{t('auth.login')}</Button>
            }
          </div>
        </div>
      </AppBar>
      <Tabs
        value={currentTab === -1 ? false : currentTab}
        style={{ backgroundColor: bgColor }}
        TabIndicatorProps={{ style: { backgroundColor: '#ff4081', height: 3 } }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab sx={{ color: 'white !important' }} label={t('nav.bids')} component={Link} to="/bids" />
        <Tab sx={{ color: 'white !important' }} label={t('nav.leaderboard')} component={Link} to="/leaderboard" />
        <Tab sx={{ color: 'white !important' }} label={t('nav.evolution')} component={Link} to="/rankflow" />
        <Tab sx={{ color: 'white !important' }} label={t('nav.badges')} component={Link} to="/badges" />
      </Tabs>
    </div>
  )
}
