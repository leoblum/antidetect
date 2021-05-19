import React from 'react'
import {Button, Layout, Space} from 'antd'
import {Link} from './router'
import backend from '../backend'

export function StyleForEach ({children, style}) {
  return (
    <>{React.Children.map(children, child => React.cloneElement(child, {style: {...style, ...child.props.style}}))}</>
  )
}

export function BaseLayout ({children}) {
  const headerStyle = {
    height: '52px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    // flexDirection: 'row-reverse',
    padding: '0 12px',
  }

  const contentStyle = {
    padding: '12px',
    // marginTop: '2px',
    height: '100%',
  }

  return (
    <Layout style={{minHeight: '100vh'}}>
      <Layout.Header style={headerStyle}>
        <Space style={{textTransform: 'uppercase'}}>
          <div style={{fontSize: '32px', padding: '0 16px'}}>🔅</div>
          <Link to="/browsers">Browsers</Link>
          <Link to="/proxies">Proxies</Link>
          <Link to="/profiles">Old</Link>
        </Space>
        <Button onClick={() => backend.logout()}>Logout</Button>
      </Layout.Header>
      <Layout.Content style={contentStyle}>
        {children}
      </Layout.Content>
    </Layout>
  )
}
