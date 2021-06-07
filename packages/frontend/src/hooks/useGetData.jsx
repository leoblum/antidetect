import { useState, useReducer, useEffect } from 'react'

export const wait = t => new Promise(resolve => setTimeout(resolve, t))

export default function useGetData (source) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [counter, dispatch] = useReducer(x => x + 1, 0)

  useEffect(async () => {
    setLoading(true)
    // await Promise.all([setData(await source()), wait(100)])
    setData(await source())
    setLoading(false)
  }, [counter])

  return [data, loading, dispatch]
}
