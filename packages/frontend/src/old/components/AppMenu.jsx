import React, {Component} from 'react'
import {Link, withRouter} from 'react-router-dom'
import {Menu} from 'antd'

const links = [
  {path: '/profiles', name: 'All Profiles'},
  {path: '/profiles/new', name: 'New Profile'},
]

class AppMenu extends Component {
  render () {
    return (
      <Menu mode="vertical-left" defaultSelectedKeys={this.props.location.pathname} theme="dark">
        {links.map(x => (
          <Menu.Item key={x.path} className="app-menu-item">
            <Link to={x.path}>{x.name}</Link>
          </Menu.Item>
        ))}
      </Menu>
    )
  }
}

export default withRouter(AppMenu)
