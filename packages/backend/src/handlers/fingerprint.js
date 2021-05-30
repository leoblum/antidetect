const fingerprints = require('../data/fingerprints.json')

function randomChoice (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomFingerprint (os) {
  const values = fingerprints[os]

  return {
    os: os,
    userAgent: randomChoice(values.ua),
    screen: randomChoice(values.screen),
    cpu: randomChoice(values.cpu),
    ram: randomChoice(values.ram),
    renderer: randomChoice(values.renderer),

    noiseWebGl: true,
    noiseCanvas: false,
    noiseAudio: true,

    deviceCameras: 1,
    deviceMicrophones: 1,
    deviceSpeakers: 1,
  }
}

async function get (req, rep) {
  return rep.done({ win: randomFingerprint('win'), mac: randomFingerprint('mac') })
}

async function variants (req, rep) {
  return rep.done(fingerprints)
}

module.exports = { get, variants }
