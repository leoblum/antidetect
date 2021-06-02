import React from 'react'

import { Cols, FormRadio, FormInput, FormSelect } from './formItems'

const If = ({ children, condition }) => (condition ? children : <></>)

export function ProfileProxy ({ prefix = 'proxy', state, ...props }) {
  const options = [
    { value: 'none', title: 'No Proxy' },
    { value: 'saved', title: 'From Saved' },
    { value: 'new', title: 'New' },
  ]

  const name = `${prefix}.proxy`
  const value = state[prefix].proxy

  return (
    <>
      <FormRadio name={name} label="Proxy" options={options} {...props} />
      <If condition={value === 'new'}>
        <ProxyFields prefix={prefix} />
      </If>
      <If condition={value === 'saved'}>
        <ProxiesList prefix={prefix} proxies={state.proxies} />
      </If>
    </>
  )
}

export function ProxiesList ({ proxies, prefix = '' }) {
  const name = prefix.length ? `${prefix}.id` : 'id'
  const options = proxies.map(x => ({ value: x._id, title: x.name }))

  return <FormSelect name={name} options={options} placeholder="Tap to select" />
}

export function ProxyFields ({ prefix = '' }) {
  const options = [
    { value: 'socks5', title: 'SOCKS5' },
    { value: 'http', title: 'HTTP' },
  ]

  const rules = {
    host: [{ required: true, message: 'Should not be empty.' }],
    port: [{ required: true, pattern: /^[0-9]+$/, message: 'Should be number.' }],
  }

  const wrap = name => prefix.length ? `${prefix}.${name}` : name

  return (
    <>
      {/* <FormInput name="name" label="Proxy Name" placeholder={state.namePlaceholder} /> */}
      <FormRadio name={wrap('type')} label="Protocol" options={options} initialValue="socks5" />

      <Cols>
        <FormInput name={wrap('host')} label="Host" placeholder="IP or hostname" rules={rules.host} />
        <FormInput name={wrap('port')} label="Port" placeholder="Port" rules={rules.port} />
      </Cols>

      <Cols>
        <FormInput name={wrap('username')} label="Login" placeholder="Login" />
        <FormInput name={wrap('password')} label="Password" placeholder="Password" />
      </Cols>
    </>
  )
}
