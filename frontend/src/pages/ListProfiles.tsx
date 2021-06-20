import { ReloadOutlined, MoreOutlined, CaretRightOutlined, WindowsOutlined, AppleOutlined, EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { Table, Button, Space, Dropdown, Menu, Input, Divider } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useState } from 'react'

import backend from '@/backend'
import { withBaseLayout } from '@/components/layout'
import confirmDelete from '@/components/modals/confirmDelete'
import ProxyIcon from '@/components/ProxyIcon'
import TimeAgo from '@/components/TimeAgo'
import { useRouter, useGetData } from '@/hooks'
import native from '@/native-api'
import { Callback, iProfile, iProxy } from '@/types'

import { getSorter, filter } from './ListCommon'

const ProfileName = ({ profile }: { profile: iProfile }) => (
  <div>
    <span style={{ marginRight: '6px' }}>
      {profile.fingerprint.os === 'win' ? <WindowsOutlined /> : <AppleOutlined />}
    </span>
    {profile.name}
  </div>
)

const LastActive = ({ profile }: { profile: iProfile }) => (
  <TimeAgo date={profile.updatedAt} />
)

const ProfileProxy = ({ profile, proxies }: { profile: iProfile, proxies: iProxy[] }) => {
  const proxy = proxies.find(x => x._id === profile.proxy)

  const name = proxy?.name ?? 'None'
  const addr = proxy ? `${proxy.host}:${proxy.port}` : 'Direct Conection'
  const flag = <ProxyIcon proxy={proxy} />

  // todo: do not forget change color of text when change theme
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ fontSize: '18px', paddingLeft: '8px' }}>{flag}</div>
      <div style={{ paddingLeft: '8px' }}>
        <div>{name}</div>
        <div style={{ fontSize: '10px', color: '#8c8c8c' }}>{addr}</div>
      </div>
    </div>
  )
}

type TableHeaderProps = { selected: iProfile[], reload: Callback }
const TableHeader = ({ selected, reload }: TableHeaderProps) => {
  const router = useRouter()
  const remove = () => {
    const names = selected.map(x => x.name)
    confirmDelete(names, async () => {
      await backend.profiles.delete(selected.map(x => x._id))
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
        <Button type="primary" onClick={() => router.replace('/profiles/add')}>Create Profile</Button>
        <Button type="default" onClick={reload} icon={<ReloadOutlined />} />
      </Space>
    </Space>
  )
}

const StartButton = () => {
  // const onStart = () => native.init()
  const [loading, setLoading] = useState(false)
  const onStart = () => setLoading(true)

  return (
    <Button type="primary" icon={<CaretRightOutlined />} onClick={onStart} loading={loading}>
      {loading ? 'Loading' : 'Run'}
    </Button>
  )
}

const ItemActions = ({ profile, reload }: { profile: iProfile, reload: () => void }) => {
  const profileId = profile._id
  const router = useRouter()
  const names = [profile].map(x => x.name)

  const onEdit = () => router.replace(`/profiles/edit/${profileId}`)
  const onClone = () => console.log(`clone profile: ${profileId}`)
  const onDelete = () => confirmDelete(names, async () => {
    await backend.profiles.delete([profileId])
    reload()
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
      <StartButton />
      <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  )
}

const loadStateData = async () => {
  const [profiles, proxies] = await Promise.all([
    await backend.profiles.list(),
    await backend.proxies.list(),
  ])
  return { profiles, proxies }
}

const ListProfiles = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [data, loading, reload] = useGetData(async () => {
    const data = await loadStateData()
    setSelectedRowKeys(filter(data.profiles, selectedRowKeys).map(x => x._id))
    return data
  })

  const profiles = data?.profiles
  const proxies = data?.proxies

  const columns: ColumnsType<iProfile> = [
    {
      title: 'Name',
      sorter: getSorter('name'),
      render (profile) { return <ProfileName profile={profile} /> },
    },
    {
      title: 'Last Active',
      sorter: getSorter('updatedAt', true),
      defaultSortOrder: 'ascend',
      render (profile) { return <LastActive profile={profile} /> },
    },
    {
      title: 'Proxy',
      render (profile) { return <ProfileProxy profile={profile} proxies={proxies as iProxy[]} /> },
    },
    {
      title: 'Action',
      render (profile) { return <ItemActions profile={profile} reload={reload} /> },
      width: 100,
    },
  ]

  return (
    <Table
      rowKey="_id"
      rowSelection={{
        selectedRowKeys,
        onChange: s => setSelectedRowKeys(filter(profiles, s.map(x => x.toString())).map(x => x._id)),
      }}
      dataSource={profiles}
      columns={columns}
      pagination={{ defaultPageSize: 25, size: 'default' }}
      size="small"
      showSorterTooltip={false}
      title={() => <TableHeader reload={reload} selected={filter(profiles, selectedRowKeys)} />}
      loading={loading}
    ></Table>
  )
}

export default withBaseLayout(ListProfiles)
