'use client'

import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ]

  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-bg-tertiary border border-border-primary">
      {options.map(({ value, icon: Icon, label }) => (
        <motion.button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            relative p-2 rounded-full transition-colors
            ${theme === value
              ? 'text-accent'
              : 'text-text-tertiary hover:text-text-secondary'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Switch to ${label} theme`}
        >
          {theme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 bg-accent/10 rounded-full border border-accent/20"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <Icon className="h-4 w-4 relative z-10" />
        </motion.button>
      ))}
    </div>
  )
}
