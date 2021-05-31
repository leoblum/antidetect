import { ReloadOutlined, DeleteOutlined, EditOutlined, MoreOutlined, CopyOutlined } from '@ant-design/icons'
import { Table, Space, Button, Input, Dropdown, Menu, Typography, Tag } from 'antd'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React, { useState, useEffect } from 'react'

import backend from '../backend'
import useRouter from '../useRouter'

import PageLayout from './layout'

function getCountryFlag (proxy) {
  if (!proxy) return '🚫'
  if (proxy.country) try { return getUnicodeFlagIcon(proxy.country) } catch (e) {}
  return '🌍'
}

function wrap (Component) {
  return function ColumnRender (item) {
    return <Component item={item} />
  }
}

function CountryFlag ({ item, size = 18 }) {
  return (<div style={{ fontSize: `${size}px` }}>{getCountryFlag(item)}</div>)
}

function ProxyAddress ({ item }) {
  return (<Typography.Text code>{item.host}:{item.port}</Typography.Text>)
}

function ProxyType ({ item }) {
  return (
    <Tag>{item.type}</Tag>
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
        <Button type="primary" onClick={() => router.replace('/proxies/add')}>Create Proxy</Button>
        <Button type="default" onClick={() => router.replace('/')} icon={<ReloadOutlined />} />
      </Space>
    </Space>
  )
}

function ItemActions ({ item }) {
  const router = useRouter()
  const proxyId = item._id

  const onEdit = () => router.replace(`/proxies/edit/${proxyId}`)
  const onDelete = () => null

  const menu = (
    <Menu style={{ minWidth: '100px' }}>
      <Menu.Item icon={<EditOutlined />} onClick={onEdit}>Edit</Menu.Item>
      <Menu.Divider />
      <Menu.Item icon={<CopyOutlined />}>Copy</Menu.Item>
      <Menu.Divider />
      <Menu.Item icon={<DeleteOutlined />} onClick={onDelete} danger>Delete</Menu.Item>
    </Menu>
  )

  return (
    <Space>
      <Button type="primary" icon={<ReloadOutlined />} />
      <Dropdown overlay={menu} trigger="click" placement="bottomRight">
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  )
}

function ProxiesTable () {
  const [data, setData] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState(null)
  useEffect(async () => setData((await backend.proxies.list()).proxies), [])

  if (!data) return <Table loading />

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Type', render: wrap(ProxyType) },
    { title: 'Address', render: wrap(ProxyAddress) },
    { title: 'Country', render: wrap(CountryFlag), align: 'center' },
    { title: 'Action', render: wrap(ItemActions) },
  ]

  const props = {
    rowKey: '_id',
    rowSelection: { selectedRowKeys, onChange: setSelectedRowKeys },
    dataSource: data,
    columns,
    pagination: { defaultPageSize: 25, size: 'default' },
    size: 'small',
    showSorterTooltip: false,
    title () { return <TableHeader /> },
  }

  return <Table {...props} />
}

export default function ProxiesList () {
  return (
    <PageLayout>
      <ProxiesTable />
    </PageLayout>
  )
}
