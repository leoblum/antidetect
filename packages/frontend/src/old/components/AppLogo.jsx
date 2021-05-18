import React, {Component} from 'react'
import {Link} from 'react-router-dom'

const LogoStyle = {
  textAlign: 'center',
  color: 'white',
  fontSize: 24,
  fontWeight: 'bold',
  paddingTop: 20,
  paddingBottom: 10,
}

class AppLogo extends Component {
  render () {
    return (
      <h1 style={LogoStyle}>
        <Link to="/" style={{color: 'white'}}>YANUS</Link>
      </h1>
    )
  }
}

export default AppLogo
