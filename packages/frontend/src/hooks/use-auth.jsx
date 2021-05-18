import React, {useState, useEffect, useContext, createContext} from 'react'
import backend from '../backend'

const authContext = createContext(null)

export function ProvideAuth ({children}) {
  const auth = useProvideAuth()
  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

export function useAuth () {
  return useContext(authContext)
}

function useProvideAuth () {
  const [auth, setAuth] = useState(backend.isAuth)
  useEffect(() => backend.onAuthStateChanged(setAuth))
  return auth
}

export default useAuth
