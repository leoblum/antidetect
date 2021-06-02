import { Skeleton, Form } from 'antd'
import React, { useState, useEffect } from 'react'

import backend from '../backend'
import { FormButton, FormRadio, Cols, FormInput } from '../formItems'
import notify from '../notify'
import useRouter from '../useRouter'
import { getRandomName } from '../utils/random'

import { FormLayout } from './layout'

async function getInitialState (proxyId) {
  const namePlaceholder = getRandomName()
  const proxy = proxyId ? (await backend.proxies.get(proxyId)).proxy : { type: 'socks5' }
  return { namePlaceholder, proxy }
}

function ProxyEditForm () {
  const [state, setState] = useState(null)
  const router = useRouter()
  const [form] = Form.useForm()

  const { proxyId } = router.query
  useEffect(() => getInitialState(proxyId).then(setState), [proxyId])

  if (!state) return <Skeleton active />

  async function onFinish (values) {
    if (!values.name) values.name = state.namePlaceholder
    values.port = parseInt(values.port, 10)

    const rep = await backend.proxies.save({ proxyId, ...values })
    if (!rep.success) return notify.error('Proxy not saved. Try again.')

    notify.success('Proxy saved!')
    router.replace('/proxies')
  }

  const initialValues = state.proxy
  const typeOptions = [{ value: 'socks5', title: 'SOCKS5' }, { value: 'http', title: 'HTTP' }]
  const rules = {
    host: [{ required: true }],
    port: [{ required: true, pattern: /^[0-9]+$/, message: 'Should be number.' }],
  }

  return (
    <Form name="proxy-edit" layout="vertical" {...{ form, onFinish, initialValues }}>
      <FormInput name="name" label="Proxy Name" placeholder={state.namePlaceholder} />
      <FormRadio name="type" label="Protocol" options={typeOptions} />

      <Cols>
        <FormInput name="host" label="Host" placeholder="IP or hostname" rules={rules.host} />
        <FormInput name="port" label="Port" placeholder="Port" rules={rules.port} />
      </Cols>

      <Cols>
        <FormInput name="username" label="Login" placeholder="Login" />
        <FormInput name="password" label="Password" placeholder="Password" />
      </Cols>

      <Cols style={{ textAlign: 'right' }}>
        <FormButton>{proxyId ? 'Save Proxy' : 'Create Proxy'}</FormButton>
      </Cols>

    </Form>
  )
}

export default function ProfileEdit () {
  return (
    <FormLayout>
      <ProxyEditForm />
    </FormLayout>
  )
}
