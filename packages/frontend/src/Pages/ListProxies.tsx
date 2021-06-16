import { ReloadOutlined, DeleteOutlined, EditOutlined, MoreOutlined, CopyOutlined } from '@ant-design/icons'
import { Table, Space, Button, Input, Dropdown, Menu, Typography, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useState } from 'react'

import backend from '@/backend'
import { withBaseLayout } from '@/components/layout'
import confirmDelete from '@/components/modals/confirmDelete'
import ProxyIcon from '@/components/ProxyIcon'
import { useRouter, useGetData } from '@/hooks'
import { iProxy, Callback } from '@/types'

function ProxyProtocol ({ proxy }: { proxy: iProxy }) {
  return (
    <Tag>{proxy.type}</Tag>
  )
}

function ProxyAddress ({ proxy }: { proxy: iProxy }) {
  return (<Typography.Text code>{proxy.host}:{proxy.port}</Typography.Text>)
}

function TableHeader ({ reload }: { reload: Callback }) {
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

function ItemActions ({ proxy, reload }: { proxy: iProxy, reload: Callback }) {
  const router = useRouter()
  const proxyId = proxy._id
  const names = [proxy].map(x => x.name)

  const onEdit = () => router.replace(`/proxies/edit/${proxyId}`)
  const onDelete = () => confirmDelete(names, async function () {
    await backend.proxies.delete([proxyId])
    reload()
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
      <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  )
}

function ListProxies () {
  const [data, loading, reload] = useGetData(backend.proxies.list)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const columns: ColumnsType<iProxy> = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Type',
      render (proxy) { return <ProxyProtocol proxy={proxy} /> },
    },
    {
      title: 'Address',
      render (proxy) { return <ProxyAddress proxy={proxy} /> },
    },
    {
      title: 'Country',
      align: 'center',
      render (proxy) { return <ProxyIcon proxy={proxy} /> },
    },
    {
      title: 'Action',
      width: 100,
      render (proxy) { return <ItemActions proxy={proxy} reload={reload} /> },
    },
  ]

  return (
    <Table
      rowKey="_id"
      rowSelection={{ selectedRowKeys, onChange: keys => setSelectedRowKeys(keys.map(x => x.toString())) }}
      dataSource={data}
      columns={columns}
      pagination={{ defaultPageSize: 25, size: 'default' }}
      size="small"
      showSorterTooltip={false}
      title={() => <TableHeader reload={reload} />}
      loading={loading}
    ></Table>
  )
}

export default withBaseLayout(ListProxies)
