import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({

  globalCss: {
    variables: {
      // Define CSS variables for consistent theming
      "--chakra-colors-primary": "#ff5556",
      "--chakra-colors-secondary": "#7e5bef",
      "--chakra-colors-success": "#13ce66",
      "--chakra-colors-error": "#ff49db",
      "--chakra-colors-info": "#ff7849",
      "--chakra-colors-warning": "#ffc82c",
      "--chakra-colors-white": "#ffffff",
      "--chakra-colors-placeholder": "#888888",
    },
    "html, body, input, select, textarea": {
       color: "var(--chakra-colors-white)", // Set global text color
    },
    "*": {
      boxSizing: "border-box", // Apply border-box sizing globally
    },
    "*::placeholder": {
      color: "var(--chakra-colors-placeholder)", // Set placeholder text color
      opacity: 1, // Ensure placeholder text is fully opaque
    },

  },
  theme: {
    tokens: {
      colors: {
        primary: { value: "#ff5556" },
        secondary: { value: "#7e5bef" },
        success: { value: "#13ce66" },
        error: { value: "#ff49db" },
        info: { value: "#ff7849" },
        warning: { value: "#ffc82c" },
        white: { value: "#ffffff" },
        placeholder: { value: "#9a9a9a" },
      },
    },
    semanticTokens: {
      colors: {
        // You can also map semantic tokens here if needed
        textPrimary: { value: "{colors.primary}" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config)
