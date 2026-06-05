import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources, hasSuggestion } from "./testUtils.js";

export function testSynonyms() {
  const { suggestions } = analyzeText({ text: "This shows an important issue.", focus: "General", resources: getTestResources() });
  assert.ok(hasSuggestion(suggestions, "shows", "indicates"));
  assert.ok(hasSuggestion(suggestions, "important", "significant"));
}
