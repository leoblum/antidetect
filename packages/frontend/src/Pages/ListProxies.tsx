import { ReloadOutlined, DeleteOutlined, EditOutlined, MoreOutlined, CopyOutlined } from '@ant-design/icons'
import { Table, Space, Button, Input, Dropdown, Menu, Typography, Tag, Divider } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useState } from 'react'

import backend from '@/backend'
import { withBaseLayout } from '@/components/layout'
import confirmDelete from '@/components/modals/confirmDelete'
import ProxyIcon from '@/components/ProxyIcon'
import { useRouter, useGetData } from '@/hooks'
import { iProxy, Callback } from '@/types'

import { getSorter, filter } from './ListCommon'

const ProxyProtocol = ({ proxy }: { proxy: iProxy }) => (
  <Tag>{proxy.type}</Tag>
)

const ProxyAddress = ({ proxy }: { proxy: iProxy }) => (
  <Typography.Text code>{proxy.host}:{proxy.port}</Typography.Text>
)

type TableHeaderProps = { selected: iProxy[], reload: Callback }
const TableHeader = ({ selected, reload }: TableHeaderProps) => {
  const router = useRouter()
  const remove = () => {
    const names = selected.map(x => x.name)
    confirmDelete(names, async () => {
      await backend.proxies.delete(selected.map(x => x._id))
      reload()
    })
  }

  const menu = (
    <Menu style={{ minWidth: '100px' }}>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={remove}>Delete</Menu.Item>
    </Menu>
  )

  return (
    <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Space>
        <Input.Search placeholder="Enter Name" onSearch={() => null} style={{ width: 200 }} />
      </Space>
      <Space>
        {selected.length > 0 && (
          <div>
            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
              <Button type="default">Bulk Actions</Button>
            </Dropdown>
            <Divider type="vertical" style={{ fontSize: '24px', top: 0, marginLeft: '16px' }} />
          </div>
        )}
        <Button type="primary" onClick={() => router.replace('/proxies/add')}>Create Proxy</Button>
        <Button type="default" onClick={reload} icon={<ReloadOutlined />} />
      </Space>
    </Space>
  )
}

const ItemActions = ({ proxy, reload }: { proxy: iProxy, reload: Callback }) => {
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

const ListProxies = () => {
  const [proxies, loading, reload] = useGetData(backend.proxies.list)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const columns: ColumnsType<iProxy> = [
    {
      title: 'Name',
      sorter: getSorter('name'),
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
      rowSelection={{
        selectedRowKeys,
        onChange: s => setSelectedRowKeys(filter(proxies, s.map(x => x.toString())).map(x => x._id)),
      }}
      dataSource={proxies}
      columns={columns}
      pagination={{ defaultPageSize: 25, size: 'default' }}
      size="small"
      showSorterTooltip={false}
      title={() => <TableHeader reload={reload} selected={filter(proxies, selectedRowKeys)} />}
      loading={loading}
    ></Table>
  )
}

export default withBaseLayout(ListProxies)
