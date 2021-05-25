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
