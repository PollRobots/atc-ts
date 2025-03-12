import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./input.css";
import { loadSettings } from "./settings";

const container = document.getElementById("app");
const root = createRoot(container!);
const settings = loadSettings();

root.render(<App {...settings} />);
