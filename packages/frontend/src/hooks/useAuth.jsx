import React, { createContext, useContext, useState, useEffect } from 'react'

import backend from 'Backend'

const authContext = createContext(null)
const useAuth = () => useContext(authContext)

function ProvideAuth ({ children }) {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

function useProvideAuth () {
  const [auth, setAuth] = useState(backend.auth.isAuth())
  useEffect(() => backend.auth.onAuthStateChanged(setAuth), [])
  return auth
}

useAuth.ProvideAuth = ProvideAuth
export default useAuth
