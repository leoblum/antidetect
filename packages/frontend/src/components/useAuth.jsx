import React, { createContext, useContext, useState, useEffect } from 'react'

import backend from './backend'

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

export { ProvideAuth }
export default useAuth
