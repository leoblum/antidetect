import { Layout, Card } from 'antd'
import React, { ComponentType } from 'react'

import Header from './Header'

type LayoutProps = { children: JSX.Element }

const LayoutBase = ({ children }: LayoutProps) => (
  <Layout style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
    <div style={{ maxWidth: '1240px', width: '100%', padding: '0 8px' }}>
      <Header />
      <Layout.Content style={{ padding: '8px 0' }}>
        {children}
      </Layout.Content>
    </div>
  </Layout>
)

const LayoutForm = ({ children }: LayoutProps) => (
  <LayoutBase>
    <Card>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        {children}
      </div>
    </Card>
  </LayoutBase>
)

const getDisplayName = (Component: ComponentType, defaultName: string) => {
  return Component?.displayName ?? Component?.name ?? defaultName
}

export const withLayout = (Component: ComponentType, Layout: ComponentType) => {
  const ComponentWithLayout = () => (
    <Layout>
      <Component />
    </Layout>
  )

  const name1 = getDisplayName(Component, 'Component')
  const name2 = getDisplayName(Component, 'Layout')
  ComponentWithLayout.displayName = `withLayout(${name1},${name2})`
  return ComponentWithLayout
}

export const withBaseLayout = (Component: ComponentType) => withLayout(Component, LayoutBase as ComponentType)
export const withFormLayout = (Component: ComponentType) => withLayout(Component, LayoutForm as ComponentType)
