import React from 'react'
import ReactDOM from 'react-dom'

import './index.less'

// import Router from '@/Components/Router'
// import Routes from './Components/Router'
import Router from '@/Components/Router'

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
