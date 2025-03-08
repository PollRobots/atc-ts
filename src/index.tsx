import React from "react";
import { createRoot } from "react-dom/client";
import "./input.css";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<h1>Hello, World!</h1>);
