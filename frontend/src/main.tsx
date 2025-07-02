import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from './components/AuthContext';
import { PlanProvider } from './components/AuthContext';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <PlanProvider>
        <App />
      </PlanProvider>
    </AuthProvider>
  </React.StrictMode>
);
