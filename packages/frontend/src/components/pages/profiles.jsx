import { ReloadOutlined, MoreOutlined, CaretRightOutlined } from '@ant-design/icons'
import { Table, Button, Space, Dropdown, Menu } from 'antd'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React, { useEffect, useState } from 'react'

import backend from '../backend'
import TimeAgo from '../time-ago'
import useRouter from '../use-router'
import natSorter from '../utils/natsort'

import PageLayout from './layout'

export function StyleForEach ({ children, style }) {
  return (
    <>{React.Children.map(children, child => React.cloneElement(child, { style: { ...style, ...child.props.style } }))}</>
  )
}

async function getProfilesAndProxies () {
  let profiles = await backend.profiles()
  let proxies = await backend.proxies()

  if (!profiles.success || !proxies.success) {
    console.error('data not loaded', profiles, proxies)
    return null
  }

  profiles = profiles.profiles
  proxies = proxies.proxies
  return { profiles, proxies }
}

function selectById (items, id, key = '_id') {
  for (const item of items) {
    if (item[key] === id) return item
  }
  return null
}

function TableProxyBlock ({ proxy }) {
  const name = proxy ? proxy.name : 'None'
  const addr = proxy ? `${proxy.host}:${proxy.port}` : 'Direct Conection'
  const flag = proxy ? (proxy.country !== null ? getUnicodeFlagIcon(proxy.country) : '🌍') : '🚫'

  // todo: do not forget change color of text when change theme
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <StyleForEach style={{ paddingLeft: '8px' }}>
        <div style={{ fontSize: '18px' }}>{flag}</div>
        <div>
          <div>{name}</div>
          <div style={{ fontSize: '10px', color: '#8c8c8c' }}>{addr}</div>
        </div>
      </StyleForEach>
    </div>
  )
}

function Block ({ children, style }) {
  return (
    <div className={'app-content-block'} style={{ style }}>{children}</div>
  )
}

function TableHeader () {
  const router = useRouter()
  return (
    <Block>
      <Space>
        <Button></Button>
      </Space>
      <Space>
        <Button type="primary" onClick={() => router.replace('/profiles/add')}>Create Profile</Button>
        <Button type="default" icon={<ReloadOutlined />} />
      </Space>
    </Block>
  )
}

function ActionRender ({ profile }) {
  const profileId = profile._id
  const router = useRouter()

  const editProfile = () => router.replace(`/profiles/edit/${profileId}`)
  const cloneProfile = () => console.log(`clone profile: ${profileId}`)
  const deleteProfile = () => console.log(`delete profile: ${profileId}`)

  const menu = (
    <Menu>
      <Menu.Item onClick={editProfile}>Edit</Menu.Item>
      <Menu.Item onClick={cloneProfile}>Clone</Menu.Item>
      <Menu.Item onClick={deleteProfile}>Delete</Menu.Item>
      {/* <Menu.Divider /> */}
    </Menu>
  )

  return (
    <Space>
      <Button type="primary" icon={<CaretRightOutlined />}>Run</Button>
      <Dropdown overlay={menu} trigger="click" placement="bottomRight">
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  )
}

export default function ProfilesList () {
  const [data, setData] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState(null)
  useEffect(async () => setData(await getProfilesAndProxies()), [])

  if (!data) {
    return (
      <PageLayout>
        <Table loading />
      </PageLayout>
    )
  }

  const { profiles, proxies } = data

  const NameColumn = {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => natSorter(a.name, b.name),
  }

  const ProxyColumn = {
    title: 'Proxy',
    dataIndex: 'proxy',
    render: x => <TableProxyBlock proxy={selectById(proxies, x)} />,
  }

  const LastActiveColumn = {
    title: 'Last Active',
    dataIndex: 'createdAt', // todo:
    render: x => <TimeAgo date={x} />,
  }

  const ActionColumn = {
    title: 'Action',
    width: 100,
    align: 'left',
    // render: (item) => <ActionRender profile={item} />,
    render: (item) => ActionRender({ profile: item }),
  }

  const tableProps = {
    rowKey: '_id',
    rowSelection: {
      selectedRowKeys: selectedRowKeys,
      onChange: data => setSelectedRowKeys(data),
    },
    dataSource: profiles,
    columns: [
      NameColumn,
      LastActiveColumn,
      ProxyColumn,
      ActionColumn,
    ],
    pagination: {
      defaultPageSize: 25,
      size: 'default',
    },
    size: 'small',
    showSorterTooltip: false,
    // title: () => <TableHeader/>,
  }

  return (
    <PageLayout>
      <TableHeader />
      <Table {...tableProps}></Table>
    </PageLayout>
  )
}
