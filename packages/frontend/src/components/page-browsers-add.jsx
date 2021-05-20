import React, {useEffect, useState} from 'react'
import {Card, Form, Input, Radio, Select, Tabs, Skeleton, Button, Col, Row, Space, Switch, InputNumber} from 'antd'
import {BaseLayout, StyleForEach} from './base-layout'
import backend from '../backend'
import {CheckOutlined, CloseOutlined, MinusOutlined} from '@ant-design/icons'

function LabelWrapper ({children, label}) {
  return !label ? <>{children}</> : (
    <Form.Item label={label}>{children}</Form.Item>
  )
}

function Cols ({children, label, style}) {
  if (style) console.warn('style is not used for this component')

  if (!Array.isArray(children)) children = [children]
  return (
    <LabelWrapper label={label}>
      <Row className={'child-margin-8'}>
        {children.map((el, idx) => <Col key={idx} flex={1}>{el}</Col>)}
      </Row>
    </LabelWrapper>
  )
}

function FormSwitch ({name, label}) {
  return (
    <Space>
      <Form.Item name={name} valuePropName={'checked'} noStyle>
        <Switch size={'small'} checkedChildren={<CheckOutlined/>} unCheckedChildren={<CloseOutlined/>}/>
      </Form.Item>
      {label}
    </Space>
  )
}

function FormSelect ({name, label, options, ...props}) {
  return (
    <Form.Item name={name} label={label} {...props}>
      <Select>
        {options.map((x, idx) => (
          <Select.Option key={idx} value={x}>{x}</Select.Option>
        ))}
      </Select>
    </Form.Item>
  )
}

function FormNumber ({name, label, min = 0, max = 100, size = 'default'}) {
  return (
    <Form.Item name={name} label={label}>
      <InputNumber min={min} max={max} size={size}/>
    </Form.Item>
  )
}

function AddBrowserForm () {
  const [state, setState] = useState(null)
  const [cache, setCache] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    const calls = [
      backend.fingerprintRandom().then(random => ({random})),
      backend.fingerprintOptions().then(options => ({options})),
    ]

    Promise.all(calls).then(data => Object.assign(...data))
      .then(data => setCache(data))
  }, [])

  useEffect(() => {
    if (cache) updateFromFingerprint()
  }, [cache])

  function updateFromFingerprint () {
    const os = state?.os || (window.navigator.platform === 'MacIntel' ? 'mac' : 'win')
    setState({...state, ...cache.random[os]})
  }

  function updateFingerprint () {
    const os = form.getFieldValue('os')
    backend.fingerprintRandom().then(random => form.setFieldsValue(random[os]))
    // backend.fingerprintRandom().then(random => setCache({...cache, random}))
  }

  // RENDER

  if (!state) {
    return <Skeleton active/>
  }

  const randomize = () => updateFingerprint()
  const variants = cache.options[state.os]

  function onValuesChange (value, all) {
    console.log(value)
  }

  const TabPane = Tabs.TabPane
  const extraContent = <Button size={'small'} onClick={randomize}>Randomize</Button>

  console.log(state)

  return (
    <Form layout={'vertical'} form={form} initialValues={state} onValuesChange={onValuesChange}>

      <Tabs size={'small'} tabBarExtraContent={extraContent}>

        <TabPane key={0} tab={'General'}>
          <Cols>
            <Form.Item name={'name'} label={'Profile Name'}>
              <Input/>
            </Form.Item>
          </Cols>

          <Cols>
            <Form.Item name={'os'} label={'Operation System'}>
              <Radio.Group style={{display: 'flex', width: '100%'}}>
                <Radio.Button value={'win'} style={{flex: 1, textAlign: 'center'}}>Windows</Radio.Button>
                <Radio.Button value={'mac'} style={{flex: 1, textAlign: 'center'}}>MacOS</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Cols>

          <Cols>
            <Form.Item name={'userAgent'} label={'User Agent'}>
              <Input.TextArea rows="2" style={{resize: 'none'}}/>
            </Form.Item>
          </Cols>
        </TabPane>

        <TabPane key={1} tab={'Hardware'}>
          <Cols>
            <FormSelect name={'screen'} label={'Screen Resolution'} options={variants.screen}/>
          </Cols>

          <Cols>
            <FormSelect name={'cpu'} label={'CPU Cores'} options={variants.cpu}/>
            <FormSelect name={'ram'} label={'Memory, GB'} options={variants.ram}/>
          </Cols>

          <Cols>
            <FormSelect name={'renderer'} label={'Renderer'} options={variants.renderer}/>
          </Cols>

          <Cols label={'Hardware Noise'}>
            <FormSwitch name={'noiseWebGl'} label={'WebGL'}/>
            <FormSwitch name={'noiseCanvas'} label={'Canvas'}/>
            <FormSwitch name={'noiseAudio'} label={'Audio'}/>
          </Cols>

          <Cols label={'Media Devices'}>
            <FormNumber name={'deviceCameras'} label={'Cameras'} min={0} max={4} size={'small'}/>
            <FormNumber name={'deviceMicrophones'} label={'Microphones'} min={0} max={4} size={'small'}/>
            <FormNumber name={'deviceSpeakers'} label={'Speakers'} min={0} max={4} size={'small'}/>
          </Cols>
        </TabPane>
      </Tabs>
    </Form>
  )
}

export function AddBrowser () {
  return (
    <BaseLayout>
      <Card>
        <div style={{maxWidth: '560px', margin: '0 auto'}}>
          <AddBrowserForm/>
        </div>
      </Card>
    </BaseLayout>
  )
}
