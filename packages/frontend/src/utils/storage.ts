const storage = {
  get (key: string, defaultValue = null) {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.log(error)
      return defaultValue
    }
  },

  set (key: string, value: any) {
    try {
      if (value instanceof Function) value = value(this.get(key))
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.log(error)
    }
  },
}

export default storage
