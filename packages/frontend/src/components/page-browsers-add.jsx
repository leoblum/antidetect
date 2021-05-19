import React, {useEffect, useState} from 'react'
import {Card, Form, Input, Radio, Select, Tabs, Skeleton, Button, Col, Row, Space} from 'antd'
import {BaseLayout} from './base-layout'
import backend from '../backend'

const {TabPane} = Tabs

function AddBrowserForm () {
  const [state, setState] = useState(null)
  const [cache, setCache] = useState(null)

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
    backend.fingerprintRandom().then(random => setCache({...cache, random}))
  }

  // RENDER

  if (!state) return <Skeleton active/>

  const randomize = () => updateFingerprint()
  const extraActions = <Button size={'small'} onClick={randomize}>Randomize</Button>

  const variants = cache.options[state.os]
  // const onValuesChange = (value, all) => setState(all)
  const onValuesChange = (value, all) => null

  console.log(state.cpu, state.ram)
  console.log(variants.cpu)
  console.log(state.userAgent)

  return (
    <Form layout={'vertical'} initialValues={state}>
      <Button size={'small'} onClick={randomize}>Randomize</Button>

      <Form.Item label="Profile Name" name="name">
        <Input/>
      </Form.Item>

      <Form.Item label="Operation System" name="os">
        <Radio.Group style={{display: 'flex', width: '100%'}}>
          <Radio.Button value="win" style={{flex: 1, textAlign: 'center'}}>Windows</Radio.Button>
          <Radio.Button value="mac" style={{flex: 1, textAlign: 'center'}}>MacOS</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="User Agent" name="userAgent">
        <Input.TextArea rows="2" style={{resize: 'none'}}/>
      </Form.Item>

      <Row>
        <Form.Item label="CPU Cores" name="cpu">
          <Select>
            {variants.cpu.map((x, idx) => (
              <Select.Option key={idx} value={x}>{x}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Memory, GB" name="ram">
          <Select>
            {variants.ram.map((x, idx) => (
              <Select.Option key={idx} value={x}>{x}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Row>

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
