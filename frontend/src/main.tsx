import { FrappeProvider } from "frappe-react-sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FrappeProvider
      siteName="http://localhost:8001"
      enableSocket={false}
      socketPort="9001"
    >
      <App />
      
    </FrappeProvider>
  </StrictMode>
);
