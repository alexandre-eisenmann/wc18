import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import queryString from 'query-string'
import { CircularProgress, Button, Dialog, DialogContent } from '@mui/material'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'

const provider = new firebase.auth.GoogleAuthProvider()

export default function Login() {
  const [logged, setLogged] = useState(null)
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const queryStringParams = queryString.parse(location.search)

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setLogged(true)
        if (queryStringParams && queryStringParams.fw) {
          navigate(`/${queryStringParams.fw}`)
        }
      } else {
        setLogged(false)
      }
    })
    return unsubscribe
  }, [])

  const login = () => firebase.auth().signInWithRedirect(provider)

  return (
    <div>
      {logged === null && (
        <div style={{ textAlign: "center", marginTop: "10%", width: "100%" }}>
          <CircularProgress size={60} thickness={7} />
        </div>
      )}
      {!open && navigate("/")}
      {logged === false && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{ style: { width: "350px" } }}
        >
          <DialogContent>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                style={{ cursor: "pointer", width: "190px", border: "none", height: "46px", background: "url(btn_google_signin_light_normal_web.png)" }}
                onClick={login}
              />
              <Button color="primary" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
