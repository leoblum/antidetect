import { useState, useReducer, useEffect } from 'react'

import { Callback, AsyncCallback } from '@/types'

export default function useGetData<T> (source: AsyncCallback<T>): [T | undefined, boolean, Callback] {
  const [data, setData] = useState<T | undefined>()
  const [loading, setLoading] = useState(true)
  const [counter, dispatch] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    let didCancel = false

    async function load () {
      setLoading(true)
      const data = await source()
      if (didCancel) return

      setData(data)
      setLoading(false)
    }

    load().catch(() => null)
    return () => { didCancel = true }
  }, [counter])

  return [data, loading, dispatch]
}
