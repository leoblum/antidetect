import {v4 as uuid4} from 'uuid'

function generateProfile (index = 0) {
  return {
    name: index === 0 ? 'New Profile' : `New Profile ${index + 1}`,
    os: navigator.appVersion.includes('Mac') ? 'mac' : 'win',
    proxyType: 'none',
    proxySettings: null,
    timezoneFillFromIP: true,
    timezoneName: null,
    timezoneOffset: null,
    webrtcMode: 'altered',
    webrtcFillFromIP: true,
    webrtcPublicIP: '',
    geolocationMode: 'prompt',
    geolocationFillFromIP: true,
    geolocationLatitude: null,
    geolocationLongitude: null,
    navigatorUserAgent: navigator.userAgent,
    navigatorLanguages: navigator.languages,
    navigatorPlatform: 'MacIntel',
    navigatorHardwareConcurrency: 4,
    navigatorDeviceMemory: 8,
    doNotTrack: 'unset',
    fontsMasking: true,
    fontsList: ['Arial', 'Tahoma'],
    mediaDevicesMasking: true,
    mediaDevicesVideoInputs: 1,
    mediaDevicesAudioInputs: 1,
    mediaDevicesAudioOutputs: 1,
    mediaDevices: [],
    webglParametersMasking: true,
    webglVendor: 'Best Video Card',
    webglRendererName: 'Best Video Card XXX',
    webglRendererNoise: false,
    webglParams: {},
    webglParams2: {},
    canvasNoise: false,
    audioNoise: false,
  }
}

class AppModel {
  constructor () {
    this.profiles = Array.from(new Array(10)).map((_, idx) => Object.assign({
      _id: uuid4(),
    }, generateProfile(idx * 2)))
  }

  getProfileById (id) {
    let pretender = this.profiles.filter(x => x?._id.toString() === id.toString())
    return pretender.length > 0 ? pretender[0] : null
  }

  getProfileNextCount () {
    return this.profiles.length + 1
  }

  getNewFingerprint () {
    return generateProfile()
  }

  deleteProfile (profileId) {
    this.profiles = this.profiles.filter(x => x._id !== profileId)
  }

  cloneProfile (profileId) {
    let oldProfile = this.getProfileById(profileId)
    let newProfile = JSON.parse(JSON.stringify(oldProfile))
    newProfile.name += ' Copy'
    newProfile._id += '_copy'
    this.profiles = [newProfile].concat(this.profiles)
  }
}

const appModel = new AppModel()
export default appModel
