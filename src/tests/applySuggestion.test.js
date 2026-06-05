import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources } from "./testUtils.js";

export function testApplySuggestionShape() {
  const text = "This shows the issue.";
  const { suggestions } = analyzeText({ text, focus: "General", resources: getTestResources() });
  const suggestion = suggestions.find((item) => item.original === "shows" && item.replacement === "indicates");
  assert.ok(suggestion);
  const applied = `${text.slice(0, suggestion.start)}${suggestion.replacement}${text.slice(suggestion.end)}`;
  assert.equal(applied, "This indicates the issue.");
}
