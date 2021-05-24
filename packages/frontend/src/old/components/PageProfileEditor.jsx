import React, {Component} from 'react'
import {Button, Card, Col, Form, Input, InputNumber, Radio, Row, Select, Space, Switch, Tabs} from 'antd'
import {withRouter} from 'react-router-dom'
import AppLayout from './AppLayout'
import If from './If'
import {getTimezoneByName, Timezones} from '../utils'
import UserAgentParser from 'ua-parser-js'
import {CheckOutlined, CloseOutlined} from '@ant-design/icons'
import appModel from './AppModel'

const ButtonStyle = {width: 100, textAlign: 'center', flex: 1}
const padding = 8

const possibleC = [2, 4, 8, 12, 16, 24, 32]
const possibleM = [4, 6, 8, 12, 16, 24, 32]

class ProfileSummary extends Component {
  render () {
    let state = this.props.data
    let ua = UserAgentParser(state.navigatorUserAgent)
    let detectText = 'Autodetect'
    let manualText = 'Manual'
    let maskText = 'Mask'
    let realText = 'Real'
    let noiseText = 'Noise'

    let overview = [
      {name: 'Name', value: state.name},
      {name: 'OS', value: `${ua.os.name} ${ua.os.version}`},
      {name: 'Browser', value: `${ua.browser.name} ${ua.browser.major}`},
      {name: 'Languages', value: state.navigatorLanguages.join(',')},
      {name: 'Timezone', value: state.timezoneFillFromIP ? detectText : state.timeZoneName},
      {name: 'WebRTC', value: state.webrtcFillFromIP ? detectText : manualText},
      {name: 'Geolocation', value: state.geolocationFillFromIP ? detectText : manualText},
      {name: 'WebGL Data', value: state.webglParametersMasking ? maskText : realText},
      {name: 'WebGL', value: state.webglRendererNoise ? noiseText : realText},
      {name: 'Canvas', value: state.canvasNoise ? noiseText : realText},
      {name: 'Audio', value: state.audioNoise ? noiseText : realText},
      {name: 'Fonts', value: state.fontsList.length.toString()},
    ]

    return (
      <Row style={{alignContent: 'space-between', height: '100%'}}>
        <Col style={{width: '100%'}}>
          {overview.map((x, i) => (
            <Row key={i}>
              <Col flex="2">{x.name}</Col>
              <Col flex="3">{x.value}</Col>
            </Row>
          ))}
        </Col>
        {/*<Col style={{width: '100%'}}>*/}
        {/*  <Row justify="space-around">*/}
        {/*    <Col><Button size="large" style={ButtonStyle}>Cancel</Button></Col>*/}
        {/*    <Col><Button size="large" style={ButtonStyle} type="primary">Save</Button></Col>*/}
        {/*  </Row>*/}
        {/*</Col>*/}
      </Row>
    )
  }
}

