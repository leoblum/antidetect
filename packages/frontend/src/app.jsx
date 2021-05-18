import React, {useState} from 'react'
import Auth from './components/auth-page'
import {Router, Switch, Route, Redirect, PrivateRoute, Link} from './components/router'
import backend from './backend'

export default function App () {
  return (
    <Router>
      <Switch>
        <Route path="/auth/*" component={Auth}/>
        <PrivateRoute path="/">
          Hi!
          <button onClick={() => backend.setAuthToken()}>Logout</button>
        </PrivateRoute>
      </Switch>
    </Router>
  )
}
