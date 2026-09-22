import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="bottom-right" 
      toastOptions={{
        style: {
          background: "#1a1a1a",
          color: "#e5e5e5",
          border: "1px solid #2a2a2a",
        },
      }}
    />
  </StrictMode>
);
