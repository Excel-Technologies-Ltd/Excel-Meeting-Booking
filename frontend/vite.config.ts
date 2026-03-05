import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import proxyOptions from "./proxyOptions";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: proxyOptions,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "../excel_meeting_booking/public/frontend",
    emptyOutDir: true,
    target: "es2015",
  },
});
