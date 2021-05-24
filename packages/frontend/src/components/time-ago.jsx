import React from 'react'
import JavascriptTimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'
import ReactTimeAgo from 'react-time-ago'

JavascriptTimeAgo.addLocale(en)
JavascriptTimeAgo.addLocale(ru)

function isValidDate (date) {
  return date instanceof Date && !isNaN(date)
}

function isString (str) {
  return (typeof str === 'string' || str instanceof String)
}

export default function TimeAgo ({date}) {
  if (isString(date)) date = new Date(date)
  return <ReactTimeAgo date={date} />
}
