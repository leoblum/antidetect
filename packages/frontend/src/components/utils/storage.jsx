const storage = {
  get (key, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.log(error)
      return defaultValue
    }
  },

  set (key, value) {
    try {
      if (value instanceof Function) value = value(this.get(key))
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.log(error)
    }
  },
}

export default storage
