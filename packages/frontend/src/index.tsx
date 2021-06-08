import React from 'react'
import ReactDOM from 'react-dom'

import Router from '@/components/Router'
import Routes from '@/Routes'

function App() {
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