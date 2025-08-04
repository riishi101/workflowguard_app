import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

// Prevent multiple root creation in development
let root = (window as any).__react_root__;
if (!root) {
  root = createRoot(container);
  (window as any).__react_root__ = root;
}

root.render(<App />);
