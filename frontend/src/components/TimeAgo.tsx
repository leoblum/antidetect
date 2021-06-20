import JavascriptTimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'
import React from 'react'
import ReactTimeAgo from 'react-time-ago'

JavascriptTimeAgo.addLocale(en)
JavascriptTimeAgo.addLocale(ru)

function isString (str) {
  return (typeof str === 'string' || str instanceof String)
}

export default function TimeAgo ({ date }: { date: any }) {
  if (isString(date)) date = new Date(date)
  return <ReactTimeAgo date={date} />
}
