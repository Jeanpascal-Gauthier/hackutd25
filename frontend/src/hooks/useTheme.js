import { useState, useEffect } from 'react'

const THEME_STORAGE_KEY = 'datacenter-ops-theme'
const ACCENT_STORAGE_KEY = 'datacenter-ops-accent'

export function useTheme() {
  const [theme, setTheme] = useState('system')
  const [accent, setAccent] = useState('blue')
  const [resolvedTheme, setResolvedTheme] = useState('light')

  useEffect(() => {
    // Load from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'system'
    const savedAccent = localStorage.getItem(ACCENT_STORAGE_KEY) || 'blue'
    
    setTheme(savedTheme)
    setAccent(savedAccent)
    
    // Apply accent
    document.documentElement.setAttribute('data-accent', savedAccent)
    
    // Apply theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === 'system' && systemPrefersDark)
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
      setResolvedTheme('dark')
    } else {
      document.documentElement.classList.remove('dark')
      setResolvedTheme('light')
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (savedTheme === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark')
          setResolvedTheme('dark')
        } else {
          document.documentElement.classList.remove('dark')
          setResolvedTheme('light')
        }
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const updateTheme = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark')
        setResolvedTheme('dark')
      } else {
        document.documentElement.classList.remove('dark')
        setResolvedTheme('light')
      }
    } else {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
        setResolvedTheme('dark')
      } else {
        document.documentElement.classList.remove('dark')
        setResolvedTheme('light')
      }
    }
  }

  const updateAccent = (newAccent) => {
    setAccent(newAccent)
    localStorage.setItem(ACCENT_STORAGE_KEY, newAccent)
    document.documentElement.setAttribute('data-accent', newAccent)
  }

  return { theme, accent, resolvedTheme, updateTheme, updateAccent }
}

