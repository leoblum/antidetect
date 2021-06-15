import { ReloadOutlined, MoreOutlined, CaretRightOutlined, WindowsOutlined, AppleOutlined, EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { Table, Button, Space, Dropdown, Menu, Input } from 'antd'
import { ColumnsType } from 'antd/es/table'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import natsort from 'natsort'
import React, { useState } from 'react'

import backend from '@/backend'
import { withBaseLayout } from '@/components/layout'
import confirmDelete from '@/components/modals/confirmDelete'
import TimeAgo from '@/components/TimeAgo'
import { useRouter, useGetData } from '@/hooks'
import { Callback, iProfile, iProxy } from '@/types'

function byKey (key: string, desc = false) {
  const sorter = natsort({ desc })
  return (a: any, b: any) => sorter(a[key], b[key])
}

function ProfileName ({ profile }: { profile: iProfile }) {
  return (
    <div>
      <span style={{ marginRight: '6px' }}>
        {profile.fingerprint.os === 'win' ? <WindowsOutlined /> : <AppleOutlined />}
      </span>
      {profile.name}
    </div>
  )
}

function LastActive ({ profile }: { profile: iProfile }) {
  return (<TimeAgo date={profile.updatedAt} />)
}

function ProfileProxy ({ profile, proxies }: { profile: iProfile, proxies: iProxy[] }) {
  const proxy = proxies.find(x => x._id === profile.proxy)

  const name = (proxy != null) ? proxy.name : 'None'
  const addr = (proxy != null) ? `${proxy.host}:${proxy.port}` : 'Direct Conection'
  const flag = (proxy != null) ? (proxy.country !== null ? getUnicodeFlagIcon(proxy.country) : '🌍') : '🚫'

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

function TableHeader ({ reload }: { reload: Callback }) {
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

function ItemActions ({ profile, reload }: { profile: iProfile, reload: () => void }) {
  const profileId = profile._id
  const router = useRouter()
  const names = [profile].map(x => x.name)

  const onEdit = () => router.replace(`/profiles/edit/${profileId}`)
  const onClone = () => console.log(`clone profile: ${profileId}`)
  const onDelete = () => confirmDelete(names, async function () {
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
      <Button type="primary" icon={<CaretRightOutlined />}>Run</Button>
      <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  )
}

interface StateData { profiles: iProfile[], proxies: iProxy[] }

async function loadStateData (): Promise<StateData> {
  const profiles = await backend.profiles.list()
  const proxies = await backend.proxies.list()
  return { profiles, proxies }
}

function ListProfiles () {
  const [data, loading, reload] = useGetData(loadStateData)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const profiles = data?.profiles
  const proxies = data?.proxies

  const columns: ColumnsType<iProfile> = [
    {
      title: 'Name',
      sorter: byKey('name'),
      render (profile) { return <ProfileName profile={profile} /> },
    },
    {
      title: 'Last Active',
      sorter: byKey('updatedAt', true),
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
      rowSelection={{ selectedRowKeys, onChange: keys => setSelectedRowKeys(keys.map(x => x.toString())) }}
      dataSource={profiles}
      columns={columns}
      pagination={{ defaultPageSize: 25, size: 'default' }}
      size="small"
      showSorterTooltip={false}
      title={() => <TableHeader reload={reload} />}
      loading={loading}
      ></Table>
  )
}

export default withBaseLayout(ListProfiles)
