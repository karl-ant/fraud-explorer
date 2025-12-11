/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Mission Control Color System
      colors: {
        // Background depth layers (dark slate blue - easier on eyes)
        space: {
          deep: '#0d1526',      // Deep slate - body background
          950: '#111a2e',       // Near-deep
          900: '#152036',       // Main container
          800: '#1a2840',       // Panels/cards
          700: '#20304a',       // Interactive surfaces
          600: '#283a58',       // Hover states
          500: '#324668',       // Active states
        },

        // Primary accent - terminal phosphor blue
        terminal: {
          50: '#e6f7ff',
          100: '#b3e5ff',
          200: '#80d4ff',
          300: '#4dc3ff',       // Primary glow
          400: '#26b5ff',
          500: '#00a8ff',       // Primary action
          600: '#0086cc',       // Hover
          700: '#006599',
          800: '#004466',
          900: '#002233',
        },

        // Risk level system - designed for dark backgrounds
        risk: {
          critical: {
            glow: '#ff1744',
            bg: '#1a0a0e',
            surface: '#2d1219',
            border: '#661129',
            text: '#ff6b7a',
          },
          high: {
            glow: '#ff9100',
            bg: '#1a110a',
            surface: '#2d1f12',
            border: '#664422',
            text: '#ffb74d',
          },
          medium: {
            glow: '#ffea00',
            bg: '#1a180a',
            surface: '#2d2912',
            border: '#666622',
            text: '#fff176',
          },
          low: {
            glow: '#00e676',
            bg: '#0a1a12',
            surface: '#122d1f',
            border: '#226644',
            text: '#69f0ae',
          },
        },

        // Transaction status indicators
        status: {
          success: {
            glow: '#00e676',
            bg: '#0a1a12',
            border: '#226644',
            text: '#69f0ae',
          },
          failed: {
            glow: '#ff1744',
            bg: '#1a0a0e',
            border: '#661129',
            text: '#ff6b7a',
          },
          pending: {
            glow: '#ffea00',
            bg: '#1a180a',
            border: '#666622',
            text: '#fff176',
          },
          canceled: {
            glow: '#78909c',
            bg: '#0f1215',
            border: '#37474f',
            text: '#90a4ae',
          },
        },

        // Text hierarchy
        text: {
          primary: '#eceff1',     // High contrast
          secondary: '#90a4ae',   // Dimmed
          tertiary: '#546e7a',    // Subtle
          mono: '#80d4ff',        // Data/code - terminal tint
        },

        // Border system
        border: {
          subtle: '#1e2836',
          DEFAULT: '#283446',
          emphasis: '#3d4f66',
          glow: 'rgba(77, 195, 255, 0.3)',
        },
      },

      // Typography - distinctive mission control fonts
      fontFamily: {
        display: ['Orbitron', 'system-ui', 'sans-serif'],
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'monospace'],
      },

      // Custom shadows with glow effects
      boxShadow: {
        // Terminal glow levels
        'glow-sm': '0 0 8px rgba(77, 195, 255, 0.15)',
        'glow': '0 0 16px rgba(77, 195, 255, 0.25)',
        'glow-lg': '0 0 32px rgba(77, 195, 255, 0.35)',
        'glow-xl': '0 0 48px rgba(77, 195, 255, 0.45)',

        // Risk-level glows
        'glow-critical': '0 0 20px rgba(255, 23, 68, 0.4), 0 0 40px rgba(255, 23, 68, 0.2)',
        'glow-high': '0 0 20px rgba(255, 145, 0, 0.4), 0 0 40px rgba(255, 145, 0, 0.2)',
        'glow-medium': '0 0 20px rgba(255, 234, 0, 0.3), 0 0 40px rgba(255, 234, 0, 0.15)',
        'glow-low': '0 0 20px rgba(0, 230, 118, 0.3), 0 0 40px rgba(0, 230, 118, 0.15)',

        // Panel shadows
        'panel': '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 1px rgba(77, 195, 255, 0.1)',
        'panel-lg': '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 2px rgba(77, 195, 255, 0.15)',
        'panel-inset': 'inset 0 2px 8px rgba(0, 0, 0, 0.4)',

        // Combined effects
        'terminal-input': 'inset 0 2px 6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(77, 195, 255, 0.1)',
      },

      // Animations
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'pulse-critical': 'pulse-critical 2s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 3s ease-in-out infinite',
        'scan-line': 'scan-line 2s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
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
            boxShadow: '0 0 16px rgba(77, 195, 255, 0.25)',
          },
          '50%': {
            boxShadow: '0 0 24px rgba(77, 195, 255, 0.4)',
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
      },

      // Letter spacing for display text
      letterSpacing: {
        'ultra-wide': '0.25em',
      },

      // Grid pattern for background
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(77, 195, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(77, 195, 255, 0.03) 1px, transparent 1px)
        `,
        'grid-dense': `
          linear-gradient(rgba(77, 195, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(77, 195, 255, 0.05) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '24px 24px',
        'grid-dense': '12px 12px',
      },
    },
  },
  plugins: [],
};
