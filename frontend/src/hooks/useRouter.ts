import { useMemo } from 'react'
import { useParams, useLocation, useHistory, useRouteMatch } from 'react-router-dom'

// https://usehooks.com/useRouter/

export default function useRouter () {
  const params = useParams<{ [key: string]: string | undefined }>() // todo: pass full type here
  const location = useLocation()
  const history = useHistory()
  const match = useRouteMatch()
  return useMemo(() => {
    return {
      push: history.push,
      replace: history.replace,
      pathname: location.pathname,
      params,
      match,
      location,
      history,
    }
  }, [params, match, location, history])
}
