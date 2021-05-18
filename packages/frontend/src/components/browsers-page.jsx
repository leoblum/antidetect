import React, {Component} from 'react'
import {Button, Col, Input, Layout, Row, Table} from 'antd'
import {ImportOutlined, PlusCircleOutlined, SearchOutlined} from '@ant-design/icons'
import Sort from 'natsort'

// import EnterForm from './components/EnterForm.jsx'

export function generateProfile (index = 0) {
  return {
    _id: index.toString() + index.toString(),
    name: index === 0 ? 'New Profile' : `New Profile ${index + 1}`,
    os: navigator.appVersion.includes('Mac') ? 'mac' : 'win',
    proxyType: 'none',
    proxySettings: null,
    timezoneFillFromIP: true,
    timezoneName: null,
    timezoneOffset: null,
    webrtcMode: 'altered',
    webrtcFillFromIP: true,
    webrtcPublicIP: '',
    geolocationMode: 'prompt',
    geolocationFillFromIP: true,
    geolocationLatitude: null,
    geolocationLongitude: null,
    navigatorUserAgent: navigator.userAgent,
    navigatorLanguages: navigator.languages,
    navigatorPlatform: 'MacIntel',
    navigatorHardwareConcurrency: 4,
    navigatorDeviceMemory: 8,
    doNotTrack: 'unset',
    fontsMasking: true,
    fontsList: ['Arial', 'Tahoma'],
    mediaDevicesMasking: true,
    mediaDevicesVideoInputs: 1,
    mediaDevicesAudioInputs: 1,
    mediaDevicesAudioOutputs: 1,
    mediaDevices: [],
    webglParametersMasking: true,
    webglVendor: 'Best Video Card',
    webglRendererName: 'Best Video Card XXX',
    webglRendererNoise: false,
    webglParams: {},
    webglParams2: {},
    canvasNoise: false,
    audioNoise: false,
  }
}

const profiles = Array.from(new Array(10)).map((_, idx) => generateProfile(idx))

const {Sider, Content, Header} = Layout
const {Search} = Input

const HeaderHeight = '52px'
const ContentPadding = '16px'
const sorter = Sort()

export default class App extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return <EnterForm></EnterForm>
    // return <AppAuth></AppAuth>
  }
}

class AppAuth extends Component {
  constructor (props) {
    super(props)

    this.state = {
      selectedRowKeys: [],
      dataSource: profiles,
      count: profiles.length,
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
        // render: item => this.settingsMenuIcon(item),
      }]
  }

  render () {
    const {selectedRowKeys, dataSource} = this.state
    const rowSelection = {
      selectedRowKeys,
      onChange: selectedRowKeys => this.setState({selectedRowKeys}),
    }

    const tableProps = {
      rowKey: '_id',
      rowSelection,
      dataSource,
      columns: this.columns,
      pagination: {
        defaultPageSize: 25,
        size: 'default',
      },
      size: 'small',
      showSorterTooltip: false,
    }

    return (
      <Layout style={{height: '100vh'}}>
        <Header style={{
          position: 'fixed', zIndex: 1, width: '100%',
          height: HeaderHeight, lineHeight: 'inherit', color: 'white',
          paddingLeft: ContentPadding, paddingRight: ContentPadding,
        }}>
          <Row align="middle" justify="center" style={{height: '100%'}}>
            <Col style={{marginRight: 8}}>
              <Button.Group>
                <Button icon={<ImportOutlined/>}>Import</Button>
                <Button icon={<PlusCircleOutlined/>}>Create New</Button>
              </Button.Group>
            </Col>
            <Col flex={2}><Input prefix={<SearchOutlined/>} allowClear={true}/></Col>
          </Row>
        </Header>
        <Content style={{marginTop: HeaderHeight, padding: ContentPadding, height: '100%'}}>
          <Table {...tableProps}></Table>
        </Content>
      </Layout>
    )
  }
}
