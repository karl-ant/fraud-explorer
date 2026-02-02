/** @type {import('tailwindcss').Config} */

// Helper: reference a CSS variable as an rgb color with Tailwind opacity support
const rgb = (v) => `rgb(var(--${v}) / <alpha-value>)`

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          deep: rgb('space-deep'),
          950: rgb('space-950'),
          900: rgb('space-900'),
          800: rgb('space-800'),
          700: rgb('space-700'),
          600: rgb('space-600'),
          500: rgb('space-500'),
        },

        terminal: {
          50: rgb('terminal-50'),
          100: rgb('terminal-100'),
          200: rgb('terminal-200'),
          300: rgb('terminal-300'),
          400: rgb('terminal-400'),
          500: rgb('terminal-500'),
          600: rgb('terminal-600'),
          700: rgb('terminal-700'),
          800: rgb('terminal-800'),
          900: rgb('terminal-900'),
        },

        risk: {
          critical: {
            glow: rgb('risk-critical-glow'),
            bg: rgb('risk-critical-bg'),
            surface: rgb('risk-critical-surface'),
            border: rgb('risk-critical-border'),
            text: rgb('risk-critical-text'),
          },
          high: {
            glow: rgb('risk-high-glow'),
            bg: rgb('risk-high-bg'),
            surface: rgb('risk-high-surface'),
            border: rgb('risk-high-border'),
            text: rgb('risk-high-text'),
          },
          medium: {
            glow: rgb('risk-medium-glow'),
            bg: rgb('risk-medium-bg'),
            surface: rgb('risk-medium-surface'),
            border: rgb('risk-medium-border'),
            text: rgb('risk-medium-text'),
          },
          low: {
            glow: rgb('risk-low-glow'),
            bg: rgb('risk-low-bg'),
            surface: rgb('risk-low-surface'),
            border: rgb('risk-low-border'),
            text: rgb('risk-low-text'),
          },
        },

        status: {
          success: {
            glow: rgb('status-success-glow'),
            bg: rgb('status-success-bg'),
            border: rgb('status-success-border'),
            text: rgb('status-success-text'),
          },
          failed: {
            glow: rgb('status-failed-glow'),
            bg: rgb('status-failed-bg'),
            border: rgb('status-failed-border'),
            text: rgb('status-failed-text'),
          },
          pending: {
            glow: rgb('status-pending-glow'),
            bg: rgb('status-pending-bg'),
            border: rgb('status-pending-border'),
            text: rgb('status-pending-text'),
          },
          canceled: {
            glow: rgb('status-canceled-glow'),
            bg: rgb('status-canceled-bg'),
            border: rgb('status-canceled-border'),
            text: rgb('status-canceled-text'),
          },
        },

        text: {
          primary: rgb('text-primary'),
          secondary: rgb('text-secondary'),
          tertiary: rgb('text-tertiary'),
          mono: rgb('text-mono'),
        },

        border: {
          subtle: rgb('border-subtle'),
          DEFAULT: rgb('border-default'),
          emphasis: rgb('border-emphasis'),
          glow: 'var(--border-glow)',
        },
      },

      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Consolas', 'monospace'],
      },

      boxShadow: {
        'glow-sm': '0 0 8px var(--glow-color-sm)',
        'glow': '0 0 16px var(--glow-color)',
        'glow-lg': '0 0 32px var(--glow-color-lg)',
        'glow-xl': '0 0 48px var(--glow-color-xl)',

        'glow-critical': '0 0 20px rgba(255, 23, 68, 0.4), 0 0 40px rgba(255, 23, 68, 0.2)',
        'glow-high': '0 0 20px rgba(255, 145, 0, 0.4), 0 0 40px rgba(255, 145, 0, 0.2)',
        'glow-medium': '0 0 20px rgba(255, 234, 0, 0.3), 0 0 40px rgba(255, 234, 0, 0.15)',
        'glow-low': '0 0 20px rgba(0, 230, 118, 0.3), 0 0 40px rgba(0, 230, 118, 0.15)',

        'panel': '0 4px 16px var(--panel-shadow), 0 0 1px var(--panel-glow)',
        'panel-lg': '0 8px 32px var(--panel-shadow-lg), 0 0 2px var(--panel-glow)',
        'panel-inset': 'inset 0 2px 8px var(--panel-shadow-inset)',

        'terminal-input': 'inset 0 2px 6px var(--input-shadow), 0 0 0 1px var(--input-ring)',
      },

      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'pulse-critical': 'pulse-critical 2s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 3s ease-in-out infinite',
        'scan-line': 'scan-line 2s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
      },

      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'pulse-critical': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(255, 23, 68, 0.4), 0 0 40px rgba(255, 23, 68, 0.2)',
          },
          '50%': {
            opacity: '0.85',
            boxShadow: '0 0 30px rgba(255, 23, 68, 0.6), 0 0 60px rgba(255, 23, 68, 0.3)',
          },
        },
        'glow-breathe': {
          '0%, 100%': {
            boxShadow: '0 0 16px var(--glow-color)',
          },
          '50%': {
            boxShadow: '0 0 24px var(--glow-color-lg)',
          },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },

      letterSpacing: {
        'ultra-wide': '0.25em',
      },

      backgroundImage: {
        'grid-pattern': 'var(--grid-pattern)',
        'grid-dense': 'var(--grid-dense)',
      },
      backgroundSize: {
        'grid': '24px 24px',
        'grid-dense': '12px 12px',
      },
    },
  },
  plugins: [],
};
