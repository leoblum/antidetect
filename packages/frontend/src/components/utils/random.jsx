import { uniqueNamesGenerator, animals, colors } from 'unique-names-generator'

export function getRandomName (length = 2) {
  return uniqueNamesGenerator({
    dictionaries: [colors, animals],
    length,
    style: 'capital',
    separator: ' ',
  })
}
