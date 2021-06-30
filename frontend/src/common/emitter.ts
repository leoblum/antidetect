// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type Callback<T = void> = (...args: any) => T

interface Emitter {
  (fn: Callback): Callback
  fire: (data: any) => void
}

export default function createEmitter (): Emitter {
  const followers: Callback[] = []

  function follow (fn: Callback): Callback {
    followers.push(fn)
    return function unfollow () {
      followers.splice(followers.indexOf(fn), 1)
    }
  }

  function fire (data: any) {
    for (const fn of followers) fn(data)
  }

  follow.fire = fire
  return follow
}
