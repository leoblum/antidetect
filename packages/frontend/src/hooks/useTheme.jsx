import React, { createContext, useContext, useState, useEffect } from 'react'

import dark from '@/theme-dark.theme.less'
import light from '@/theme-light.theme.less'
import storage from '@/utils/storage'

const themes = { dark, light }
const LSKey = 'app-theme'

function setLessTheme (name) {
  const body = document.body
  const disabled = Object.keys(themes).filter(x => x !== name)

  body.classList.add(`theme-${name}`)
  themes[name].use()

  for (const name of disabled) {
    body.classList.remove(`theme-${name}`)
    themes[name].unuse()
  }

  storage.set(LSKey, name)
}

const themeContext = createContext(null)
const useTheme = () => useContext(themeContext)

function Provide ({ children }) {
  const [theme, setTheme] = useState(storage.get(LSKey, 'light'))
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  useEffect(() => setLessTheme(theme), [theme])

  const context = { theme, toggleTheme, setTheme }
  return <themeContext.Provider value={context}>{children}</themeContext.Provider>
}

useTheme.Provide = Provide
export default useTheme
