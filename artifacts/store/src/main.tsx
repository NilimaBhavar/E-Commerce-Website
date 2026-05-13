import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const originalFetch = window.fetch;
window.fetch = function(input, init) {
  const token = localStorage.getItem("tara_token");
  if (token && typeof input === "string" && input.includes("/api/")) {
    init = { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } };
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById("root")!).render(<App />);
