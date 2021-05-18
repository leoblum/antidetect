export function createEmitter () {
  const followers = []

  function follow (fn) {
    followers.push(fn)
    return () => {
      followers.splice(followers.indexOf(fn), 1)
      return null
    }
  }

  function fire (data) {
    for (let fn of followers) fn(data)
  }

  follow.fire = fire
  return follow
}

export function storageGet (key, defaultValue = null) {
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.log(error)
    return defaultValue
  }
}

export function storageSet (key, value) {
  try {
    if (value instanceof Function) value = value(storageGet(key))
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.log(error)
  }
}
