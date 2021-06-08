import React from 'react'
import ReactDOM from 'react-dom'

import Router from '@/components/Router'
import Routes from '@/routes'

import './index.less'

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
