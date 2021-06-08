import { Skeleton, Form } from 'antd'
import React, { useState, useEffect } from 'react'

import backend from '@/backend'
import { FormButton, FormRadio, Cols, FormInput } from '@/components/FormItems'
import Layout from '@/components/Layout'
import Notify from '@/components/Notify'
import { useRouter } from '@/hooks'

async function getInitialState (proxyId) {
  const proxy = proxyId ? (await backend.proxies.get(proxyId)).proxy : { type: 'socks5' }
  return { proxy }
}

export default function EditProxy () {
  const [state, setState] = useState(null)
  const router = useRouter()
  const [form] = Form.useForm()

  const { proxyId } = router.query
  useEffect(() => getInitialState(proxyId).then(setState), [proxyId])

  if (!state) return <Skeleton active />

  async function onFinish (values) {
    values.port = parseInt(values.port, 10)

    const rep = await backend.proxies.save({ proxyId, ...values })
    if (!rep.success) return Notify.error('Proxy not saved. Try again.')

    Notify.success('Proxy saved!')
    router.replace('/proxies')
  }

  const initialValues = state.proxy
  const typeOptions = [{ value: 'socks5', title: 'SOCKS5' }, { value: 'http', title: 'HTTP' }]
  const rules = {
    host: [{ required: true }],
    port: [{ required: true, pattern: /^[0-9]+$/, message: 'Should be number.' }],
  }

  const props = { form, onFinish, initialValues }

  return (
    <Layout.Form name="proxy-edit" layout="vertical" {...props}>
      <FormInput name="name" label="Proxy Name" placeholder="Enter proxy name" rules={[{ required: true }]} />
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
        <FormButton style={{ marginBottom: 0, marginTop: '10px' }}>
          {proxyId ? 'Save Proxy' : 'Create Proxy'}
        </FormButton>
      </Cols>
    </Layout.Form>
  )
}
