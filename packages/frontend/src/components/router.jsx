import React from 'react'
import * as ReactRouter from 'react-router-dom'
import {Typography} from 'antd'
import {ProvideAuth, useAuth} from '../hooks/use-auth'

export const {Switch, Route, Redirect} = ReactRouter
export const {useHistory} = ReactRouter

export function Link ({children, ...props}) {
  return <ReactRouter.Link component={Typography.Link} {...props}>{children}</ReactRouter.Link>
}

export function Router ({children}) {
  const Router = ReactRouter.HashRouter
  return (
    <ProvideAuth>
      <Router>{children}</Router>
    </ProvideAuth>
  )
}

export function PrivateRoute ({children, ...props}) {
  const auth = useAuth()
  const render = ({location}) => auth ? children : <Redirect to={{pathname: '/auth/login', state: {from: location}}}/>
  return (
    <Route {...props} render={render}/>
  )
}
