import { ReloadOutlined, MoreOutlined, CaretRightOutlined, WindowsOutlined, AppleOutlined, EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { Table, Button, Space, Dropdown, Menu, Input, Modal } from 'antd'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React, { useEffect, useState } from 'react'

import backend from '../backend'
import TimeAgo from '../timeAgo'
import useRouter from '../useRouter'
import natSorter from '../utils/natsort'

import PageLayout from './layout'

const { confirm } = Modal

export function StyleForEach ({ children, style }) {
  return (
    <>{React.Children.map(children, child => React.cloneElement(child, { style: { ...style, ...child.props.style } }))}</>
  )
}

export const TitleSearch = ({ onSearch, ...props }) => (
  <div {...props}>
    <Input.Search
      placeholder="Enter Title"
      onSearch={onSearch}
      style={{ width: 200 }}
    />
  </div>
)

async function getProfilesAndProxies () {
  let profiles = await backend.profiles.all()
  let proxies = await backend.proxies.all()

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

function TableHeader () {
  const router = useRouter()

  return (
    <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Space>
        <Input.Search placeholder="Enter Name" onSearch={() => null} style={{ width: 200 }} />
      </Space>
      <Space>
        <Button type="primary" onClick={() => router.replace('/profiles/add')}>Create Profile</Button>
        <Button type="default" onClick={() => router.replace('/')} icon={<ReloadOutlined />} />
      </Space>
    </Space>
  )
}

function ActionRender ({ profile }) {
  const profileId = profile._id
  const router = useRouter()

  async function deleteProfile () {
    confirm({
      content: `Are you sure delete profile "${profile.name}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async function () {
        await backend.profiles.delete(profileId)
        router.replace('/')
      },
    })
  }

  const editProfile = () => router.replace(`/profiles/edit/${profileId}`)
  const cloneProfile = () => console.log(`clone profile: ${profileId}`)

  const menu = (
    <Menu style={{ minWidth: '100px' }}>
      <Menu.Item icon={<EditOutlined />} onClick={editProfile}>Edit</Menu.Item>
      <Menu.Divider />
      <Menu.Item icon={<CopyOutlined />} onClick={cloneProfile}>Clone</Menu.Item>
      <Menu.Divider />
      <Menu.Item icon={<DeleteOutlined />} danger onClick={deleteProfile}>Delete</Menu.Item>
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

function ProfilesTable () {
  const [data, setData] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState(null)
  useEffect(async () => setData(await getProfilesAndProxies()), [])

  if (!data) return <Table loading />

  const { profiles, proxies } = data

  const NameRender = (title, item) => (
    <div>
      <span style={{ marginRight: '6px' }}>
        {item.fingerprint.os === 'win' ? <WindowsOutlined /> : <AppleOutlined />}
      </span>
      {title}
    </div>
  )

  const ProxyRedner = (proxyId) => (
    <TableProxyBlock proxy={selectById(proxies, proxyId)} />
  )

  const UpdatedRender = (time) => (
    <TimeAgo date={time} />
  )

  const NameColumn = {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => natSorter(a.name, b.name),
    render: NameRender,
  }

  const ProxyColumn = {
    title: 'Proxy',
    dataIndex: 'proxy',
    render: ProxyRedner,
  }

  const LastActiveColumn = {
    title: 'Last Active',
    dataIndex: 'updatedAt',
    sorter: (a, b) => natSorter(a.name, b.name),
    render: UpdatedRender,
  }

  const ActionColumn = {
    title: 'Action',
    width: 100,
    align: 'left',
    // render: (item) => <ActionRender profile={item} />,
    render: (profile) => ActionRender({ profile }),
  }

  const props = {
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
    title () { return <TableHeader /> },
  }

  return <Table {...props}></Table>
}

export default function ProxiesList () {
  return (
    <PageLayout>
      <ProfilesTable />
    </PageLayout>
  )
}
