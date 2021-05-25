import React from 'react'
import ReactDOM from 'react-dom'

import './index.less'

import Router from './components/app-router'
import Routes from './components/app-routes'

export default function App () {
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
