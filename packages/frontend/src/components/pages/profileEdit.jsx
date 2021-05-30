import { Form, Input, Tabs, Skeleton, Button } from 'antd'
import merge from 'deepmerge'
import React, { useEffect, useState } from 'react'

import backend from '../backend'
import { FormSwitch, FormSelect, FormNumber, FromButton, Cols, FormRadio } from '../formItems'
import notify from '../notify'
import useRouter from '../useRouter'
import { getRandomName } from '../utils/random'

import { FormLayout } from './layout'

async function getInitialState (profileId) {
  const calls = [
    backend.fingerprint.get().then(rep => ({ fingerprint: { win: rep.win, mac: rep.mac } })),
    backend.fingerprint.variants().then(rep => ({ variants: { win: rep.win, mac: rep.mac } })),
    profileId && backend.profiles.get(profileId).then(rep => ({ profile: rep.profile })),
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

  return Object.assign(data, { os, name, namePlaceholder })
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

  function onValuesChange (value, all) {
    if ('os' in value && value.os !== state.os) return setState(getStateFromForm(state, all))
  }

  async function onFinish (values) {
    const name = values?.name || state.namePlaceholder
    delete values.name

    values = { name, fingerprint: values }
    const rep = await backend.profiles.save({ profileId, ...values })
    if (!rep.success) return notify.error('Profile not saved. Try again.')

    notify.success('Profile saved!')
    router.replace('/profiles')
  }

  async function randomize () {
    const fingerprint = await backend.fingerprint.get()
    form.setFieldsValue(fingerprint[state.os])
  }

  const variants = state.variants[state.os]
  const initialValues = { name: state.name, ...state.fingerprint[state.os] }
  const osOptions = [{ value: 'win', title: 'Windows' }, { value: 'mac', title: 'MacOS' }]

  const TabPane = Tabs.TabPane
  const extraContent = <Button size="small" onClick={randomize}>Randomize</Button>

  return (
    <Form name="profile-edit" layout="vertical" {...{ form, initialValues, onValuesChange, onFinish }}>

      <Tabs size="small" tabBarExtraContent={extraContent}>

        <TabPane key={0} tab="General" forceRender="true">
          <Cols>
            <Form.Item name="name" label="Profile Name">
              <Input placeholder={state.namePlaceholder} />
            </Form.Item>
          </Cols>

          <Cols>
            <FormRadio name="os" label="Operation System" options={osOptions} />
          </Cols>

          <Cols>
            <Form.Item name="userAgent" label="User Agent">
              <Input.TextArea rows="2" style={{ resize: 'none' }} />
            </Form.Item>
          </Cols>
        </TabPane>

        <TabPane key={1} tab="Hardware" forceRender={true}>
          <Cols>
            <FormSelect name="screen" label="Screen Resolution" options={variants.screen} />
          </Cols>

          <Cols>
            <FormSelect name="cpu" label="CPU Cores" options={variants.cpu} />
            <FormSelect name="ram" label="Memory, GB" options={variants.ram} />
          </Cols>

          <Cols>
            <FormSelect name="renderer" label="Renderer" options={variants.renderer} />
          </Cols>

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
