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
        elo: {
          blue: "#003366", // Azul padrão EloGroup
          light: "#004A99",
        },
        brazil: {
          green: "#009739",
          yellow: "#FFDF00",
          blue: "#002776",
        }
      },
    },
  },
  plugins: [],
};
export default config;