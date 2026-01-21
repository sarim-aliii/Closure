const konstaConfig = require('konsta/config');


module.exports = konstaConfig({
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
      }
    },
  },
  plugins: [],
});