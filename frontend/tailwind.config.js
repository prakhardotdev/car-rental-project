/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary dark luxury palette
        night: {
          50:  '#eef0f5',
          100: '#c9cdd8',
          200: '#a3aabc',
          300: '#7d87a0',
          400: '#576484',
          500: '#314168',
          600: '#1e2d4f',
          700: '#0f1a38',
          800: '#080e21',
          900: '#04070f',
        },
        // Gold accent
        gold: {
          50:  '#fdf8ed',
          100: '#f7e8c0',
          200: '#f0d893',
          300: '#e9c866',
          400: '#e2b839',
          500: '#c8a232',
          600: '#a4832a',
          700: '#7e6420',
          800: '#584515',
          900: '#32260b',
        },
        // Accent blue
        azure: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"Outfit"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl':  ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg':  ['3rem',    { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md':  ['2.25rem', { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        'display-sm':  ['1.875rem',{ lineHeight: '1.2' }],
      },
      backgroundImage: {
        'hero-gradient':  'linear-gradient(135deg, #04070f 0%, #0f1a38 50%, #1e2d4f 100%)',
        'card-gradient':  'linear-gradient(180deg, rgba(8,14,33,0) 0%, rgba(8,14,33,0.95) 100%)',
        'gold-gradient':  'linear-gradient(135deg, #c8a232 0%, #e9c866 50%, #a4832a 100%)',
        'dark-gradient':  'linear-gradient(180deg, transparent 0%, #04070f 100%)',
        'glass':          'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'gold':   '0 0 30px rgba(200, 162, 50, 0.3)',
        'card':   '0 8px 32px rgba(0,0,0,0.4)',
        'glass':  '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glow':   '0 0 60px rgba(200, 162, 50, 0.15)',
        'inner-gold': 'inset 0 1px 0 rgba(200,162,50,0.2)',
      },
      animation: {
        'fade-up':     'fadeUp 0.6s ease forwards',
        'fade-in':     'fadeIn 0.4s ease forwards',
        'slide-right': 'slideRight 0.5s ease forwards',
        'pulse-gold':  'pulseGold 2s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
        'shimmer':     'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200,162,50,0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(200,162,50,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
