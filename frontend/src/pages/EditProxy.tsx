import { Skeleton, Form } from 'antd'
import React, { useState, useEffect } from 'react'

import backend from '@/backend'
import { FormButton, FormRadio, Cols, FormInput } from '@/components/FormItems'
import { withFormLayout } from '@/components/layout'
import Notify from '@/components/Notify'
import { useRouter } from '@/hooks'
import { iProxyBase } from '@/types'
import { toString, Stringify } from '@/utils/object'

type State = Stringify<iProxyBase>

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

async function getInitialState (proxyId?: string) {
  const proxy = { type: 'socks5' }
  if (proxyId != null) Object.assign(proxy, await backend.proxies.get(proxyId))
  return toString(proxy) as State
}

function EditProxy () {
  const [state, setState] = useState<State>()
  const [form] = Form.useForm()

  const router = useRouter()
  const proxyId = router.params?.proxyId

  useEffect(() => { getInitialState(proxyId).then(setState) }, [proxyId])

  if (!state) return <Skeleton active />

  const submit = async (values: State) => {
    const data = { ...toString(values), port: parseInt(values.port, 10) } as iProxyBase
    const rep = await backend.proxies.save(data, proxyId)

    // todo: put to wripper
    if (!rep.success) return Notify.error('Proxy not saved. Try again.')
    Notify.success('Proxy saved!')
    router.replace('/proxies')
  }

  return (
    <Form layout="vertical" form={form} initialValues={state} onFinish={submit}>
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
