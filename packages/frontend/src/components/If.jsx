import React from 'react'

export default function If ({ children, condition }) {
  return (condition ? children : <></>)
}
