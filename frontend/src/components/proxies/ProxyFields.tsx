import React from 'react'

import { FormRadio, Cols, FormInput } from '@/components/FormItems'

const ProxyFields = ({ prefix = '' }: { prefix?: string }) => {
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

export default ProxyFields
