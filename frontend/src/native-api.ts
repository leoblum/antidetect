window.addEventListener('pywebviewready', () => console.log(12))

declare global {
  interface Window {
    pywebview: {
      api: any
    }
  }
}

export default {
  get api () { return window?.pywebview?.api },

  async chrome_start (profileId: string) { return await this.api.chrome_start(profileId) },
  async chrome_stop (profileId: string) { return await this.api.chrome_stop(profileId) },
}
