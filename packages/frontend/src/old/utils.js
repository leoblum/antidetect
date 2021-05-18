import TimezonesSource from './data/timezones.json'

export const Timezones = TimezonesSource.map(x => {
  let [countryCode, country, timezone, offset] = x
  let title = `${country} ${offset}`

  let offsetMinutes = offset.split(':').map(x => parseInt(x, 10))
  offsetMinutes = offsetMinutes[0] * 60 + offsetMinutes[1] * (offset[0] === '-' ? -1 : 1)
  return {countryCode, country, timezone, offset, offsetMinutes, title}
})

export function getTimezoneByName (timezoneName) {
  let timezone = Timezones.filter(x => x.timezone === timezoneName)
  return timezone.length > 0 ? timezone[0] : null
}
