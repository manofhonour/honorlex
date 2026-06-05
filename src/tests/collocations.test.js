import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources, hasSuggestion } from "./testUtils.js";

export function testCollocations() {
  const { suggestions } = analyzeText({ text: "They make a research.", focus: "General", resources: getTestResources() });
  assert.ok(hasSuggestion(suggestions, "make a research", "conduct research"));
}
