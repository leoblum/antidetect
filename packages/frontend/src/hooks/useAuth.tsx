import React, { createContext, useContext, useState, useEffect } from 'react'

import backend from '@/backend'

const authContext = createContext(false)
const useAuth = () => useContext(authContext)

function useProvideAuth () {
  const [auth, setAuth] = useState(backend.auth.isAuth())
  useEffect(() => backend.auth.onAuthStateChanged(setAuth), [])
  return auth
}

function Provide ({ children }: { children: JSX.Element }) {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

useAuth.Provide = Provide
export default useAuth
