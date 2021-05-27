import React from 'react'
import ReactDOM from 'react-dom'

import './index.less'

import Router from './components/appRouter'
import Routes from './components/appRoutes'

function App () {
  return (
    <Router routes={Routes} />
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
