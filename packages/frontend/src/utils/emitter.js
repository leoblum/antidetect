export default function createEmitter () {
  const followers = []

  function follow (fn) {
    followers.push(fn)
    return () => {
      followers.splice(followers.indexOf(fn), 1)
      return null
    }
  }

  function fire (data) {
    for (const fn of followers) fn(data)
  }

  follow.fire = fire
  return follow
}
