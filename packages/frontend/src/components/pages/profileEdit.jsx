import { Form, Tabs, Skeleton, Button } from 'antd'
import { diff } from 'deep-object-diff'
import merge from 'deepmerge'
import { flatten, unflatten } from 'flat'
import React, { useEffect, useState } from 'react'

import backend from '../backend'
import { FormSwitch, FormSelect, FormNumber, FormButton, Cols, FormInput, FormTextArea, FormRadio } from '../formItems'
import { ProfileProxy } from '../formShared'
import notify from '../notify'
import useRouter from '../useRouter'
import { getRandomName } from '../utils/random'

import { FormLayout } from './layout'

async function getInitialState (profileId) {
  const clientOS = window.navigator.platform === 'MacIntel' ? 'mac' : 'win'
  const [fingerprint, variants, proxies, profile] = await Promise.all([
    backend.fingerprint.get().then(rep => ({ win: rep.win, mac: rep.mac })),
    backend.fingerprint.variants().then(rep => ({ win: rep.win, mac: rep.mac })),
    backend.proxies.list().then(rep => rep.proxies),
    profileId ? backend.profiles.get(profileId).then(rep => rep.profile) : null,
  ])

  const name = profile ? profile.name : null
  const os = profile ? profile.fingerprint.os : clientOS
  const proxy = profile.proxy ? { proxy: 'saved', id: profile.proxy } : { proxy: 'none' }
  const generatedName = getRandomName()
  if (profile) Object.assign(fingerprint[os], profile.fingerprint)

  return { name, os, fingerprint, variants, proxies, proxy, generatedName, profile }
}

async function getFlattenFingerprint (os) {
  const data = await backend.fingerprint.get()
  return flatten({ fingerprint: { [os]: data[os] } })
}

function ProfileEditForm () {
  const [state, setState] = useState(null)
  const router = useRouter()
  const [form] = Form.useForm()

  const { profileId } = router.query

  useEffect(() => getInitialState(profileId).then(setState), [profileId])
  useEffect(() => state && form.resetFields(), [state?.os])

  // RENDER

  if (!state) return <Skeleton active />

  function onValuesChange (value, all) {
    if ('os' in value && value.os !== state.os) return setState(merge(state, unflatten(all)))
    if ('proxy.proxy' in value) return setState(merge(state, unflatten(value)))
  }

  async function onFinish (values) {
    values = unflatten(values)

    const profileProxyType = values.proxy.proxy
    if (profileProxyType === 'new') delete values.proxy.proxy

    const name = values.name || state.generatedName
    const fingerprint = { ...values.fingerprint[state.os], os: state.os }
    const proxy = profileProxyType === 'saved' ? values.proxy.id : null
    const createProxy = profileProxyType === 'new' ? values.proxy : null

    values = { name, fingerprint, proxy, createProxy }

    const profile = state.profile
    const prev = { name: profile.name, fingerprint: profile.fingerprint, proxy: profile.proxy, createProxy: null }
    const dataDiff = diff(prev, values)
    console.log(flatten(dataDiff))

    const rep = await backend.profiles.save({ profileId, ...values })
    if (!rep.success) return notify.error('Profile not saved. Try again.')

    notify.success('Profile saved!')
    router.replace('/profiles')
  }

  const { name, os, fingerprint, proxy } = state
  const initialValues = flatten({ name, os, fingerprint, proxy })
  console.log(initialValues, form.getFieldValue('proxy.proxy'))

  const variants = state.variants[state.os]
  const osOptions = [{ value: 'win', title: 'Windows' }, { value: 'mac', title: 'MacOS' }]
  const fp = name => `fingerprint.${state.os}.${name}`

  const TabPane = Tabs.TabPane
  const randomize = async () => form.setFieldsValue(await getFlattenFingerprint(state.os))
  const extraContent = <Button size="small" onClick={randomize}>Randomize</Button>

  return (
    <Form name="profile-edit" layout="vertical" {...{ form, initialValues, onValuesChange, onFinish }}>
      <Tabs size="small" tabBarExtraContent={extraContent}>
        <TabPane key={0} tab="General" forceRender="true">
          <FormInput name="name" label="Profile Name" placeholder={state.generatedName} />
          <FormRadio name="os" label="Operation System" options={osOptions} />

          <ProfileProxy state={state} />
        </TabPane>

        <TabPane key={1} tab="Hardware" forceRender={true}>
          <FormTextArea name={fp('userAgent')} label="User Agent" />
          <FormSelect name={fp('screen')} label="Screen Resolution" options={variants.screen} />

          <Cols>
            <FormSelect name={fp('cpu')} label="CPU Cores" options={variants.cpu} />
            <FormSelect name={fp('ram')} label="Memory, GB" options={variants.ram} />
          </Cols>

          <FormSelect name={fp('renderer')} label="Renderer" options={variants.renderer} />

          <Cols label="Hardware Noise">
            <FormSwitch name={fp('noiseWebGl')} label="WebGL" />
            <FormSwitch name={fp('noiseCanvas')} label="Canvas" />
            <FormSwitch name={fp('noiseAudio')} label="Audio" />
          </Cols>

          <Cols label="Media Devices">
            <FormNumber name={fp('deviceCameras')} label="Cameras" min={0} max={4} size="small" />
            <FormNumber name={fp('deviceMicrophones')} label="Microphones" min={0} max={4} size="small" />
            <FormNumber name={fp('deviceSpeakers')} label="Speakers" min={0} max={4} size="small" />
          </Cols>

        </TabPane>
      </Tabs>

      <Cols style={{ textAlign: 'right' }}>
        <FormButton>{profileId ? 'Save Profile' : 'Create Profile'}</FormButton>
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
