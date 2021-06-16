import natsort from 'natsort'

export const getSorter = <K extends string>(key: K, desc = false) => {
  const sorter = natsort({ desc })
  return <T extends Record<K, string>>(a: T, b: T) => sorter(a[key], b[key])
}

export const filter = <T extends { _id: string }>(items: T[] = [], selected: string[]) => {
  return items.filter(x => selected.includes(x._id))
}
