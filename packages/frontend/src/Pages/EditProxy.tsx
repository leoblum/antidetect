import { Skeleton, Form } from 'antd'
import React, { useState, useEffect } from 'react'

import backend from '@/backend'
import { FormButton, FormRadio, Cols, FormInput } from '@/components/FormItems'
import { withFormLayout } from '@/components/layout'
import Notify from '@/components/Notify'
import { useRouter } from '@/hooks'
import { iProxyBase, iProxyProtocol } from '@/types'

type Store = { [Key in keyof iProxyBase]: string } & { type: iProxyProtocol }

export function ProxyFields ({ prefix = '' }: { prefix?: string }) {
  const protocolOptions = { socks5: 'SOCKS5', http: 'HTTP' }

  const rules = {
    name: [{ required: true }],
    host: [{ required: true, message: 'Should not be empty.' }],
    port: [{ required: true, pattern: /^[0-9]+$/, message: 'Should be number.' }],
  }

  const ref = (name: string) => [prefix, name].filter(x => x.length > 0)
  return (
    <React.Fragment>
      <FormInput name={ref('name')} label="Name" placeholder="Enter proxy name" rules={rules.name} />
      <FormRadio name={ref('type')} label="Protocol" options={protocolOptions} />

      <Cols>
        <FormInput name={ref('host')} label="Host" placeholder="IP or hostname" rules={rules.host} />
        <FormInput name={ref('port')} label="Port" placeholder="Port" rules={rules.port} />
      </Cols>

      <Cols>
        <FormInput name={ref('username')} label="Login" placeholder="Login" />
        <FormInput name={ref('password')} label="Password" placeholder="Password" />
      </Cols>
    </React.Fragment>
  )
}

function toString (obj: { [key: string]: any }) {
  for (const [k, v] of Object.entries(obj)) {
    obj[k] = v != null ? v.toString() : ''
  }
  return obj
}

async function getInitialStore (proxyId?: string) {
  const proxy = { type: 'socks5' }
  if (proxyId != null) Object.assign(proxy, await backend.proxies.get(proxyId))
  return toString(proxy) as Store
}

function EditProxy () {
  const [store, setStore] = useState<Store>()
  const [form] = Form.useForm()

  const router = useRouter()
  const proxyId = router.params?.proxyId

  useEffect(() => {
    getInitialStore(proxyId).then(setStore).catch(console.error)
  }, [proxyId])

  if (store == null) return <Skeleton active />

  async function onFinish (values: Store) {
    const data: iProxyBase = { ...values, port: parseInt(values.port, 10) }
    const rep = await backend.proxies.save(data, proxyId)

    // todo: put to wripper
    if (!rep.success) return Notify.error('Proxy not saved. Try again.')
    Notify.success('Proxy saved!')
    router.replace('/proxies')
  }

  return (
    <Form layout="vertical" form={form} initialValues={store} onFinish={onFinish}>
      <ProxyFields />

      <Cols style={{ textAlign: 'right' }}>
        <FormButton style={{ marginBottom: '-2px', marginTop: '8px' }}>
          {proxyId != null ? 'Save Proxy' : 'Create Proxy'}
        </FormButton>
      </Cols>
    </Form>
  )
}

export default withFormLayout(EditProxy)
