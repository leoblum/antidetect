import { Button, Layout, Space } from 'antd'
import React, { useState } from 'react'

import Link from '../appLink'
import backend from '../backend'

export function DayNight ({ size = 16 }) {
  const [dark, setDark] = useState(true)
  const onClick = () => {
    setDark(!dark)
    console.log(window.less)
  }
  const style = {
    fontSize: `${size}px`,
    margin: `0 ${size / 2}px`,
    cursor: 'pointer',
    userSelect: 'none',
  }
  return (
    <div style={style} onClick={onClick}>{dark ? '☀️' : '🌙'}</div>
  )
}

export function Header ({ style }) {
  const Links = [
    { to: '/profiles', title: 'Profiles' },
    { to: '/proxies', title: 'Proxies' },
    { to: '/profiles-old', title: 'Old' },
  ]

  const HeaderStyle = {
    width: '100%',
    maxHeight: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 12px',
    ...style,
  }

  return (
    <div style={HeaderStyle}>
      <Space>
        <DayNight size={32} />
        {Links.map((link, i) => <Link key={i} to={link.to}>{link.title}</Link>)}
      </Space>
      <Button onClick={() => backend.auth.logout()}>Logout</Button>
    </div>
  )
}

export default function PageLayout ({ children }) {
  const maxWidth = '1240px' // todo: should be different for media-query

  const LayoutStyle = {
    display: 'flex',
    alignItems: 'center',
    minHeight: '100vh',
  }

  const LayoutHeaderStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '52px',
    padding: 0,
  }

  const LayoutContentStyle = {
    width: '100%',
    height: '100%',
    maxWidth,
    padding: '8px',
  }

  return (
    <Layout style={LayoutStyle}>
      <Layout.Header style={LayoutHeaderStyle}>
        <Header style={{ maxWidth }} />
      </Layout.Header>
      <Layout.Content style={LayoutContentStyle}>
        {children}
      </Layout.Content>
    </Layout>
  )
}
