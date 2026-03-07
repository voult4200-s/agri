import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

// Suppress known harmless Three.js / WebGL driver warnings
const _warn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  const msg = args[0];
  if (
    typeof msg === "string" &&
    (msg.includes("THREE.Clock") ||
      msg.includes("WebGLProgram") ||
      msg.includes("cannot be represented accurately"))
  ) return;
  _warn(...args);
};

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <App />
  </ThemeProvider>
);
