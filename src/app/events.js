import { analyzeText } from "../analysis/analyzeText.js";
import { render } from "./render.js";
import { setFocus, setProtectedRanges, setSuggestions, setText, state } from "./state.js";
import { applySuggestionSafely, findProtectedRanges } from "../analysis/protectedTerms.js";

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
  const result = applySuggestionSafely(state.text, suggestion, state.resources.protectedTerms, state.protectedRanges);
  if (result.blocked) {
    console.warn(`[HonorLex] ${result.reason}`);
    return;
  }
  setText(result.text);
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
