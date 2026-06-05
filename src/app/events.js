import { analyzeText } from "../analysis/analyzeText.js";
import { isRangeProtected } from "../utils/offsets.js";
import { render } from "./render.js";
import { setFocus, setProtectedRanges, setSuggestions, setText, state } from "./state.js";
import { findProtectedRanges } from "../analysis/protectedTerms.js";

export function runAnalysis(app) {
  const result = analyzeText({
    text: state.text,
    focus: state.focus,
    resources: state.resources
  });
  setProtectedRanges(result.protectedRanges);
  setSuggestions(result.suggestions);
  render(app, state);
  bindEvents(app);
}

export function applySuggestion(app, id) {
  const suggestion = state.suggestions.find((item) => item.id === id);
  if (!suggestion || isRangeProtected(state.protectedRanges, suggestion.start, suggestion.end - suggestion.start)) return;
  setText(`${state.text.slice(0, suggestion.start)}${suggestion.replacement}${state.text.slice(suggestion.end)}`);
  runAnalysis(app);
}

export function bindEvents(app) {
  document.querySelector("#editor")?.addEventListener("input", (event) => {
    setText(event.target.value);
    setProtectedRanges(findProtectedRanges(state.text, state.resources.protectedTerms));
  });

  document.querySelector("#analyze")?.addEventListener("click", () => runAnalysis(app));

  document.querySelectorAll("[data-focus]").forEach((button) => {
    button.addEventListener("click", () => {
      setFocus(button.dataset.focus);
      runAnalysis(app);
    });
  });

  document.querySelectorAll("[data-apply]").forEach((button) => {
    button.addEventListener("click", () => applySuggestion(app, button.dataset.apply));
  });
}
