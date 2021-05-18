import React, {Component} from 'react'
import {Layout} from 'antd'
import AppLogo from './AppLogo'
import AppMenu from './AppMenu'

class AppLayout extends Component {
  render () {
    let children = React.Children.toArray(this.props.children)
    let head = children.filter(x => x.type === Head)
    let body = children.filter(x => x.type === Body)

    if (head.length > 1) console.warn('AppLayout.Head more than element one passed. Used first')
    if (body.length > 1) console.warn('AppLayout.Body more than element one passed. Used first')

    head = head.length > 0 ? head[0] : null
    body = body.length > 0 ? body[0] : null

    let headStyle = Object.assign({
      backgroundColor: 'inherit',
      paddingLeft: 14,
    }, head?.props?.style)

    let bodyStyle = Object.assign({}, body?.props?.style)

    return (
      <Layout style={{height: '100vh'}}>
        <Layout.Sider>
          <AppLogo/>
          <AppMenu/>
        </Layout.Sider>
        <Layout.Content>
          <Layout style={{marginLeft: 14, marginRight: 14}}>
            <Layout.Header style={headStyle}>{head}</Layout.Header>
            <Layout.Content style={bodyStyle}>{body}</Layout.Content>
          </Layout>
        </Layout.Content>
      </Layout>
    )
  }
}

class Head extends Component {
  render () {
    return this.props?.children || null
  }
}

class Body extends Component {
  render () {
    return this.props?.children || null
  }
}

AppLayout.Head = Head
AppLayout.Body = Body

export default AppLayout
