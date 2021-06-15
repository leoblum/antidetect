import { ApiOutlined, LaptopOutlined } from '@ant-design/icons'
import { Button, Layout, Menu, Divider } from 'antd'
import React from 'react'

import backend from '@/backend'
import { Link } from '@/components/Router'
import { useRouter } from '@/hooks'

import Logo from './Logo'

const Links = [
  { to: '/profiles', title: 'Profiles', icon: <LaptopOutlined /> },
  { to: '/proxies', title: 'Proxies', icon: <ApiOutlined /> },
]

export default function Header () {
  const router = useRouter()
  const selectedKeys = Links.map((el, idx) => [el.to === router.pathname, idx])
    .filter(el => el[0]).map(el => el[1].toString())

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    height: '48px',
  }

  return (
    <Layout.Content style={headerStyle} className="app-header">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Logo />
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
        <Button onClick={async () => await backend.auth.logout()}>Logout</Button>
      </div>
    </Layout.Content>
  )
}
