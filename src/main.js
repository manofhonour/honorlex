import "./styles.css";
import { loadResources } from "./analysis/loadResources.js";
import { bindEvents, runAnalysis } from "./app/events.js";
import { render } from "./app/render.js";
import { setResources, state } from "./app/state.js";
import { escapeHtml } from "./utils/text.js";

const app = document.querySelector("#app");

try {
  const { resources, health } = loadResources();
  setResources(resources, health);
  runAnalysis(app);
} catch (error) {
  console.warn("[HonorLex] Startup warning:", error);
  render(app, state);
  bindEvents(app);
  app.insertAdjacentHTML("afterbegin", `<pre>${escapeHtml(error.message)}</pre>`);
}
