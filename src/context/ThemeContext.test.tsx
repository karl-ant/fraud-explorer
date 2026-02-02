import React, { ReactNode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme, THEME_CONFIGS, ThemeName } from './ThemeContext'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock document.documentElement.dataset
const mockDataset: Record<string, string> = {}
Object.defineProperty(document.documentElement, 'dataset', {
  value: mockDataset,
  writable: true,
  configurable: true,
})

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
    // Reset mock implementations to use the store
    const store: Record<string, string> = {}
    localStorageMock.getItem.mockImplementation((key: string) => store[key] || null)
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      store[key] = value
    })
    // Clear dataset
    Object.keys(mockDataset).forEach(key => delete mockDataset[key])
  })

  describe('THEME_CONFIGS', () => {
    it('should export an array of 3 theme configs', () => {
      expect(THEME_CONFIGS).toHaveLength(3)
    })

    it('should have mission theme config', () => {
      const missionConfig = THEME_CONFIGS.find(c => c.value === 'mission')
      expect(missionConfig).toBeDefined()
      expect(missionConfig?.label).toBe('Mission Control')
      expect(missionConfig?.subtitle).toBe('Cyber-Sec Command')
      expect(missionConfig?.accent).toBe('#00a8ff')
      expect(missionConfig?.icon).toBeDefined()
    })

    it('should have neobank theme config', () => {
      const neobankConfig = THEME_CONFIGS.find(c => c.value === 'neobank')
      expect(neobankConfig).toBeDefined()
      expect(neobankConfig?.label).toBe('Neobank')
      expect(neobankConfig?.subtitle).toBe('Modern Fintech')
      expect(neobankConfig?.accent).toBe('#10b981')
      expect(neobankConfig?.icon).toBeDefined()
    })

    it('should have arctic theme config', () => {
      const arcticConfig = THEME_CONFIGS.find(c => c.value === 'arctic')
      expect(arcticConfig).toBeDefined()
      expect(arcticConfig?.label).toBe('Arctic Intel')
      expect(arcticConfig?.subtitle).toBe('Clean Analytics')
      expect(arcticConfig?.accent).toBe('#4f46e5')
      expect(arcticConfig?.icon).toBeDefined()
    })

    it('should have all required properties for each config', () => {
      THEME_CONFIGS.forEach(config => {
        expect(config).toHaveProperty('value')
        expect(config).toHaveProperty('label')
        expect(config).toHaveProperty('subtitle')
        expect(config).toHaveProperty('icon')
        expect(config).toHaveProperty('accent')
        expect(typeof config.value).toBe('string')
        expect(typeof config.label).toBe('string')
        expect(typeof config.subtitle).toBe('string')
        expect(typeof config.accent).toBe('string')
        // Icon should be a Lucide icon component (function or object)
        expect(config.icon).toBeDefined()
        expect(typeof config.icon === 'function' || typeof config.icon === 'object').toBe(true)
      })
    })
  })

  describe('ThemeProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    it('should initialize with default mission theme when no saved theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('mission')
      expect(result.current.config.value).toBe('mission')
    })

    it('should load saved theme from localStorage on mount', () => {
      localStorageMock.setItem('fraud-explorer-theme', 'neobank')

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('neobank')
      expect(result.current.config.value).toBe('neobank')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('fraud-explorer-theme')
    })

    it('should set document.documentElement.dataset.theme when loading saved theme', () => {
      localStorageMock.setItem('fraud-explorer-theme', 'arctic')

      renderHook(() => useTheme(), { wrapper })

      expect(mockDataset.theme).toBe('arctic')
    })

    it('should ignore invalid saved theme and use default', () => {
      localStorageMock.setItem('fraud-explorer-theme', 'invalid-theme')

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('mission')
      expect(result.current.config.value).toBe('mission')
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('mission')
      expect(result.current.config.value).toBe('mission')
    })

    it('should provide correct config for mission theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.config).toEqual(
        expect.objectContaining({
          value: 'mission',
          label: 'Mission Control',
          subtitle: 'Cyber-Sec Command',
          accent: '#00a8ff',
        })
      )
    })

    it('should provide correct config for neobank theme', () => {
      localStorageMock.getItem.mockReturnValue('neobank')

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.config).toEqual(
        expect.objectContaining({
          value: 'neobank',
          label: 'Neobank',
          subtitle: 'Modern Fintech',
          accent: '#10b981',
        })
      )
    })

    it('should provide correct config for arctic theme', () => {
      localStorageMock.getItem.mockReturnValue('arctic')

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.config).toEqual(
        expect.objectContaining({
          value: 'arctic',
          label: 'Arctic Intel',
          subtitle: 'Clean Analytics',
          accent: '#4f46e5',
        })
      )
    })
  })

  describe('setTheme', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    it('should update theme state when setTheme is called', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('neobank')
      })

      expect(result.current.theme).toBe('neobank')
      expect(result.current.config.value).toBe('neobank')
    })

    it('should persist theme to localStorage when setTheme is called', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('arctic')
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('fraud-explorer-theme', 'arctic')
    })

    it('should set document.documentElement.dataset.theme when setTheme is called', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('neobank')
      })

      expect(mockDataset.theme).toBe('neobank')
    })

    it('should update config when theme changes', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('arctic')
      })

      expect(result.current.config).toEqual(
        expect.objectContaining({
          value: 'arctic',
          label: 'Arctic Intel',
          accent: '#4f46e5',
        })
      )
    })

    it('should handle localStorage errors gracefully when setting theme', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('neobank')
      })

      // Theme should still update in state even if localStorage fails
      expect(result.current.theme).toBe('neobank')
      expect(mockDataset.theme).toBe('neobank')
    })

    it('should allow switching between all theme types', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      // Start with default
      expect(result.current.theme).toBe('mission')

      // Switch to neobank
      act(() => {
        result.current.setTheme('neobank')
      })
      expect(result.current.theme).toBe('neobank')

      // Switch to arctic
      act(() => {
        result.current.setTheme('arctic')
      })
      expect(result.current.theme).toBe('arctic')

      // Switch back to mission
      act(() => {
        result.current.setTheme('mission')
      })
      expect(result.current.theme).toBe('mission')
    })

    it('should maintain referential stability of setTheme function', () => {
      const { result, rerender } = renderHook(() => useTheme(), { wrapper })

      const firstSetTheme = result.current.setTheme

      act(() => {
        result.current.setTheme('neobank')
      })

      rerender()

      expect(result.current.setTheme).toBe(firstSetTheme)
    })
  })

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useTheme())
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleError.mockRestore()
    })

    it('should return context value when used inside ThemeProvider', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current).toHaveProperty('theme')
      expect(result.current).toHaveProperty('setTheme')
      expect(result.current).toHaveProperty('config')
      expect(typeof result.current.theme).toBe('string')
      expect(typeof result.current.setTheme).toBe('function')
      expect(typeof result.current.config).toBe('object')
    })
  })

  describe('localStorage key', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    it('should use correct localStorage key for saving', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      act(() => {
        result.current.setTheme('arctic')
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'fraud-explorer-theme',
        expect.any(String)
      )
    })

    it('should use correct localStorage key for loading', () => {
      localStorageMock.getItem.mockReturnValue('neobank')

      renderHook(() => useTheme(), { wrapper })

      expect(localStorageMock.getItem).toHaveBeenCalledWith('fraud-explorer-theme')
    })
  })

  describe('edge cases', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    it('should handle null localStorage value', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('mission')
    })

    it('should handle empty string localStorage value', () => {
      localStorageMock.getItem.mockReturnValue('')

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('mission')
    })

    it('should handle malformed localStorage value', () => {
      localStorageMock.getItem.mockReturnValue('not-a-valid-theme')

      const { result } = renderHook(() => useTheme(), { wrapper })

      expect(result.current.theme).toBe('mission')
    })

    it('should provide fallback config if theme value is somehow invalid', () => {
      const { result } = renderHook(() => useTheme(), { wrapper })

      // Config should always be defined
      expect(result.current.config).toBeDefined()
      expect(result.current.config.value).toBe('mission')
    })
  })
})
