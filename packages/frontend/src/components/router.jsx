import React, {createContext, useContext, useEffect, useMemo, useState} from 'react'
import queryString from 'query-string'
import {Typography} from 'antd'
import {
  useParams, useLocation, useHistory, useRouteMatch,
  Switch, Redirect,
  HashRouter as RouterBase,
  Link as LinkBase,
  Route as RouteBase,
} from 'react-router-dom'
import backend from '../backend'

const authContext = createContext(null)
const useAuth = () => useContext(authContext)

function ProvideAuth ({children}) {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

function useProvideAuth () {
  const [auth, setAuth] = useState(backend.isAuth)
  useEffect(() => backend.onAuthStateChanged(setAuth))
  return auth
}

// https://usehooks.com/useRouter/
function useRouter () {
  const params = useParams()
  const location = useLocation()
  const history = useHistory()
  const match = useRouteMatch()
  return useMemo(() => {
    return {
      push: history.push,
      replace: history.replace,
      pathname: location.pathname,
      query: {...queryString.parse(location.search), ...params},
      match,
      location,
      history,
    }
  }, [params, match, location, history])
}

function Router ({children}) {
  return (
    <ProvideAuth>
      <RouterBase>{children}</RouterBase>
    </ProvideAuth>
  )
}

function Route ({children, publicOnly, authOnly, redirect, ...props}) {
  const auth = useAuth()
  console.info(props.path, {publicOnly, authOnly, redirect})
  if (publicOnly && auth) return <Redirect to={'/'}/>
  if (authOnly && !auth) return <Redirect to={'/auth/login'}/>
  if (redirect) return <Redirect to={redirect}/>
  return <RouteBase {...props}>{children}</RouteBase>
}

function Link ({children, ...props}) {
  return <LinkBase component={Typography.Link} {...props}>{children}</LinkBase>
}

export {Router, Route, Switch, Redirect, Link}
export {useRouter, useAuth}
