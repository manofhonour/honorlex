import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources, hasSuggestion } from "./testUtils.js";

export function testCautiousWording() {
  const { suggestions } = analyzeText({ text: "The results prove the point.", focus: "General", resources: getTestResources() });
  assert.ok(hasSuggestion(suggestions, "prove", "suggests"));
}
