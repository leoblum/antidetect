import { Form, Input, Tabs, Skeleton, Button } from 'antd'
import merge from 'deepmerge'
import React, { useEffect, useState } from 'react'

import backend from '../backend'
import { FormSwitch, FormSelect, FormNumber, FromButton, Cols, FormRadio, FormInput, FormTextArea } from '../formItems'
import notify from '../notify'
import useRouter from '../useRouter'
import { getRandomName } from '../utils/random'

import { FormLayout } from './layout'

const If = ({ children, condition }) => (condition ? children : <></>)

async function getInitialState (profileId) {
  const calls = [
    backend.fingerprint.get().then(rep => ({ fingerprint: { win: rep.win, mac: rep.mac } })),
    backend.fingerprint.variants().then(rep => ({ variants: { win: rep.win, mac: rep.mac } })),
    profileId && backend.profiles.get(profileId).then(rep => ({ profile: rep.profile })),
    backend.proxies.list().then(rep => ({ proxies: rep.proxies })),
  ]

  const data = Object.assign(...(await Promise.all(calls)))
  const clientOs = window.navigator.platform === 'MacIntel' ? 'mac' : 'win'

  const os = data?.profile?.fingerprint?.os || clientOs
  const name = data?.profile?.name || null
  const namePlaceholder = getRandomName()

  if (data.profile) {
    Object.assign(data.fingerprint[os], data.profile.fingerprint)
    delete data.profile
  }

  const proxyType = 'new'
  return Object.assign(data, { os, name, namePlaceholder, proxyType })
}

function getStateFromForm (state, values) {
  const name = values.name
  delete values.name

  // save fingerprint values for prev selected os
  // todo: specify list of values to keep from form when os is updated
  return merge(state, {
    name,
    fingerprint: { [state.os]: { ...values, os: state.os } },
    os: values.os,
  })
}

function ProfileEditForm () {
  const [state, setState] = useState(null)
  const router = useRouter()
  const [form] = Form.useForm()

  const { profileId } = router.query

  useEffect(() => getInitialState(profileId).then(setState), [profileId])
  useEffect(() => form.resetFields(), [state?.os])

  // RENDER

  if (!state) return <Skeleton active />

  async function randomize () {
    const fingerprint = await backend.fingerprint.get()
    form.setFieldsValue(fingerprint[state.os])
  }

  const TabPane = Tabs.TabPane
  const extraContent = <Button size="small" onClick={randomize}>Randomize</Button>

  function onValuesChange (value, all) {
    if ('os' in value && value.os !== state.os) return setState(getStateFromForm(state, all))
    if ('proxyType' in value) return setState({ ...state, ...value })
  }

  async function onFinish (values) {
    const name = values?.name || state.namePlaceholder
    delete values.name

    return console.log(values)

    values = { name, fingerprint: values }
    const rep = await backend.profiles.save({ profileId, ...values })
    if (!rep.success) return notify.error('Profile not saved. Try again.')

    notify.success('Profile saved!')
    router.replace('/profiles')
  }

  const variants = state.variants[state.os]
  const initialValues = {
    name: state.name,
    proxyType: state.proxyType,
    ...state.fingerprint[state.os],
  }

  const osOptions = [{ value: 'win', title: 'Windows' }, { value: 'mac', title: 'MacOS' }]
  const proxyTypeOptions = [{ value: 'socks5', title: 'SOCKS5' }, { value: 'http', title: 'HTTP' }]

  const rules = {
    host: [{ required: true }],
    port: [{ required: true, pattern: /^[0-9]+$/, message: 'Should be number.' }],
  }

  const proxyOptions = [
    { value: 'none', title: 'No Proxy' },
    { value: 'saved', title: 'From Saved' },
    { value: 'new', title: 'New' },
  ]

  return (
    <Form name="profile-edit" layout="vertical" {...{ form, initialValues, onValuesChange, onFinish }}>
      <Tabs size="small" tabBarExtraContent={extraContent}>
        <TabPane key={0} tab="General" forceRender="true">
          <FormInput name="name" label="Profile Name" placeholder={state.namePlaceholder} />
          <FormRadio name="os" label="Operation System" options={osOptions} />
          <FormRadio name="proxyType" label="Proxy" options={proxyOptions} />

          <If condition={state.proxyType === 'new'}>
            {/* <FormInput name="name" label="Proxy Name" placeholder={state.namePlaceholder} /> */}
            <FormRadio name="proxy.type" label="Protocol" options={proxyTypeOptions} />

            <Cols>
              <FormInput name="proxy.host" label="Host" placeholder="IP or hostname" rules={rules.host} />
              <FormInput name="proxy.port" label="Port" placeholder="Port" rules={rules.port} />
            </Cols>

            <Cols>
              <FormInput name="proxy.username" label="Login" placeholder="Login" />
              <FormInput name="proxy.password" label="Password" placeholder="Password" />
            </Cols>
          </If>

          <If condition={state.proxyType === 'saved'}>
            <FormSelect name="proxy.id" options={state.proxies.map(x => [x._id, x.name])} placeholder="Tap to select" />
          </If>
        </TabPane>

        <TabPane key={1} tab="Hardware" forceRender={true}>
          <FormTextArea name="userAgent" label="User Agent" />
          <FormSelect name="screen" label="Screen Resolution" options={variants.screen} />

          <Cols>
            <FormSelect name="cpu" label="CPU Cores" options={variants.cpu} />
            <FormSelect name="ram" label="Memory, GB" options={variants.ram} />
          </Cols>

          <FormSelect name="renderer" label="Renderer" options={variants.renderer} />

          <Cols label="Hardware Noise">
            <FormSwitch name="noiseWebGl" label="WebGL" />
            <FormSwitch name="noiseCanvas" label="Canvas" />
            <FormSwitch name="noiseAudio" label="Audio" />
          </Cols>

          <Cols label="Media Devices">
            <FormNumber name="deviceCameras" label="Cameras" min={0} max={4} size="small" />
            <FormNumber name="deviceMicrophones" label="Microphones" min={0} max={4} size="small" />
            <FormNumber name="deviceSpeakers" label="Speakers" min={0} max={4} size="small" />
          </Cols>

        </TabPane>
      </Tabs>

      <Cols style={{ textAlign: 'right' }}>
        <FromButton>{profileId ? 'Save Profile' : 'Create Profile'}</FromButton>
      </Cols>
    </Form>
  )
}

export default function ProfileEdit () {
  return (
    <FormLayout>
      <ProfileEditForm />
    </FormLayout>
  )
}
