declare global {
  interface Window {
    pywebview: {
      api: any
    }
  }
}

window.addEventListener('pywebviewready', () => console.log(12))

const api = {
  get api () {
    return window?.pywebview?.api ?? {}
  },

  async init () {
    console.log(await this.api.init(12))
  },
}

export default api
