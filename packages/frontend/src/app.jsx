import React from 'react'
import {Router, Switch, Route} from './components/router'
import {SingIn, SingUp, ResetPassword} from './components/page-auth'
import {Profiles, Proxies, AddProfile} from './components/page-profiles'

import PageProfilesList from './old/components/PageProfilesList'
import PageProfileEditor from './old/components/PageProfileEditor'

function Routes () {
  return (
    <Router>
      <Switch>
        <Route path={'/auth/login'} component={SingIn} publicOnly />
        <Route path={'/auth/create'} component={SingUp} publicOnly />
        <Route path={'/auth/reset'} component={ResetPassword} publicOnly />

        <Route path={'/profiles/add'} component={AddProfile} authOnly />
        <Route path={'/profiles/edit/:profileId'} component={AddProfile} authOnly />
        <Route path={'/profiles'} component={Profiles} authOnly />

        <Route path={'/proxies'} component={Proxies} authOnly />

        <Route path={'/profiles/:id'} component={PageProfileEditor} authOnly />
        <Route path={'/profiles'} component={PageProfilesList} authOnly />

        <Route path={'*'} redirect={'/profiles'} />
      </Switch>
    </Router>
  )
}

export default function App () {
  return (
    <Routes />
  )
}
