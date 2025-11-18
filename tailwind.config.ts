import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'pink-light': '#F89ACE', // Rosa - para fondos de imágenes
        'pink-medium': '#FE5CA8', // Chicle - color principal
        'pink-dark': '#E31884', // Magenta - acentos
        'pink-bright': '#FC46AB', // Fucsia - botones destacados
        'green-accent': '#56763F', // Verde hojas - acentos naturales
        'rose-light': '#FDF2F8', // Fondo muy claro
        'rose-medium': '#FBCFE8', // Fondo medio
      },
      fontFamily: {
        'cute': ['Comic Sans MS', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'heart-beat': 'heartbeat 1.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
