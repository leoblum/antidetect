import { Typography } from 'antd'
import React from 'react'
import { HashRouter as BaseRouter, Redirect, Route, Switch, Link as BaseLink } from 'react-router-dom'

import { useAuth } from '@/hooks'

export function flattenRoutes (routesIn) {
  const routes = []
  for (const route of routesIn.publicOnly) routes.push({ ...route, publicOnly: true })
  for (const route of routesIn.authOnly) routes.push({ ...route, authOnly: true })
  routes.push({ path: '*', redirect: routesIn.default })
  return routes
}

export function SuperRoute ({ children, publicOnly, authOnly, redirect, ...props }) {
  const auth = useAuth()
  if (publicOnly && auth) return <Redirect to="/" />
  if (authOnly && !auth) return <Redirect to="/auth/login" />
  if (redirect) return <Redirect to={redirect} />
  return <Route {...props}>{children}</Route>
}

export function Link ({ children, ...props }) {
  return <BaseLink component={Typography.Link} {...props}>{children}</BaseLink>
}

export default function Router ({ routes }) {
  const flatten = flattenRoutes(routes)
  return (
    <useAuth.ProvideAuth>
      <BaseRouter>
        <Switch>
          {flatten.map((props, idx) => <SuperRoute key={idx} {...props} />)}
        </Switch>
      </BaseRouter>
    </useAuth.ProvideAuth>
  )
}