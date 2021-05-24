import React, {useEffect, useState} from 'react'
import {Table, Button, Space, Form, Input, Dropdown, Menu} from 'antd'
import {ReloadOutlined, MoreOutlined, CaretRightOutlined} from '@ant-design/icons'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'

import backend from '../backend'
import {natSorter} from '../utils'
import TimeAgo from './time-ago'
import {useRouter, Link} from './router'
import {BaseLayout, StyleForEach} from './base-layout'

import {AddProfile} from './page-profiles-add'

export {AddProfile}

async function getProfilesAndProxies () {
  let profiles = await backend.profiles()
  let proxies = await backend.proxies()

  if (!profiles.success || !proxies.success) {
    console.error('data not loaded', profiles, proxies)
    return null
  }

  profiles = profiles.profiles
  proxies = proxies.proxies
  return {profiles, proxies}
}

function selectById (items, id, key = '_id') {
  for (let item of items) {
    if (item[key] === id) return item
  }
  return null
}

function TableProxyBlock ({proxy}) {
  const name = proxy ? proxy.name : 'None'
  const addr = proxy ? `${proxy.host}:${proxy.port}` : 'Direct Conection'
  const flag = proxy ? (proxy.country !== null ? getUnicodeFlagIcon(proxy.country) : '🌍') : '🚫'

  // todo: do not forget change color of text when change theme
  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      <StyleForEach style={{paddingLeft: '8px'}}>
        <div style={{fontSize: '18px'}}>{flag}</div>
        <div>
          <div>{name}</div>
          <div style={{fontSize: '10px', color: '#8c8c8c'}}>{addr}</div>
        </div>
      </StyleForEach>
    </div>
  )
}

function Block ({children, style}) {
  return (
    <div className={'app-content-block'} style={{style}}>{children}</div>
  )
}

function TableHeader () {
  const router = useRouter()
  return (
    <Block>
      <Button>Create Profile</Button>
      <Space>
        <Button type="primary" onClick={() => router.replace('/profiles/add')}>Create Profile</Button>
        <Button type="default" icon={<ReloadOutlined />} />
      </Space>
    </Block>
  )
}

function Proxies () {
  const [data, setData] = useState({number: 100})
  const [form] = Form.useForm()

  function onClick () {
    const number = ~~(Math.random() * 1000)
    setData({number})
    // form.resetFields()
    form.setFieldsValue({number})
  }

  return (
    <BaseLayout>
      <div style={{fontSize: '32px', textAlign: 'center'}}>
        Привет, Оля! Я тебя люблю! ❤️
        <br />
        <Button onClick={onClick}>{data.number}</Button>

        <Form initialValues={data} form={form} style={{width: '500px'}}>
          <Form.Item name="number" shouldUpdate>
            <Input.TextArea rows="2" style={{resize: 'none'}} />
          </Form.Item>
        </Form>
      </div>
    </BaseLayout>
  )
}

function ActionRender ({profile}) {
  return (
    <Space>
      <Button type="primary" icon={<CaretRightOutlined />}>Run</Button>
      <Dropdown overlay={() => <MenuRenderer profile={profile}/>} trigger="click" placement="bottomRight">
        <Button icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  )
}

function MenuRenderer ({profile}) {
  console.log(profile)
  const profileId = profile._id
  const router = useRouter()

  return (
    <Menu>
      <Menu.Item onClick={() => router.replace(`/profiles/edit/${profileId}`) }>Edit</Menu.Item>
      <Menu.Item>Clone</Menu.Item>
      <Menu.Item>Delete</Menu.Item>
      {/* <Menu.Divider /> */}
    </Menu>
  )
}

function Profiles () {
  const [data, setData] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState(null)
  useEffect(async () => setData(await getProfilesAndProxies()), [])

  if (!data) return (
    <BaseLayout>
      <Table loading />
    </BaseLayout>
  )

  const {profiles, proxies} = data

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
    render: (item) => <ActionRender profile={item} />,
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
    <BaseLayout>
      <TableHeader />
      <Table {...tableProps}></Table>
    </BaseLayout>
  )
}

export {Profiles, Proxies}
