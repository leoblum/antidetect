import React, {Component} from 'react'
import {Button, Card, Dropdown, Menu, Table} from 'antd'
import {SettingOutlined} from '@ant-design/icons'
import {Link} from 'react-router-dom'
import natsort from 'natsort'
import AppLayout from './AppLayout'
import appModel from './AppModel'

const sorter = natsort()

class PageProfilesList extends Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedRowKeys: [],
      dataSource: appModel.profiles,
      count: appModel.profiles?.length,
    }

    this.columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: (a, b) => sorter(a.name, b.name),
      }, {
        title: 'Proxy',
        dataIndex: 'proxyType',
        // render: x => x.proxyType === 'none' ? 'none' : x.proxySettings.ip,
      }, {
        title: 'Last Launch',
        // dataIndex: 'lastLaunch',
        // sorter: (a, b) => sorter(a.lastLaunch, b.lastLaunch),
      }, {
        width: 100,
        align: 'right',
        render: () => <Button type="primary" onClick={console.log(12)}>Run</Button>,
      }, {
        align: 'left',
        width: 42,
        render: item => this.settingsMenuIcon(item),
      }]
  }

  settingsMenuIcon (item) {
    return (
      <Dropdown overlay={() => this.settingsMenu(item)} trigger={['click']}>
        <SettingOutlined style={{fontSize: 18, marginTop: 4, cursor: 'pointer'}}/>
      </Dropdown>
    )
  }

  settingsMenu (item) {
    let profileId = item._id

    return (
      <Menu>
        <Menu.Item><Link to={`/profiles/${profileId}`}>Edit</Link></Menu.Item>
        <Menu.Item onClick={() => this.cloneProfile(profileId)}>Clone</Menu.Item>
        {/*<Menu.Item>Share</Menu.Item>*/}
        <Menu.Divider/>
        <Menu.Item onClick={() => this.deleteProfile(profileId)}>Delete</Menu.Item>
      </Menu>
    )
  }

  deleteProfile (profileId) {
    appModel.deleteProfile(profileId)
    this.setState({dataSource: appModel.profiles})
  }

  cloneProfile (profileId) {
    appModel.cloneProfile(profileId)
    this.setState({dataSource: appModel.profiles})
  }

  render () {
    let {selectedRowKeys, dataSource} = this.state
    let rowSelection = {
      selectedRowKeys,
      onChange: selectedRowKeys => this.setState({selectedRowKeys}),
    }

    let tableProps = {
      rowKey: '_id',
      rowSelection,
      dataSource,
      columns: this.columns,
      pagination: {
        defaultPageSize: 25,
        size: 'default'
      }
    }

    return (
      <AppLayout>
        <AppLayout.Head>
          <h1 style={{fontSize: 24}}>Profiles List</h1>
        </AppLayout.Head>
        <AppLayout.Body>
          <Card bodyStyle={{padding: 0}}>
            <Table {...tableProps}/>
          </Card>
        </AppLayout.Body>
      </AppLayout>
    )
  }
}

export default PageProfilesList
