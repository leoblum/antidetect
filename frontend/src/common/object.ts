/* eslint-disable @typescript-eslint/ban-types */

export const isUndefined = <T>(t: T): t is T & undefined => t === undefined
export const isNull = <T>(t: T): t is T & null => t === null
export const isNil = <T>(t: T): t is T & (null | undefined) => t == null

export const isObject = <T>(t: T): t is T & object => typeof t === 'object' && t !== null

type Entries<T> = Array<{ [K in keyof T]: [K, T[K]] }[keyof T]>
export const entries = <T>(obj: T): Entries<T> => Object.entries(obj) as any

export type Stringify<T> = {
  [K in keyof T]: T[K] extends object | null | undefined ? Stringify<T[K]> : string
}

export const toString = <T extends object> (obj: T): Stringify<T> => Object.fromEntries(Object.entries(obj)
  .map(([k, v]) => [k, isObject(v) ? toString(v) : (v == null ? '' : (v as any).toString())] as const)) as any

export function arrToObj<T> (arr: T[], fn: (x: T) => [string, string]): Record<string, string> {
  return arr.reduce((prv, cur) => {
    const [k, v] = fn(cur)
    return Object.assign(prv, { [k]: v })
  }, {})
}
