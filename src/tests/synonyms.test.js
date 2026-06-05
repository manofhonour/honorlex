import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources, hasSuggestion } from "./testUtils.js";

export function testSynonyms() {
  const { suggestions } = analyzeText({ text: "This shows an important issue.", focus: "General", resources: getTestResources() });
  assert.ok(hasSuggestion(suggestions, "shows", "indicates"));
  assert.ok(hasSuggestion(suggestions, "important", "significant"));

  const verbSuggestions = analyzeText({ text: "The study showed, analyzed, and completed the process.", focus: "General", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(verbSuggestions, "showed", "indicated"));
  assert.ok(hasSuggestion(verbSuggestions, "showed", "illustrated"));
  assert.ok(hasSuggestion(verbSuggestions, "analyzed", "examined"));
  assert.ok(hasSuggestion(verbSuggestions, "analyzed", "evaluated"));

  const methodSuggestions = analyzeText({ text: "The researcher completed the study.", focus: "Method", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(methodSuggestions, "completed", "conducted"));
  assert.ok(hasSuggestion(methodSuggestions, "completed", "carried out"));

  const nounSuggestions = analyzeText({ text: "The findings shaped the analysis.", focus: "General", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(nounSuggestions, "findings", "results"));
  assert.ok(hasSuggestion(nounSuggestions, "analysis", "examination"));

  const adverbSuggestions = analyzeText({ text: "The difference was significantly larger.", focus: "General", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(adverbSuggestions, "significantly", "substantially"));
  assert.ok(hasSuggestion(adverbSuggestions, "significantly", "considerably"));
  assert.ok(!adverbSuggestions.some((item) => item.original === "significantly" && item.replacement === "substantial"));
}
