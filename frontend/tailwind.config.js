export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4500', // Neon Orange-Red (Gen Z style)
          hover: '#FF6B00',
          glow: 'rgba(255, 69, 0, 0.6)'
        },
        secondary: {
          DEFAULT: '#00F0FF', // Cyber Blue accent
          dim: '#00C8D6'
        },
        dark: {
          950: '#050505', // Ultra dark
          900: '#0a0a0a', // Deep black
          800: '#121212', // Material dark
          700: '#1e1e1e',
          600: '#2d2d2d'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'], // Outfit is more trendy
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Cal Sans', 'Inter', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      boxShadow: {
        'neon': '0 0 10px rgba(255, 69, 0, 0.5), 0 0 20px rgba(255, 69, 0, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #FF4500 0deg, #00F0FF 180deg, #FF4500 360deg)'
      }
    }
  },
  plugins: []
};
