import { useState, useReducer, useEffect } from 'react'

type AsyncCb<T> = () => Promise<T>
type DataT<T> = T | undefined
type Result<T> = [DataT<T>, boolean, () => void]

export default function useGetData<T> (source: AsyncCb<T>): Result<T> {
  const [data, setData] = useState<DataT<T>>()
  const [loading, setLoading] = useState(true)
  const [counter, dispatch] = useReducer(x => x + 1, 0)

  useEffect(() => {
    let didCancel = false

    async function load () {
      setLoading(true)
      const data = await source()
      if (didCancel) return

      setData(data)
      setLoading(false)
    }

    load()
    return () => { didCancel = true }
  }, [counter])

  return [data, loading, dispatch]
}
