import React, {useState} from 'react'
import {Button, Layout, Space} from 'antd'
import {Link} from './router'
import backend from '../backend'

export function StyleForEach ({children, style}) {
  return (
    <>{React.Children.map(children, child => React.cloneElement(child, {style: {...style, ...child.props.style}}))}</>
  )
}

function DayNight ({size = 16}) {
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

function BaseHeader ({style}) {
  style = {
    width: '100%',
    maxHeight: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 12px',
    ...style,
  }

  return (
    <div style={style}>
      <Space style={{textTransform: 'uppercase'}}>
        <DayNight size={32} />
        <Link to="/profiles">Profiles</Link>
        <Link to="/proxies">Proxies</Link>
        <Link to="/profiles">Old</Link>
      </Space>
      <Button onClick={() => backend.logout()}>Logout</Button>
    </div>
  )
}

export function BaseLayout ({children}) {
  const maxWidth = '1240px' // todo: should be different for media-query

  const layoutStyle = {
    display: 'flex',
    alignItems: 'center',
    minHeight: '100vh',
  }

  const headerStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '52px',
    padding: 0,
  }

  const contentStyle = {
    width: '100%',
    height: '100%',
    maxWidth,
    // marginTop: '8px',
    // margin: '8px',
    padding: '8px',
  }

  return (
    <Layout style={layoutStyle}>
      <Layout.Header style={headerStyle}>
        <BaseHeader style={{maxWidth}} />
      </Layout.Header>
      <Layout.Content style={contentStyle}>
        {children}
      </Layout.Content>
    </Layout>
  )
}
