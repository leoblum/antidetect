import { Form, Tabs, Skeleton, Button } from 'antd'
import { getAllTimezones } from 'countries-and-timezones'
import natsort from 'natsort'
import React, { useEffect, useState } from 'react'

import backend from '@/backend'
import { FormSwitch, FormSelect, FormNumber, FormButton, Cols, FormInput, FormTextArea, FormRadio } from '@/components/FormItems'
import { withFormLayout } from '@/components/layout'
// import Notify from '@/components/Notify'
import { useRouter } from '@/hooks'
import { iFingerprintOptions, iProfileBase, iProxy, PossibleOS } from '@/types'
import merge from '@/utils/merge'
import { toString, arrToObj, Stringify } from '@/utils/object'

import { ProxyFields } from './EditProxy'

type ProfileInForm = Stringify<iProfileBase>
type State = { profile: iProfileBase, store: ProfileInForm, options: any }

function getTimezones () {
  const sorter = natsort()
  const timezones = Object.values(getAllTimezones())
    .filter(x => !x.name.startsWith('Etc'))
    .sort((a, b) => sorter(a.name, b.name))
    .sort((a, b) => sorter(a.utcOffsetStr, b.utcOffsetStr))
  return timezones
}

function getOptions (p: iProxy[], variants: iFingerprintOptions) {
  const ip = { ip: 'Bases on IP', manual: 'Manual' }
  const os = { win: 'Windows', mac: 'MacOS' }
  const profileProxy = { none: 'No Proxy', saved: 'From List', manual: 'Manual' }
  const [languages, timezone, geolocation] = [ip, ip, ip]

  const proxies = arrToObj(p, x => [x._id, x.name])
  const timezones = arrToObj(getTimezones(), x => [x.name, `(${x.utcOffsetStr}) ${x.name}`])

  console.info('FORM OPTIONS UPDATED')
  return { os, proxies, timezones, profileProxy, languages, timezone, geolocation, variants }
}

const getInitialState = async (profileId?: string) => {
  const [remote, fingerprint, variants, proxies] = await Promise.all([
    profileId !== undefined ? await backend.profiles.get(profileId) : undefined,
    backend.fingerprint.get(),
    backend.fingerprint.variants(),
    backend.proxies.list(),
  ])

  let profile: iProfileBase = { fingerprint, name: '', proxy: null }
  if (remote !== undefined) {
    // remove proxyId from profile if proxyId not in proxies
    if (remote.proxy != null && (proxies.find(x => x._id === remote.proxy) != null)) remote.proxy = null
    profile = merge(profile, remote)
  }

  // if (profile?.proxy && !(profile.proxy in proxies)) profile.proxy = null
  // const proxyType = (profile != null) && profile.proxy ? 'saved' : 'none'
  // const createProxy = { type: 'socks5' }

  // if (store.proxy === null) store.proxy = proxies.length > 0 ? proxies[0]._id : null

  const options = getOptions(proxies, variants)
  const store = toString(profile)
  const state: State = { profile, store, options }
  return state
}

async function getSingleFingerprint (os: PossibleOS) {
  const data = await backend.fingerprint.get()
  return { fingerprint: { [os]: data[os] } }
}

