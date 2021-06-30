import {
  ReloadOutlined, MoreOutlined, WindowsOutlined, AppleOutlined,
  EditOutlined, CopyOutlined, DeleteOutlined,
  PoweroffOutlined, CaretRightOutlined,
} from '@ant-design/icons'
import { Table, Button, Space, Dropdown, Menu, Input, Divider } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React, { useEffect, useState } from 'react'
import create from 'zustand'

import backend from '@/backend'
import { getSorter, filter } from '@/common/sorter'
import { confirmDelete } from '@/components/ConfirmDeleteModal'
import { notifyByApiCode } from '@/components/Notify'
import ProxyIcon from '@/components/proxies/ProxyIcon'
import { withBaseLayout } from '@/components/root'
import TimeAgo from '@/components/TimeAgo'
import { useRouter } from '@/hooks'
import native from '@/native-api'
import { Profile, Proxy } from '@/types'

type Store = { loading: boolean, profiles: Profile[], proxies: Proxy[], fetch(): Promise<void> }
const useStore = create<Store>(set => ({
  loading: false,
  profiles: [],
  proxies: [],

  fetch: async () => {
    set({ loading: true })
    const [profiles, proxies] = await Promise.all([
      await backend.profiles.list(),
      await backend.proxies.list(),
    ])
    set({ profiles, proxies, loading: false })
  },
}))

const RunButton = ({ profile }: { profile: Profile }) => {
  const [loading, setLoading] = useState(false)
  const { fetch: reload } = useStore()

  const onClick = async () => {
    setLoading(true)

    if (profile.activeStatus) {
      const rep = await backend.profiles.unlock(profile._id)
      if (!rep.success) return notifyByApiCode(rep)
    } else {
      const rep = await backend.profiles.lock(profile._id)
      if (!rep.success) return notifyByApiCode(rep)
    }

    setLoading(false)
    await reload()
  }

  return (
    <Button
      type="primary" onClick={onClick} loading={loading}
      icon={profile.activeStatus ? <PoweroffOutlined /> : <CaretRightOutlined />}
      danger={profile.activeStatus}
      style={{ width: '100px' }}
    >{profile.activeStatus ? 'Stop' : 'Run'}</Button>
  )
}

const ProfileName = ({ profile }: { profile: Profile }) => (
  <div>
    <span style={{ marginRight: '6px' }}>
      {profile.fingerprint.os === 'win' ? <WindowsOutlined /> : <AppleOutlined />}
    </span>
    {profile.name}
  </div>
)

const LastActive = ({ profile }: { profile: Profile }) => (
  <TimeAgo date={profile.updatedAt} />
)

const ProfileProxy = ({ profile, proxies }: { profile: Profile, proxies: Proxy[] }) => {
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

const TableHeader = ({ selected }: { selected: Profile[] }) => {
  const store = useStore()
  const reload = () => store.fetch()

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

const ItemActions = ({ profile }: { profile: Profile }) => {
  const store = useStore()
  const reload = () => store.fetch()

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
      <RunButton profile={profile} />
      <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  )
}

const ListProfiles = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const { profiles, proxies, loading, fetch } = useStore()

  useEffect(() => { fetch() }, [])
  useEffect(() => { setSelectedRowKeys(filter(profiles, selectedRowKeys).map(x => x._id)) }, [profiles])

  const columns: ColumnsType<Profile> = [
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
      render (profile) { return <ProfileProxy profile={profile} proxies={proxies as Proxy[]} /> },
    },
    {
      title: 'Action',
      render (profile) { return <ItemActions profile={profile} /> },
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
      title={() => <TableHeader selected={filter(profiles, selectedRowKeys)} />}
      loading={loading}
    ></Table>
  )
}

export default withBaseLayout(ListProfiles)
