import { defaultConfig } from "@chakra-ui/react/preset";
import { ChakraProvider, createSystem, defineConfig } from "@chakra-ui/react/styled-system";
import { FrappeProvider } from "frappe-react-sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        foreground: { value: "#ffffff" },
        text: { value: "#ffffff" },
        primary: { value: "#3182ce" },
        secondary: { value: "#805ad5" },
        background: { value: "#1a202c" },
        surface: { value: "#2d3748" },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: "{colors.background}" },
        fg: { value: "{colors.foreground}" },
        "on-surface": { value: "{colors.text}" },
      },
    },
  },
});

const system = createSystem(defaultConfig, config)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FrappeProvider
      siteName="http://localhost:8001"
      enableSocket={false}
      socketPort="9001"
    >
      <ChakraProvider value={system}>

      <App />
      
      </ChakraProvider>
      
    </FrappeProvider>
  </StrictMode>
);
