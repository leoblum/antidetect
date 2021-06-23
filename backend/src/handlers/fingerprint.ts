import fp from 'fastify-plugin'

import fingerprints from './../data/fingerprints.json'
import { get } from './abc'

function randomChoice<T> (arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomHardware (os: 'win' | 'mac') {
  const values = fingerprints[os]

  return {
    userAgent: randomChoice(values.ua),
    screen: randomChoice(values.screen),
    cpu: randomChoice(values.cpu),
    ram: randomChoice(values.ram),
    renderer: randomChoice(values.renderer),
  }
}

export default fp(async srv => {
  get(srv, '/fingerprint', null, async (req, rep) => {
    const acceptLanguage = (req.headers['accept-language'] || '')
      .split(',').map(x => x.split(';')[0]).filter(x => x.length > 0).join(',') || null

    const fingerprint = {
      os: randomChoice(['win', 'mac']),

      win: randomHardware('win'),
      mac: randomHardware('mac'),

      noiseWebGl: true,
      noiseCanvas: false,
      noiseAudio: true,

      deviceCameras: 1,
      deviceMicrophones: 1,
      deviceSpeakers: 1,

      languages: { mode: 'ip', value: acceptLanguage },
      timezone: { mode: 'ip' },
      geolocation: { mode: 'ip' },
    }

    return rep.done({ fingerprint })
  })

  get(srv, '/fingerprint/options', null, async (req, rep) => {
    return rep.done(fingerprints)
  })
})
