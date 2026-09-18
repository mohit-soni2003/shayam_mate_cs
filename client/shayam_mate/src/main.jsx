import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/utility/color_codes.css";
import "./assets/utility/style.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
