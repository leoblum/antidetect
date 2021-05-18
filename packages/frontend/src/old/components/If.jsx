import React, {Component} from 'react'

class If extends Component {
  render () {
    return this.props.condition ? this.props.children : <></>
  }
}

export default If
