import pixelLight from "./src/themes/pixel-light.js";
import pixelOrange from "./src/themes/pixel-orange.js";

/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    boxShadow: {
      'pixel': '3px 3px 0 0 #000000',
      'pixel-hover': '2px 2px 0 0 #000000',
    },
    letterSpacing: {
      'thick': '0.05em', // 字间距
      'arcade': '0.1em', // 标题字间距
    },
    fontFamily: {
      'pixel': ['"Retro Pixel Cute Mono"', 'monospace'], // 像素风格字体
      'heading': ['"Retro Pixel Thick"', 'cursive', 'letter-spacing: thick'], // 像素风格字体
      'arcade': ['"Retro Pixel Arcade"', 'cursive'], // 标题字体
    },
  },
};
export const plugins = [require("daisyui")];
export const daisyui = {
  themes: [
    {
      pixel: pixelLight,
    },
    // {
    //   skypixel: pixelOrange,
    // },
  ],
  // darkTheme: "skypixel",
  base: true,
  styled: true,
  utils: true,
};
