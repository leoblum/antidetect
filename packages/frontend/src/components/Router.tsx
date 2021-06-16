import { Typography } from 'antd'
import React from 'react'
import { HashRouter as BaseRouter, Redirect, Route, Switch, Link as BaseLink } from 'react-router-dom'

import { useAuth } from '@/hooks'

const BlankComponent = () => (<></>)

type BaseRoute = { path: string, component: () => JSX.Element }
type FlatRoute = BaseRoute & { publicOnly: boolean, authOnly: boolean, redirect: string | null }
export type RoutesCfg = { publicOnly: BaseRoute[], authOnly: BaseRoute[], defaultRedirect?: string }

export function flattenRoutes (routes: RoutesCfg) {
  const result: FlatRoute[] = []
  const defaults = { publicOnly: false, authOnly: false, redirect: null }
  for (const r of routes.publicOnly) result.push({ ...r, ...defaults, publicOnly: true })
  for (const r of routes.authOnly) result.push({ ...r, ...defaults, authOnly: true })
  result.push({ ...defaults, path: '*', component: BlankComponent, redirect: routes.defaultRedirect ?? '/' })
  return result
}

export type SuperRouteProps = FlatRoute
export function SuperRoute ({ path, component, publicOnly, authOnly, redirect }: SuperRouteProps) {
  const auth = useAuth()
  if (publicOnly && auth) return <Redirect to="/" />
  if (authOnly && !auth) return <Redirect to="/auth/login" />
  if (redirect !== null) return <Redirect to={redirect} />
  return <Route path={path} component={component}></Route>
}

export type LinkProps = { children: React.ReactNode, to: string }
export function Link ({ children, to }: LinkProps) {
  return <BaseLink to={to} component={Typography.Link}>{children}</BaseLink>
}

export type RouterProps = { routes: RoutesCfg }
export default function Router ({ routes }: RouterProps) {
  const flatten = flattenRoutes(routes)
  return (
    <useAuth.Provide>
      <BaseRouter>
        <Switch>
          {flatten.map((props, idx) => <SuperRoute key={idx} {...props} />)}
        </Switch>
      </BaseRouter>
    </useAuth.Provide>
  )
}
