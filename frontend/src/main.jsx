import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ObraProvider } from "./context/ObraContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ObraProvider>
      <App />
    </ObraProvider>
  </React.StrictMode>
);