function EditProfile () {
  const router = useRouter()
  const profileId = router.params?.profileId

  const [state, setState] = useState<State>()
  const [form] = Form.useForm()

  useEffect(() => { getInitialState(profileId).then(setState) }, [profileId])
  useEffect(() => { (state !== undefined) && form.resetFields() }, [state?.profile.fingerprint.os])

  if (state === undefined) return <Skeleton active />

  const { store, options } = state
  const fp = store.fingerprint
  const os = fp.os as PossibleOS
  const variants = options.variants[os]

  const randomize = async () => form.setFieldsValue(await getSingleFingerprint(os))
  const extraContent = <Button size="small" onClick={randomize}>Randomize</Button>

  function onChange (value: any) {
    setState(merge(state, { store: { ...value } }))
  }

  async function submit (values: ProfileInForm) {
    values = toString(values)
    console.log(values)

    const data: iProfileBase = merge(values, {
      fingerprint: {
        [values.fingerprint.os as PossibleOS]: {
          cpu: parseInt(values.fingerprint.win.cpu, 10),
          ram: parseInt(values.fingerprint.win.ram, 10),
        },
        noiseWebGl: values.fingerprint.noiseWebGl === 'true',
        noiseCanvas: values.fingerprint.noiseCanvas === 'true',
        noiseAudio: values.fingerprint.noiseAudio === 'true',
        deviceCameras: parseInt(values.fingerprint.deviceCameras, 10),
        deviceMicrophones: parseInt(values.fingerprint.deviceMicrophones, 10),
        deviceSpeakers: parseInt(values.fingerprint.deviceSpeakers, 10),
      },
    })

    console.log(data)

    // {
    //   [values.fingerprint.os as PossibleOS]: {
    //     cpu: parseInt(values.fingerprint.win.cpu, 10),
    //     ram: parseInt(values.fingerprint.win.ram, 10),
    //   },
    //   // noiseWebGl: values.fingerprint.noiseWebGl === 'true',
    //   noiseCanvas: values.fingerprint.noiseCanvas === 'true',
    //   noiseAudio: values.fingerprint.noiseAudio === 'true',
    //   deviceCameras: parseInt(values.fingerprint.deviceCameras, 10),
    //   deviceMicrophones: parseInt(values.fingerprint.deviceMicrophones, 10),
    //   deviceSpeakers: parseInt(values.fingerprint.deviceSpeakers, 10),
    // }

    // const proxyType = values.proxyType
    // delete values.proxyType

    // const proxy = proxyType === 'saved' ? values.proxy : null
    // const createProxy = proxyType === 'manual' ? values.createProxy : null
    // merge(values, { createProxy, proxy })

    // const rep = await backend.profiles.save(profileId, values)

    // todo:
    // if (!rep.success) return Notify.error('Profile not saved. Try again.')
    // Notify.success('Profile saved!')
    // router.replace('/profiles')
  }

  function ref (name: string, useOS = false) {
    return ['fingerprint', useOS ? os : '', name].join('.').split('.').filter(x => x.length > 0)
  }

  const TabPane = Tabs.TabPane
  return (
    <Form layout="vertical" form={form} initialValues={store} onValuesChange={onChange} onFinish={submit}>
      <Tabs size="small" tabBarExtraContent={extraContent}>
        <TabPane key="General" tab="General" forceRender={true}>
          <FormInput name="name" label="Profile Name" placeholder="Enter profile name" rules={[{ required: true }]} />
          <FormRadio name={ref('os')} label="Operation System" options={options.os} />
          <FormInput name="startPage" label="Start Page" placeholder="https://google.com" />
        </TabPane>

        <TabPane key="Connection" tab="Connection" forceRender={true}>
          <ProxyFields prefix="proxy" />
          {/* <FormRadio name="proxyType" label="Proxy" options={options.profileProxy} />
          {profile.proxyType === 'manual' && (
            <ProxyFields/>
          )}
          {profile.proxyType === 'saved' && (
            <FormSelect name="proxy" options={options.proxies} placeholder="Tap to select" />
          )} */}
        </TabPane>

        <TabPane key="Navigator" tab="Navigator" forceRender={true}>
          <FormTextArea name={ref('userAgent', true)} label="User Agent" />
          <FormSelect name={ref('screen', true)} label="Screen Resolution" options={variants.screen} />

          <FormRadio name={ref('languages.mode')} label="Languages" options={options.languages} />
          <Cols condition={fp.languages.mode === 'manual'}>
            <FormInput name={ref('languages.value')} rules={[{ required: true }]} />
          </Cols>

          <FormRadio name={ref('timezone.mode')} label="Timezone" options={options.timezone} />
          <Cols condition={fp.timezone.mode === 'manual'}>
            <FormSelect name={ref('timezone.value')} options={options.timezones} />
          </Cols>

          <FormRadio name={ref('geolocation.mode')} label="Geolocation" options={options.geolocation} />
          <Cols condition={fp.geolocation.mode === 'manual'}>
            <FormInput name={ref('geolocation.latitude')} label="Latitude" rules={[{ required: true }]} />
            <FormInput name={ref('geolocation.longitude')} label="Longitude" rules={[{ required: true }]} />
          </Cols>
        </TabPane>

        <TabPane key="Hardware" tab="Hardware" forceRender={true}>
          <Cols>
            <FormSelect name={ref('cpu', true)} label="CPU Cores" options={variants.cpu} />
            <FormSelect name={ref('ram', true)} label="Memory, GB" options={variants.ram} />
          </Cols>

          <FormSelect name={ref('renderer', true)} label="Renderer" options={variants.renderer} />

          <Cols label="Hardware Noise">
            <FormSwitch name={ref('noiseWebGl')} label="WebGL" />
            <FormSwitch name={ref('noiseCanvas')} label="Canvas" />
            <FormSwitch name={ref('noiseAudio')} label="Audio" />
          </Cols>

          <Cols label="Media Devices">
            <FormNumber name={ref('deviceCameras')} label="Cameras" min={0} max={4} />
            <FormNumber name={ref('deviceMicrophones')} label="Microphones" min={0} max={4} />
            <FormNumber name={ref('deviceSpeakers')} label="Speakers" min={0} max={4} />
          </Cols>
        </TabPane>

        <TabPane key="Cookies" tab="Cookies" forceRender={true}>
        </TabPane>

      </Tabs>

      <Cols style={{ textAlign: 'right', marginRight: '8px' }}>
        <FormButton style={{ marginBottom: 0, marginTop: '10px' }}>
          {(profileId != null) ? 'Save Profile' : 'Create Profile'}
        </FormButton>
      </Cols>
    </Form>
  )
}

export default withFormLayout(EditProfile)
