import React from 'react'
import ReactDOM from 'react-dom'

import App from './app'
import './index.css'

// import JavascriptTimeAgo from 'javascript-time-ago'
// import en from 'javascript-time-ago/locale/en'
// import ru from 'javascript-time-ago/locale/ru'
// JavascriptTimeAgo.addLocale(en)
// JavascriptTimeAgo.addLocale(ru)

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root'),
)
