import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.jsx";
import "./index.css";
import { ContextProvider } from "./context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>
  </React.StrictMode>
);

