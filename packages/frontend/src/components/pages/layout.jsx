import { ApiOutlined, LaptopOutlined } from '@ant-design/icons'
import { Button, Layout, Card, Menu, Divider } from 'antd'
import React from 'react'

import Link from '../appLink'
import backend from '../backend'
import useRouter from '../useRouter'

function AppLogo () {
  return (
    <div style={{ userSelect: 'none', fontSize: '22px', margin: '0 10px 0 12px', display: 'flex', alignItems: 'center' }}>
      <div style={{ fontSize: '28px', marginRight: '10px' }}>
        🎭
      </div>
      <div style={{ textAlign: 'center', marginTop: '2px' }}>
        <div style={{ fontSize: '18px', lineHeight: '16px', fontWeight: '500', letterSpacing: '2px' }}>YANUS</div>
        <div style={{ fontSize: '11px', lineHeight: '10px' }}>antidetect</div>
      </div>
    </div>
  )
}

export default function PageLayout ({ children }) {
  const Links = [
    { to: '/profiles', title: 'Profiles', icon: <LaptopOutlined /> },
    { to: '/proxies', title: 'Proxies', icon: <ApiOutlined /> },
  ]

  const router = useRouter()
  const selectedKeys = Links.map((el, idx) => [el.to === router.pathname, idx])
    .filter(el => el[0]).map(el => el[1].toString())

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    height: '48px',
    backgroundColor: 'white',
  }

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '1240px', width: '100%', padding: '0 8px' }}>
        <Layout.Content style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AppLogo />
            <Divider type="vertical" style={{ fontSize: '24px', top: 0 }} />
            <div>
              <Menu mode="horizontal" selectedKeys={selectedKeys} theme="light">
                {Links.map((el, idx) => (
                  <Menu.Item key={idx} icon={el.icon}>
                    <Link to={el.to}>{el.title}</Link>
                  </Menu.Item>
                ))}
              </Menu>
            </div>
          </div>
          <div>
            <Button onClick={() => backend.auth.logout()}>Logout</Button>
          </div>
        </Layout.Content>
        <Layout.Content style={{ padding: '8px 0' }}>
          {children}
        </Layout.Content>
      </div>
    </Layout>
  )
}

export function FormLayout ({ children }) {
  return (
    <PageLayout>
      <Card>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          {children}
        </div>
      </Card>
    </PageLayout>
  )
}
