/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  content: ["./src/**/*.{html,jsx,tsx,vue,js,ts}"],
  theme: {
    screens: {
      xs: "360px",

      xsm: "468px",

      sm: "670px",

      md: "768px",

      xmd: "850px",

      lg: "1024px",

      xl: "1280px",

      "2xl": "1536px",

      xxl: "1580px",

      xxxl: "1780px",

      "3xl": "2020px",

      "4xl": "2440px",
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        whiteColor: "var(--whiteColor)",
        redColor: "var(--red)",
        primaryColor: "var(--primary)",
        secondaryColor: "var(--secondary)",
        lightPrimaryColor: "var(--lightPrimary)",
        darkPrimaryColor: "var(--darkPrimary)",
        bgColor: "var(--bg-color)",
        textColor: "var(--text-color)",
        grayColor: "var(--gray-color)",
        border: "var(--border)",
        grayTextColor: "var(--grayTextColor)",
        borderColor: "var(--borderColor)",
        mainColor: "var(--main-color)",
        mainColor200: "var(--main-color200)",
      },
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
    fontFamily: {
      sans: ["Graphik", "sans-serif"],
      serif: ["Merriweather", "serif"],
    },
  },
  plugins: [],
};
