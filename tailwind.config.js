/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FFF8F3',
        border: '#EADDD4',
        error: '#B42318',
        foreground: '#2A211C',
        mutedForeground: '#75675E',
        primary: '#E85D3F',
        primaryForeground: '#FFFFFF',
        success: '#21865A',
        surface: '#FFFFFF',
        surfaceSecondary: '#F7ECE5',
        warning: '#B76E00',
      },
    },
  },
  plugins: [],
};
