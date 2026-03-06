import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    "html, body, input, select, textarea": {
       color: "white", // Set global text color
    },
    "*": {
      boxSizing: "border-box", // Apply border-box sizing globally
    },
    "*::placeholder": {
      color: "white", // Set placeholder text color
      // opacity: 1, // Ensure placeholder text is fully opaque
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
