import React from 'react'

import Router from './components/app-router'
import Routes from './components/app-routes'

export default function App () {
  return (
    <Router routes={Routes} />
  )
}
