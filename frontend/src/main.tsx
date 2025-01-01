import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { FrappeProvider } from "frappe-react-sdk";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FrappeProvider
      siteName="http://localhost:8001"
      enableSocket={true}
      socketPort="9001"
    >
      <App />
    </FrappeProvider>
  </StrictMode>
);
