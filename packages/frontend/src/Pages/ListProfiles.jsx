import { ReloadOutlined, MoreOutlined, CaretRightOutlined, WindowsOutlined, AppleOutlined, EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { Table, Button, Space, Dropdown, Menu, Input, Modal } from 'antd'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import natsort from 'natsort'
import React, { useState } from 'react'

import backend from 'Backend'
import Layout from 'Components/Layout'
import TimeAgo from 'Components/TimeAgo'
import { useRouter, useGetData } from 'Hooks'

function byKey (key, desc = false) {
  const sorter = natsort({ desc })
  return (a, b) => sorter(a[key], b[key])
}

export function StyleForEach ({ children, style }) {
  return (
    <>{React.Children.map(children, child => React.cloneElement(child, { style: { ...style, ...child.props.style } }))}</>
  )
}

function wrap (Component, props) {
  return function ColumnRender (item) {
    return <Component item={item} {...props} />
  }
}

function selectById (items, id, key = '_id') {
  for (const item of items) {
    if (item[key] === id) return item
  }
  return null
}

function TableHeader ({ reload }) {
  const router = useRouter()

  return (
    <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Space>
        <Input.Search placeholder="Enter Name" onSearch={() => null} style={{ width: 200 }} />
      </Space>
      <Space>
        <Button type="primary" onClick={() => router.replace('/profiles/add')}>Create Profile</Button>
        <Button type="default" onClick={reload} icon={<ReloadOutlined />} />
      </Space>
    </Space>
  )
}

function ActionItem ({ item, reload }) {
  const profileId = item._id
  const router = useRouter()

  const onEdit = () => router.replace(`/profiles/edit/${profileId}`)
  const onClone = () => console.log(`clone profile: ${profileId}`)
  const onDelete = () => Modal.confirm({
    content: 'Are you sure delete profile?',
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk: async function () {
      await backend.profiles.delete(profileId)
      reload()
    },
  })

  const menu = (
    <Menu style={{ minWidth: '100px' }}>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={onEdit}>Edit</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="clone" icon={<CopyOutlined />} onClick={onClone}>Clone</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={onDelete}>Delete</Menu.Item>
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

function NameItem ({ item }) {
  return (
    <div>
      <span style={{ marginRight: '6px' }}>
        {item.fingerprint.os === 'win' ? <WindowsOutlined /> : <AppleOutlined />}
      </span>
      {item.name}
    </div>
  )
}

function LastActiveItem ({ item }) {
  return (<TimeAgo date={item.updatedAt} />)
}

function ProxyItem ({ item, proxies }) {
  const proxy = selectById(proxies, item.proxy)

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

export default function ListProfiles () {
  const [selectedRowKeys, setSelectedRowKeys] = useState(null)
  const [data, loading, reload] = useGetData(async () => {
    const profiles = (await backend.profiles.all()).profiles
    const proxies = (await backend.proxies.all()).proxies
    return { profiles, proxies }
  })

  const { profiles = [], proxies = [] } = data || {}
  const columns = [
    { title: 'Name', render: wrap(NameItem), sorter: byKey('name') },
    { title: 'Last Active', render: wrap(LastActiveItem), sorter: byKey('updatedAt', true), defaultSortOrder: 'ascend' },
    { title: 'Proxy', render: wrap(ProxyItem, { proxies }) },
    { title: 'Action', render: wrap(ActionItem, { reload }), width: 100 },
  ]

  const props = {
    rowKey: '_id',
    rowSelection: { selectedRowKeys, onChange: setSelectedRowKeys },
    dataSource: profiles,
    columns: columns,
    pagination: { defaultPageSize: 25, size: 'default' },
    size: 'small',
    showSorterTooltip: false,
    title () { return <TableHeader reload={reload} /> },
    loading,
  }

  return (
    <Layout>
      <Table {...props} />
    </Layout>
  )
}
