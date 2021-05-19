import React, {useEffect, useState} from 'react'
import {Layout, Table, Button, Space, Card} from 'antd'
import {CaretRightOutlined, ReloadOutlined} from '@ant-design/icons'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'

import backend from '../backend'
import {natSorter} from '../utils'
import TimeAgo from './time-ago'
import {Link} from './router'

function Box ({children, childStyle, ...props}) {
  const fn = child => {
    const props = {style: Object.assign({}, childStyle, child.props.style)}
    return React.cloneElement(child, props)
  }
  return (
    <div {...props}>
      {React.Children.map(children, fn)}
    </div>
  )
}

function BaseLayout ({children}) {
  const headerStyle = {
    height: '52px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    // flexDirection: 'row-reverse',
    padding: '0 12px',
  }

  const contentStyle = {
    padding: '12px',
    // marginTop: '2px',
    height: '100%',
  }

  return (
    <Layout style={{minHeight: '100vh'}}>
      <Layout.Header style={headerStyle}>
        <Space style={{textTransform: 'uppercase'}}>
          <div style={{fontSize: '32px', padding: '0 16px'}}>🔅</div>
          <Link to="/browsers">Browsers</Link>
          <Link to="/proxies">Proxies</Link>
          <Link to="/profiles">Old</Link>
        </Space>
        <Button onClick={() => backend.logout()}>Logout</Button>
      </Layout.Header>
      <Layout.Content style={contentStyle}>
        {children}
      </Layout.Content>
    </Layout>
  )
}

async function getBrowsersAndProxies () {
  let browsers = await backend.browsers()
  let proxies = await backend.proxies()

  if (!browsers.success || !proxies.success) {
    console.error('data not loaded', browsers, proxies)
    return null
  }

  browsers = browsers.browsers
  proxies = proxies.proxies
  return {browsers, proxies}
}

function selectById (items, id, key = '_id') {
  for (let item of items) {
    if (item[key] === id) return item
  }
  return null
}

function TableProxyBlock ({proxy}) {
  const name = proxy.name
  const addr = `${proxy.host}:${proxy.port}`
  const flag = getUnicodeFlagIcon(proxy.country)

  // todo: do not forget change color of text when change theme
  return (
    <Box style={{display: 'flex', alignItems: 'center'}} childStyle={{paddingLeft: '8px'}}>
      <div style={{fontSize: '18px'}}>{flag}</div>
      <div>
        <div>{name}</div>
        <div style={{fontSize: '10px', color: '#8c8c8c'}}>{addr}</div>
      </div>
    </Box>
  )
}

function TableHeader () {
  const style = {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: '8px',
    marginBottom: '8px',
  }

  return (
    <Space style={style}>
      <Button>Create Profile</Button>
      <Space>
        <Button type="primary">Create Profile</Button>
        <Button type="default" icon={<ReloadOutlined/>}/>
      </Space>
    </Space>
  )
}

function Proxies () {
  return (
    <BaseLayout>
      <div style={{fontSize: '32px', textAlign: 'center'}}>
        Привет, Оля! Я тебя люблю! ❤️
      </div>
    </BaseLayout>
  )
}

function Browsers () {
  const [data, setData] = useState(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  useEffect(async () => setData(await getBrowsersAndProxies()), [])

  if (!data) return (
    <BaseLayout>
      <Table loading/>
    </BaseLayout>
  )

  const {browsers, proxies} = data

  const NameColumn = {
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => natSorter(a.name, b.name),
  }

  const ProxyColumn = {
    title: 'Proxy',
    dataIndex: 'proxy',
    render: x => <TableProxyBlock proxy={selectById(proxies, x)}/>,
  }

  const LastActiveColumn = {
    title: 'Last Active',
    dataIndex: 'createdAt', // todo:
    render: x => <TimeAgo date={x}/>,
  }

  const ActionColumn = {
    title: 'Action',
    width: 100,
    align: 'center',
    render: () => <Button type="primary" icon={<CaretRightOutlined/>}>Run</Button>,
  }

  const tableProps = {
    rowKey: '_id',
    rowSelection: {
      selectedRowKeys: selectedRowKeys,
      onChange: data => setSelectedRowKeys(data),
    },
    dataSource: browsers,
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
      <TableHeader/>
      <Table {...tableProps}></Table>
    </BaseLayout>
  )
}

export {Browsers, Proxies}
