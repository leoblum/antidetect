import React from 'react'
import ReactDOM from 'react-dom'

import Router from '@/components/Router'
import { useTheme } from '@/hooks'
import Routes from '@/routes'

function App () {
  return (
    <useTheme.Provide>
      <Router routes={Routes} />
    </useTheme.Provide>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
