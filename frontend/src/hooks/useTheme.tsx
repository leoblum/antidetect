import React, { createContext, useContext, useState, useEffect } from 'react'

import storage from '@/common/storage'
import dark from '@/theme-dark.theme.less'
import light from '@/theme-light.theme.less'
import { Callback } from '@/types'

interface Theme { use: Callback, unuse: Callback }
interface MapOfThemes { [key: string]: Theme }

const themes: MapOfThemes = { dark, light }
const LSKey = 'app-theme'

function setLessTheme (name: string) {
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

type ThemeContext = { theme: string, toggleTheme: Callback }
const defaultContext = { theme: 'none', toggleTheme: () => console.log('ThemeContext is not set!') }

const themeContext = createContext<ThemeContext>(defaultContext)
const useTheme = () => useContext(themeContext)

function useProvideTheme () {
  const [theme, setTheme] = useState(storage.get(LSKey, 'light'))
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  useEffect(() => setLessTheme(theme), [theme])
  return { theme, toggleTheme }
}

function Provide ({ children }: { children: JSX.Element }) {
  const theme = useProvideTheme()
  return <themeContext.Provider value={theme}>{children}</themeContext.Provider>
}

useTheme.Provide = Provide
export default useTheme
