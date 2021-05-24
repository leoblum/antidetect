import React, {useEffect, useState} from 'react'
import {Card, Form, Input, Radio, Select, Tabs, Skeleton, Button, Col, Row, Space, Switch, InputNumber, Dropdown} from 'antd'
import {BaseLayout, StyleForEach} from './base-layout'
import backend from '../backend'
import {CheckOutlined, CloseOutlined, MinusOutlined, MoreOutlined} from '@ant-design/icons'
import {uniqueNamesGenerator, animals, colors} from 'unique-names-generator'
import notify from './notify'
import {useRouter} from './router'

function getProfileName () {
  return uniqueNamesGenerator({
    dictionaries: [colors, animals],
    length: 2,
    style: 'capital',
    separator: ' ',
  })
}

// const {uniqueNamesGenerator, adjectives, colors, animals} = require('unique-names-generator')

function LabelWrapper ({children, label}) {
  return !label ? <>{children}</> : (
    <Form.Item label={label}>{children}</Form.Item>
  )
}

function Cols ({children, label, style}) {
  if (!Array.isArray(children)) children = [children]
  return (
    <LabelWrapper label={label}>
      <Row className={'child-margin-8'} style={style}>
        {children.map((el, idx) => <Col key={idx} flex={1}>{el}</Col>)}
      </Row>
    </LabelWrapper>
  )
}

function FormSwitch ({name, label}) {
  return (
    <Space>
      <Form.Item name={name} valuePropName={'checked'} noStyle>
        <Switch size={'small'} checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
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
      <InputNumber min={min} max={max} size={size} />
    </Form.Item>
  )
}

function AddProfileForm () {
  const [state, setState] = useState(null)
  const [cache, setCache] = useState(null)
  const [form] = Form.useForm()
  const [defaultName, setDefaultName] = useState(getProfileName())

  const router = useRouter()

  const profileId = router.location.pathname.split('/').reverse()[0]
  console.log(profileId)

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
    return <Skeleton active />
  }

  const randomize = () => updateFingerprint()
  const variants = cache.options[state.os]

  function onValuesChange (value, all) {
    console.log(value)
  }

  const TabPane = Tabs.TabPane
  const extraContent = <Button size={'small'} onClick={randomize}>Randomize</Button>

  async function onFinish (values) {
    const name = values?.name || defaultName
    delete values.name

    const toSave = {name, fingerprint: values}
    const rep = await backend.saveProfile(toSave)

    // todo: maybe rewrite this
    if (rep.success) {
      notify.success('Profile sucessfuly created!')
      router.replace('/')
      return
    } else {

    }
  }

  const formProps = {
    layout: 'vertical',
    form,
    initialValues: state,
    onValuesChange,
    onFinish,
    name: 'profile-edit'
  }

  return (
    <Form {...formProps}>

      <Tabs size={'small'} tabBarExtraContent={extraContent}>

        <TabPane key={0} tab={'General'} forceRender={true}>
          <Cols>
            <Form.Item name={'name'} label={'Profile Name'}>
              <Input placeholder={defaultName} />
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
              <Input.TextArea rows="2" style={{resize: 'none'}} />
            </Form.Item>
          </Cols>
        </TabPane>

        <TabPane key={1} tab={'Hardware'} forceRender={true}>
          <Cols>
            <FormSelect name={'screen'} label={'Screen Resolution'} options={variants.screen} />
          </Cols>

          <Cols>
            <FormSelect name={'cpu'} label={'CPU Cores'} options={variants.cpu} />
            <FormSelect name={'ram'} label={'Memory, GB'} options={variants.ram} />
          </Cols>

          <Cols>
            <FormSelect name={'renderer'} label={'Renderer'} options={variants.renderer} />
          </Cols>

          <Cols label={'Hardware Noise'}>
            <FormSwitch name={'noiseWebGl'} label={'WebGL'} />
            <FormSwitch name={'noiseCanvas'} label={'Canvas'} />
            <FormSwitch name={'noiseAudio'} label={'Audio'} />
          </Cols>

          <Cols label={'Media Devices'}>
            <FormNumber name={'deviceCameras'} label={'Cameras'} min={0} max={4} size={'small'} />
            <FormNumber name={'deviceMicrophones'} label={'Microphones'} min={0} max={4} size={'small'} />
            <FormNumber name={'deviceSpeakers'} label={'Speakers'} min={0} max={4} size={'small'} />
          </Cols>
        </TabPane>
      </Tabs>

      <Cols style={{textAlign: 'right'}}>
        <Form.Item>
          <Button type={'primary'} htmlType={'submit'}>Create Profile</Button>
        </Form.Item>
      </Cols>
    </Form>
  )
}

export function AddProfile () {
  return (
    <BaseLayout>
      <Card>
        <div style={{maxWidth: '560px', margin: '0 auto'}}>
          <AddProfileForm />
        </div>
      </Card>
    </BaseLayout>
  )
}
