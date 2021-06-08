import { Form, Tabs, Skeleton, Button } from 'antd'
import { getAllTimezones } from 'countries-and-timezones'
import { diff } from 'deep-object-diff'
import merge from 'deepmerge'
import { flatten, unflatten } from 'flat'
import natsort from 'natsort'
import React, { useEffect, useState } from 'react'

import backend from '@/backend'
import { FormSwitch, FormSelect, FormNumber, FormButton, Cols, FormInput, FormTextArea, FormRadio } from '@/components/FormItems'
import Layout from '@/components/Layout'
import Notify from '@/components/Notify'
import { ProfileProxy } from '@/components/SharedProxyItems'
import { useRouter } from '@/hooks'

const TabPane = Tabs.TabPane

async function getInitialState (profileId) {
  const [fp, variants, proxies, profile] = await Promise.all([
    backend.fingerprint.get().then(rep => rep.fingerprint),
    backend.fingerprint.variants().then(rep => ({ win: rep.win, mac: rep.mac })),
    backend.proxies.list().then(rep => rep.proxies),
    profileId ? backend.profiles.get(profileId).then(rep => rep.profile) : null,
  ])

  const fpClientDefaults = {
    os: window.navigator.platform === 'MacIntel' ? 'mac' : 'win',
    timezone: {
      value: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }

  const name = profile ? profile.name : null

  const fingerprint = merge.all([fp, fpClientDefaults, profile ? profile.fingerprint : {}])
  const timezones = getTimezones().map(x => ({ value: x.name, title: `(${x.utcOffsetStr}) ${x.name}` }))

  const defaultProxyId = proxies.length ? proxies[0]._id : null
  const proxy = profile && profile.proxy ? { proxy: 'saved', id: profile.proxy } : { proxy: 'none', id: defaultProxyId }

  return { name, fingerprint, variants, proxies, proxy, profile, timezones }
}

async function getFlattenFingerprint (os) {
  const data = (await backend.fingerprint.get()).fingerprint
  return flatten({ fingerprint: { [os]: data[os] } })
}

async function onFormFinish ({ state, values, router, profileId }) {
  values = unflatten(values)

  const { name, fingerprint } = values
  const profileProxyType = values.proxy.proxy
  if (profileProxyType === 'manual') delete values.proxy.proxy

  const proxy = profileProxyType === 'saved' ? values.proxy.id : null
  const createProxy = profileProxyType === 'manual' ? values.proxy : null

  values = { name, fingerprint, proxy, createProxy }

  const profile = state.profile || {}
  const prev = { name: profile.name, fingerprint: profile.fingerprint, proxy: profile.proxy, createProxy: null }
  const dataDiff = diff(prev, values)
  console.log(flatten(dataDiff))

  const rep = await backend.profiles.save({ profileId, ...values })
  if (!rep.success) return Notify.error('Profile not saved. Try again.')

  Notify.success('Profile saved!')
  router.replace('/profiles')
}

async function onFormValuesChange ({ state, setState, value }) {
  const updateStateOnKeys = [
    'proxy.proxy',
    'fingerprint.os',
    'fingerprint.languages.mode',
    'fingerprint.timezone.mode',
    'fingerprint.geolocation.mode',
  ]

  for (const key of updateStateOnKeys) {
    if (key in value) return setState(merge(state, unflatten(value)))
  }
}

function getTimezones () {
  const sorter = natsort()
  const timezones = Object.values(getAllTimezones())
    .filter(x => !x.name.startsWith('Etc'))
    .sort((a, b) => sorter(a.name, b.name))
    .sort((a, b) => sorter(a.utcOffsetStr, b.utcOffsetStr))
  return timezones
}

function getOptions () {
  const base = [{ value: 'ip', title: 'Based on IP' }, { value: 'manual', title: 'Manual' }]
  const os = [{ value: 'win', title: 'Windows' }, { value: 'mac', title: 'MacOS' }]
  return { os, languages: base, timezone: base, geolocation: base }
}

export default function EditProfile () {
  const [state, setState] = useState(null)
  const router = useRouter()
  const [form] = Form.useForm()

  const { profileId } = router.query

  useEffect(() => getInitialState(profileId).then(setState), [profileId])
  useEffect(() => state && form.resetFields(), [state?.os])

  // RENDER

  if (!state) return <Skeleton active />

  const { name, fingerprint, proxy } = state

  const initialValues = flatten({ name, fingerprint, proxy })
  const onValuesChange = async (value, all) => await onFormValuesChange({ state, setState, value, all })
  const onFinish = async (values) => await onFormFinish({ state, values, router, profileId })
  const props = { form, initialValues, onValuesChange, onFinish }

  const randomize = async () => form.setFieldsValue(await getFlattenFingerprint(fingerprint.os))
  const extraContent = <Button size="small" onClick={randomize}>Randomize</Button>

  const options = getOptions()
  const variants = state.variants[fingerprint.os]
  const fp = name => `fingerprint.${fingerprint.os}.${name}`

  return (
    <Layout.Form name="profile-edit" layout="vertical" {...props}>
      <Tabs size="small" tabBarExtraContent={extraContent}>
        <TabPane key="General" tab="General" forceRender="true">
          <FormInput name="name" label="Profile Name" placeholder="Enter profile name" rules={[{ required: true }]} />
          <FormRadio name="fingerprint.os" label="Operation System" options={options.os} />
          <FormInput name="startPage" label="Start Page" placeholder="https://google.com" />
        </TabPane>

        <TabPane key="Connection" tab="Connection" forceRender="true">
          <ProfileProxy state={state} />
        </TabPane>

        <TabPane key="Navigator" tab="Navigator" forceRender="true">
          <FormTextArea name={fp('userAgent')} label="User Agent" />
          <FormSelect name={fp('screen')} label="Screen Resolution" options={variants.screen} />

          <FormRadio name="fingerprint.languages.mode" label="Languages" options={options.languages} />
          <Cols condition={fingerprint.languages.mode === 'manual'}>
            <FormInput name="fingerprint.languages.value" rules={[{ required: true }]} />
          </Cols>

          <FormRadio name="fingerprint.timezone.mode" label="Timezone" options={options.timezone} />
          <Cols condition={fingerprint.timezone.mode === 'manual'}>
            <FormSelect name="fingerprint.timezone.value" options={state.timezones} />
          </Cols>

          <FormRadio name="fingerprint.geolocation.mode" label="Geolocation" options={options.geolocation} />
          <Cols condition={fingerprint.geolocation.mode === 'manual'}>
            <FormInput name="fingerprint.geolocation.latitude" label="Latitude" rules={[{ required: true }]} />
            <FormInput name="fingerprint.geolocation.longitude" label="Longitude" rules={[{ required: true }]} />
          </Cols>
        </TabPane>

        <TabPane key="Hardware" tab="Hardware" forceRender="true">
          <Cols>
            <FormSelect name={fp('cpu')} label="CPU Cores" options={variants.cpu} />
            <FormSelect name={fp('ram')} label="Memory, GB" options={variants.ram} />
          </Cols>

          <FormSelect name={fp('renderer')} label="Renderer" options={variants.renderer} />

          <Cols label="Hardware Noise">
            <FormSwitch name="fingerprint.noiseWebGl" label="WebGL" />
            <FormSwitch name="fingerprint.noiseCanvas" label="Canvas" />
            <FormSwitch name="fingerprint.noiseAudio" label="Audio" />
          </Cols>

          <Cols label="Media Devices">
            <FormNumber name="fingerprint.deviceCameras" label="Cameras" min={0} max={4} size="small" />
            <FormNumber name="fingerprint.deviceMicrophones" label="Microphones" min={0} max={4} size="small" />
            <FormNumber name="fingerprint.deviceSpeakers" label="Speakers" min={0} max={4} size="small" />
          </Cols>
        </TabPane>

        <TabPane key="Cookies" tab="Cookies" forceRender="true">
        </TabPane>

      </Tabs>

      <Cols style={{ textAlign: 'right', marginRight: '8px' }}>
        <FormButton style={{ marginBottom: 0, marginTop: '10px' }}>
          {profileId ? 'Save Profile' : 'Create Profile'}
        </FormButton>
      </Cols>
    </Layout.Form>
  )
}
