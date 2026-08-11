import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import BackGuard from "./BackGuard";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <BackGuard>
      <App />
    </BackGuard>
  </BrowserRouter>
);