'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Radar, Landmark, Snowflake, LucideIcon } from 'lucide-react'

export type ThemeName = 'mission' | 'neobank' | 'arctic'

interface ThemeConfig {
  value: ThemeName
  label: string
  subtitle: string
  icon: LucideIcon
  accent: string
}

export const THEME_CONFIGS: ThemeConfig[] = [
  { value: 'mission', label: 'Mission Control', subtitle: 'Cyber-Sec Command', icon: Radar, accent: '#00a8ff' },
  { value: 'neobank', label: 'Neobank', subtitle: 'Modern Fintech', icon: Landmark, accent: '#10b981' },
  { value: 'arctic', label: 'Arctic Intel', subtitle: 'Clean Analytics', icon: Snowflake, accent: '#4f46e5' },
]

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  config: ThemeConfig
}

const STORAGE_KEY = 'fraud-explorer-theme'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('mission')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null
      if (saved && THEME_CONFIGS.some(c => c.value === saved)) {
        setThemeState(saved)
        document.documentElement.dataset.theme = saved
      }
    } catch {}
  }, [])

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme)
    document.documentElement.dataset.theme = newTheme
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {}
  }, [])

  const config = THEME_CONFIGS.find(c => c.value === theme) || THEME_CONFIGS[0]

  return (
    <ThemeContext.Provider value={{ theme, setTheme, config }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
