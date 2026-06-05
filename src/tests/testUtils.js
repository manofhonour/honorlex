import assert from "node:assert/strict";
import { loadResources } from "../analysis/loadResources.js";

export { assert };

export function getTestResources() {
  return loadResources().resources;
}

export function hasSuggestion(suggestions, original, replacement) {
  return suggestions.some((item) => item.original === original && item.replacement === replacement);
}
