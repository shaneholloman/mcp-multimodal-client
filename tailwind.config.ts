import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: "hsl(28, 91%, 95%)",
          100: "hsl(28, 91%, 90%)",
          200: "hsl(28, 91%, 80%)",
          300: "hsl(28, 91%, 70%)",
          400: "hsl(28, 91%, 65%)",
          500: "hsl(28, 91%, 60%)",
          600: "hsl(28, 91%, 50%)",
          700: "hsl(28, 91%, 40%)",
          800: "hsl(28, 91%, 30%)",
          900: "hsl(28, 91%, 20%)",
          950: "hsl(28, 91%, 10%)",
        },
      },
      backgroundOpacity: {
        "85": "0.85",
      },

      keyframes: {
        "scrolling-banner": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-50% - var(--gap)/2))" },
        },
        "scrolling-banner-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-50% - var(--gap)/2))" },
        },
      },
      animation: {
        "scrolling-banner": "scrolling-banner var(--duration) linear infinite",
        "scrolling-banner-vertical":
          "scrolling-banner-vertical var(--duration) linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        zepto: ["Zepto", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      addCommonColors: true,
      defaultTheme: "dark",
      defaultExtendTheme: "dark",
      layout: {},
      themes: {
        light: {
          layout: {},
          colors: {
            background: "hsl(0, 0%, 100%)",
            foreground: "hsl(0, 0%, 0%)",
            primary: {
              50: "hsl(28, 91%, 95%)",
              100: "hsl(28, 91%, 90%)",
              200: "hsl(28, 91%, 80%)",
              300: "hsl(28, 91%, 70%)",
              400: "hsl(28, 91%, 65%)",
              500: "hsl(28, 91%, 60%)",
              600: "hsl(28, 91%, 50%)",
              700: "hsl(28, 91%, 40%)",
              800: "hsl(28, 91%, 30%)",
              900: "hsl(28, 91%, 20%)",
              DEFAULT: "hsl(28, 91%, 60%)",
              foreground: "hsl(0, 0%, 0%)",
            },
            secondary: "hsl(0, 0%, 96%)",
          },
        },
        dark: {
          layout: {}, // Add this empty object
          colors: {
            background: "hsl(0, 0%, 0%)",
            foreground: "hsl(0, 0%, 100%)",
            secondary: {
              DEFAULT: "hsl(var(--nextui-default-500))",
              foreground: "hsl(var(--nextui-default-500))",
            },
            primary: {
              50: "hsl(28, 91%, 95%)",
              100: "hsl(28, 91%, 90%)",
              200: "hsl(28, 91%, 80%)",
              300: "hsl(28, 91%, 70%)",
              400: "hsl(28, 91%, 65%)",
              500: "hsl(28, 91%, 60%)",
              600: "hsl(28, 91%, 50%)",
              700: "hsl(28, 91%, 40%)",
              800: "hsl(28, 91%, 30%)",
              900: "hsl(28, 91%, 20%)",
              DEFAULT: "hsl(28, 91%, 60%)",
              foreground: "hsl(0, 0%, 100%)",
            },
          },
        },
      },
    }),
    plugin(({ addBase, theme }) => {
      addBase({
        ":root": {
          "--orange-50": theme("colors.orange.50"),
          "--orange-100": theme("colors.orange.100"),
          "--orange-200": theme("colors.orange.200"),
          "--orange-300": theme("colors.orange.300"),
          "--orange-400": theme("colors.orange.400"),
          "--orange-500": theme("colors.orange.500"),
          "--orange-600": theme("colors.orange.600"),
          "--orange-700": theme("colors.orange.700"),
          "--orange-800": theme("colors.orange.800"),
          "--orange-900": theme("colors.orange.900"),
          "--orange-950": theme("colors.orange.950"),
        },
        body: {
          "@media (min-width: 1024px)": {
            backgroundImage: `
              radial-gradient(circle at 50% 0%, ${theme(
                "colors.orange.800"
              )}, transparent 12%),
              radial-gradient(circle at 0% 50%, ${theme(
                "colors.orange.800"
              )}, transparent 12%),
              radial-gradient(circle at 100% 50%, ${theme(
                "colors.orange.800"
              )}, transparent 12%)
            `,
            backgroundSize: "80vw 40vh, 40vw 80vh, 40vw 80vh",
            backgroundPosition: "top center, left center, right center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          },
        },
        ".prose": {
          "--tw-prose-links": theme("colors.orange.500"),
          "--tw-prose-invert-links": theme("colors.orange.400"),
        },
        "button, .button": {
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        },
        ".card": {
          backgroundImage: `linear-gradient(135deg, ${theme(
            "colors.orange.950"
          )}, transparent)`,
          borderColor: theme("colors.orange.800"),
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        },
        ".dark .card": {
          backgroundImage: `linear-gradient(135deg, ${theme(
            "colors.orange.900"
          )}, transparent)`,
          borderColor: theme("colors.orange.700"),
        },
      });
    }),
  ],
};

export default config;