class ProfileForm extends Component {
  render () {
    let state = this.props.data
    let onValueChange = this.props.onValuesChange

    let operations = <Button>New Fingerprint</Button>

    let tabsProps = {
      size: 'small',
      type: 'card',
    }

    if (this.props.isNew) Object.assign(tabsProps, {tabBarExtraContent: operations})

    console.log(state)

    return (
      <Form layout="vertical" initialValues={state} onValuesChange={onValueChange}>
        <Tabs {...tabsProps}>

          <Tabs.TabPane tab="General" key="1">
            <Row>
              <Col flex="1" style={{paddingRight: padding}}>
                <Form.Item label="Profile Name" name="name">
                  <Input />
                </Form.Item>

                <Form.Item label="Operation System" name="os">
                  <Radio.Group>
                    <Radio.Button value="win" style={ButtonStyle}>Windows</Radio.Button>
                    <Radio.Button value="mac" style={ButtonStyle}>MacOS</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col flex="1" style={{paddingLeft: padding}}>
                <Form.Item label="Proxy Type" name="proxyType">
                  <Select>
                    <Select.Option value="none">No Proxy</Select.Option>
                    <Select.Option value="http">HTTP(s)</Select.Option>
                    <Select.Option value="socks5">SOCKS5</Select.Option>
                  </Select>
                </Form.Item>

                <If condition={state.proxyType !== 'none'}>
                  <Form.Item label="Proxy Address and Port">
                    <Input.Group compact>
                      <Input style={{width: '75%'}} placeholder="Address" />
                      <Input style={{width: '25%'}} placeholder="Port" />
                    </Input.Group>
                  </Form.Item>

                  <Form.Item label="Login">
                    <Input placeholder="Login" />
                  </Form.Item>

                  <Form.Item label="Password">
                    <Input placeholder="Password" />
                  </Form.Item>
                </If>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Location" key="2">
            <Row>
              <Col flex="1" style={{paddingRight: padding}}>
                <Form.Item label="Geolocation" name="geolocationMode">
                  <Radio.Group>
                    <Radio.Button value="prompt" style={ButtonStyle}>Prompt</Radio.Button>
                    <Radio.Button value="allow" style={ButtonStyle}>Allow</Radio.Button>
                    <Radio.Button value="block" style={ButtonStyle}>Block</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <If condition={state.geolocationMode !== 'block'}>
                  <Space style={{marginBottom: 24}}>
                    <Form.Item name="geolocationFillFromIP" valuePropName="checked" noStyle>
                      <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                    </Form.Item>
                    Fill geolocation based on Public IP
                  </Space>

                  <If condition={!state.geolocationFillFromIP}>
                    <Form.Item label="Latitude" name="geolocationLatitude">
                      <Input />
                    </Form.Item>

                    <Form.Item label="Longitude" name="geolocationLongitude">
                      <Input />
                    </Form.Item>
                  </If>
                </If>
              </Col>
              <Col flex="1" style={{paddingLeft: padding}}>
                <Form.Item label="Timezone">
                  <Space style={{marginTop: 3, marginBottom: 24}}>
                    <Form.Item name="timezoneFillFromIP" valuePropName="checked" noStyle>
                      <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                    </Form.Item>
                    Fill timezone based on Public IP
                  </Space>

                  <If condition={!state.timezoneFillFromIP}>
                    <Form.Item name="timezoneName">
                      <Select showSearch placeholder="Select timezone">
                        {Timezones.map((x, idx) => (
                          <Select.Option key={idx} value={x.timezone}>{x.title}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </If>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="WebRTC" key="3">
            <Row>
              <Col flex="1" style={{paddingRight: padding}}>
                <Form.Item label="WebRTC" name="webrtcMode">
                  <Radio.Group>
                    <Radio.Button value="altered" style={ButtonStyle}>Altered</Radio.Button>
                    <Radio.Button value="disabled" style={ButtonStyle}>Disabled</Radio.Button>
                    <Radio.Button value="real" style={ButtonStyle}>Real</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <If condition={state.webrtcMode === 'altered'}>

                  <Space style={{marginBottom: 24}}>
                    <Form.Item name="webrtcFillFromIP" valuePropName="checked" noStyle>
                      <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                    </Form.Item>
                    Fill WebRTC based on Public IP
                  </Space>

                  <If condition={!state.webrtcFillFromIP}>
                    <Form.Item label="IP Address" name="webrtcPublicIP">
                      <Input />
                    </Form.Item>
                  </If>
                </If>
              </Col>
              <Col flex="1" style={{paddingLeft: padding}}></Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Navigator" key="4">
            <Row>
              <Col flex="1" style={{paddingRight: padding}}>
                <Form.Item label="User Agent" name="navigatorUserAgent">
                  <Input.TextArea rows="4" style={{resize: 'none'}} />
                </Form.Item>

                <Form.Item label="Platform" name="navigatorPlatform">
                  <Input />
                </Form.Item>

                <Form.Item label="Hardware Concurrency" name="navigatorHardwareConcurrency">
                  <Select style={{width: 200}}>
                    {possibleC.map((x, idx) => (
                      <Select.Option key={idx} value={x}>{x}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Device Memory" name="navigatorDeviceMemory">
                  <Select style={{width: 200}}>
                    {possibleM.map((x, idx) => (
                      <Select.Option key={idx} value={x}>{x}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Do Not Track" name="doNotTrack">
                  <Radio.Group>
                    <Radio.Button value="unset" style={ButtonStyle}>Unset</Radio.Button>
                    <Radio.Button value="on" style={ButtonStyle}>Off</Radio.Button>
                    <Radio.Button value="off" style={ButtonStyle}>On</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col flex="1" style={{paddingLeft: padding}}>

              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Other" key="5">
            <Row>
              <Col flex="1" style={{paddingRight: padding}}>
                <Form.Item>
                  <Space style={{marginTop: 3, marginBottom: state.webglParametersMasking ? 8 : 24}}>
                    <Form.Item name="webglParametersMasking" valuePropName="checked" noStyle>
                      <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                    </Form.Item>
                    Mask WebGL metadata
                  </Space>
                </Form.Item>

                <If condition={state.webglParametersMasking}>
                  <Form.Item label="WebGL Vendor" name="webglVendor">
                    <Input />
                  </Form.Item>

                  <Form.Item label="WebGL Renderer name" name="webglRendererName">
                    <Input />
                  </Form.Item>
                </If>

                <Form.Item>
                  <Space style={{marginTop: 3, marginBottom: 24}}>
                    <Form.Item name="webglRendererNoise" valuePropName="checked" noStyle>
                      <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                    </Form.Item>
                    Noise WebGL Renderer
                  </Space>
                </Form.Item>

                <Form.Item>
                  <Space style={{marginTop: 3, marginBottom: 24}}>
                    <Form.Item name="canvasNoise" valuePropName="checked" noStyle>
                      <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                    </Form.Item>
                    Noise Canvas
                  </Space>
                </Form.Item>

                <Form.Item>
                  <Space style={{marginTop: 3, marginBottom: 24}}>
                    <Form.Item name="audioNoise" valuePropName="checked" noStyle>
                      <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                    </Form.Item>
                    Noise Audio Context
                  </Space>
                </Form.Item>
              </Col>
              <Col flex="1" style={{paddingLeft: padding}}>
                <Form.Item>
                  <Space style={{marginTop: 3, marginBottom: state.mediaDevicesMasking ? 4 : 24}}>
                    <Form.Item name="mediaDevicesMasking" valuePropName="checked" noStyle>
                      <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                    </Form.Item>
                    Mask Media Devices
                  </Space>
                </Form.Item>

                <If condition={state.mediaDevicesMasking}>
                  <Form.Item label="Video inputs" name="mediaDevicesVideoInputs">
                    <InputNumber min={0} max={4} />
                  </Form.Item>

                  <Form.Item label="Audio inputs" name="mediaDevicesAudioInputs">
                    <InputNumber min={0} max={4} />
                  </Form.Item>

                  <Form.Item label="Audio outputs" name="mediaDevicesAudioOutputs">
                    <InputNumber min={0} max={4} />
                  </Form.Item>
                </If>

                <Form.Item>
                  <Space style={{marginTop: 3, marginBottom: state.fontsMasking ? 4 : 24}}>
                    <Form.Item name="fontsMasking" valuePropName="checked" noStyle>
                      <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
                    </Form.Item>
                    Mask Fonts list
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

        </Tabs>
      </Form>
    )
  }
}

class PageProfileEditor extends Component {
  constructor(props) {
    super(props)

    let profileId = this.props.location.pathname.split('/').reverse()[0]
    let isNew = profileId === 'new'

    this.isNew = isNew
    this.state = isNew ? appModel.getNewFingerprint() : appModel.getProfileById(profileId)
  }

  onValuesChange (changed) {
    if (changed.timezoneName) changed.timezoneOffset = getTimezoneByName(changed.timezoneName).offsetMinutes
    this.setState(changed)
  }

  render () {
    let state = this.state
    let onValueChange = this.onValuesChange.bind(this)

    return (
      <AppLayout>
        <AppLayout.Head>
          <h1 style={{fontSize: 24}}>{this.isNew ? 'Create New Profile' : 'Edit Profile'}</h1>
        </AppLayout.Head>
        <AppLayout.Body>
          <Row style={{height: '100%'}} gutter="8">
            <Col flex="8">
              <Card>
                <ProfileForm data={state} onValuesChange={onValueChange} isNew={this.isNew} />
              </Card>
            </Col>
            <Col flex="4">
              <Card title="Profile Summary">
                <ProfileSummary data={state} />
              </Card>
            </Col>
          </Row>
        </AppLayout.Body>
      </AppLayout>
    )
  }
}

export default withRouter(PageProfileEditor)
