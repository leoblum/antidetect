import React from 'react'
import {Router, Switch, Route, PrivateRoute, Redirect} from './components/router'
import Auth from './components/auth-page'
import Browsers, {Proxies} from './components/browsers-page'

import PageProfilesList from './old/components/PageProfilesList'
import PageProfileEditor from './old/components/PageProfileEditor'

function Routes () {
  return (
    <Router>
      <Switch>
        <Route path="/auth/*" component={Auth}/>
        <PrivateRoute path="/browsers" component={Browsers}/>
        <PrivateRoute path="/proxies" component={Proxies}/>

        <Route path="/profile/:id" component={PageProfileEditor}/>
        <Route path="/profiles" component={PageProfilesList}/>

        <Route path={'*'}><Redirect to={'/browsers'}/></Route>
      </Switch>
    </Router>
  )
}

export default function App () {
  return (
    <Routes/>
  )
}
