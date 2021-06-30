import { Skeleton, Form } from 'antd'
import React, { useState, useEffect } from 'react'

import backend from '@/backend'
import { toString, Stringify } from '@/common/object'
import { FormButton, Cols } from '@/components/FormItems'
import Notify from '@/components/Notify'
import { withFormLayout } from '@/components/root'
import { useRouter } from '@/hooks'
import { ProxyBase } from '@/types'

import ProxyFields from './ProxyFields'

type State = Stringify<ProxyBase>

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
    const data = { ...toString(values), port: parseInt(values.port, 10) } as ProxyBase
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
