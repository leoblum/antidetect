const fingerprints = require('../data/fingerprints.json')

function randomChoice (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomHardware (os) {
  const values = fingerprints[os]

  return {
    userAgent: randomChoice(values.ua),
    screen: randomChoice(values.screen),
    cpu: randomChoice(values.cpu),
    ram: randomChoice(values.ram),
    renderer: randomChoice(values.renderer),
  }
}

async function get (req, rep) {
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
}

async function variants (req, rep) {
  return rep.done(fingerprints)
}

module.exports = { get, variants }
