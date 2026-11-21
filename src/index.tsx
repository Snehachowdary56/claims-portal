import { createRoot } from "react-dom/client";
import "./bootstrap.scss";
import "./tokens.css";
import "./styles.css";
import App from "./App.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element in index.html");
createRoot(root).render(<App />);
