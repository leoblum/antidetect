import { Skeleton, Form } from 'antd'
import React, { useState, useEffect } from 'react'

import backend from '@/backend'
import { FormButton, FormRadio, Cols, FormInput } from '@/components/FormItems'
import Layout from '@/components/Layout'
import Notify from '@/components/Notify'
import { useRouter } from '@/hooks'
import { ProxyType } from '@/types'

async function getInitialState (proxyId: string | null) {
  const proxy: ProxyType = proxyId !== null ? (await backend.proxies.get(proxyId)).proxy : { type: 'socks5' }
  return { proxy }
}

type StateData = { proxy: ProxyType }
export default function EditProxy () {
  const [state, setState] = useState<StateData>()
  const router = useRouter()
  const [form] = Form.useForm()

  const { proxyId = null } = router.params

  useEffect(() => {
    getInitialState(proxyId).then(setState).catch(() => null)
  }, [proxyId])

  if (state == null) return <Skeleton active />

  async function onFinish (values) {
    values.port = parseInt(values.port, 10)

    const rep = await backend.proxies.save({ proxyId, ...values })
    if (!rep.success) return await Notify.error('Proxy not saved. Try again.')

    // Notify.success('Proxy saved!')
    router.replace('/proxies')
  }

  const initialValues = state.proxy
  const typeOptions = [{ value: 'socks5', title: 'SOCKS5' }, { value: 'http', title: 'HTTP' }]
  const rules = {
    name: [{ required: true }],
    host: [{ required: true }],
    port: [{ required: true, pattern: /^[0-9]+$/, message: 'Should be number.' }],
  }

  const props = { form, onFinish, initialValues }

  return (
    <Layout.Form name="proxy-edit" layout="vertical" {...props}>
      <FormInput name="name" label="Proxy Name" placeholder="Enter proxy name" rules={rules.name} />
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
        <FormButton style={{ marginBottom: '-2px', marginTop: '8px' }}>
          {proxyId != null ? 'Save Proxy' : 'Create Proxy'}
        </FormButton>
      </Cols>
    </Layout.Form>
  )
}
