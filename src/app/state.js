import { DEFAULT_TEXT } from "./constants.js";

export const state = {
  text: DEFAULT_TEXT,
  focus: "General",
  resources: null,
  resourceHealth: null,
  suggestions: [],
  protectedRanges: []
};

export function setText(text) {
  state.text = text;
}

export function setFocus(focus) {
  state.focus = focus;
}

export function setResources(resources, resourceHealth) {
  state.resources = resources;
  state.resourceHealth = resourceHealth;
}

export function setSuggestions(suggestions) {
  state.suggestions = suggestions;
}

export function setProtectedRanges(ranges) {
  state.protectedRanges = ranges;
}
