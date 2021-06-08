import { ReloadOutlined, DeleteOutlined, EditOutlined, MoreOutlined, CopyOutlined } from '@ant-design/icons'
import { Table, Space, Button, Input, Dropdown, Menu, Typography, Tag, Modal } from 'antd'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import React, { useState } from 'react'

import backend from '@/backend'
import Layout from '@/components/Layout'
import { useRouter, useGetData } from '@/hooks'

function getCountryFlag (proxy) {
  if (!proxy) return '🚫'
  if (proxy.country) try { return getUnicodeFlagIcon(proxy.country) } catch (e) {}
  return '🌍'
}

function wrap (Component, props) {
  return function ColumnRender (item) {
    return <Component item={item} {...props} />
  }
}

function CountryFlag ({ item, size = 18 }) {
  return (<div style={{ fontSize: `${size}px` }}>{getCountryFlag(item)}</div>)
}

function ProxyAddress ({ item }) {
  return (<Typography.Text code>{item.host}:{item.port}</Typography.Text>)
}

function ProxyType ({ item }) {
  return (<Tag>{item.type}</Tag>)
}

function TableHeader ({ reload }) {
  const router = useRouter()

  return (
    <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Space>
        <Input.Search placeholder="Enter Name" onSearch={() => null} style={{ width: 200 }} />
      </Space>
      <Space>
        <Button type="primary" onClick={() => router.replace('/proxies/add')}>Create Proxy</Button>
        <Button type="default" onClick={reload} icon={<ReloadOutlined />} />
      </Space>
    </Space>
  )
}

function reactJoin (items, itemRender, separatorRender) {
  return items.reduce((prev, item, idx) => {
    const isLast = idx === items.length - 1
    prev.push(<span key={idx}>{isLast ? itemRender(item) : <>{itemRender(item)}{separatorRender()}</>}</span>)
    return prev
  }, [])
}

function ConfirmMessage ({ items }) {
  const children = reactJoin(items, x => <u>{x.name}</u>, () => ', ')
  return (
    <div style={{ textAlign: 'left' }}>
      Are you sure to delete {children}?
    </div>
  )
}

function ItemActions ({ item, reload }) {
  const router = useRouter()
  const proxyId = item._id

  const onEdit = () => router.replace(`/proxies/edit/${proxyId}`)
  const onDelete = () => Modal.confirm({
    content: <ConfirmMessage items={[item]} />,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk: async function () {
      await backend.proxies.delete(proxyId)
      reload()
    },
  })

  const menu = (
    <Menu style={{ minWidth: '100px' }}>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={onEdit}>Edit</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="copy" icon={<CopyOutlined />}>Copy</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={onDelete} danger>Delete</Menu.Item>
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

export default function ListProxies () {
  const [data, loading, reload] = useGetData(async () => (await backend.proxies.list()).proxies)
  const [selectedRowKeys, setSelectedRowKeys] = useState(null)

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Type', render: wrap(ProxyType) },
    { title: 'Address', render: wrap(ProxyAddress) },
    { title: 'Country', render: wrap(CountryFlag), align: 'center' },
    { title: 'Action', render: wrap(ItemActions, { reload }), width: 100 },
  ]

  const props = {
    rowKey: '_id',
    rowSelection: { selectedRowKeys, onChange: setSelectedRowKeys },
    dataSource: data,
    columns,
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
