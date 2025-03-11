const path = require('path');
const pixelLight = require(path.join(__dirname, 'src/themes/pixel-light.js'));

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'pixel': '3px 3px 0 0 #000000',
        'pixel-hover': '2px 2px 0 0 #000000',
      },
      letterSpacing: {
        'thick': '0.05em',
        'arcade': '0.1em',
      },
      fontFamily: {
        'pixel': ['"Retro Pixel Cute Mono"', 'monospace'],
        'heading': ['"Retro Pixel Thick"', 'cursive', 'letter-spacing: thick'],
        'arcade': ['"Retro Pixel Arcade"', 'cursive'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        pixel: pixelLight,
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
};
