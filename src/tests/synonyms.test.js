import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources, hasSuggestion } from "./testUtils.js";

export function testSynonyms() {
  const resources = getTestResources();
  const counts = resources.synonymCore.reduce((memo, entry) => {
    memo[entry.part_of_speech] = (memo[entry.part_of_speech] || 0) + 1;
    return memo;
  }, {});
  assert.equal(counts.verb, 300);
  assert.equal(counts.noun, 250);
  assert.equal(counts.adjective, 200);
  assert.equal(counts.adverb, 150);
  assert.equal(counts.connector, 120);

  const { suggestions } = analyzeText({ text: "This shows an important issue.", focus: "General", resources: getTestResources() });
  assert.ok(hasSuggestion(suggestions, "shows", "indicates"));
  assert.ok(hasSuggestion(suggestions, "important", "significant"));

  const verbSuggestions = analyzeText({ text: "The study showed, analyzed, and completed the process.", focus: "General", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(verbSuggestions, "showed", "indicated"));
  assert.ok(hasSuggestion(verbSuggestions, "showed", "illustrated"));
  assert.ok(hasSuggestion(verbSuggestions, "analyzed", "examined"));
  assert.ok(hasSuggestion(verbSuggestions, "analyzed", "evaluated"));

  const progressiveSuggestions = analyzeText({ text: "The team is showing and analyzing the data.", focus: "General", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(progressiveSuggestions, "showing", "indicating"));
  assert.ok(hasSuggestion(progressiveSuggestions, "showing", "suggesting"));
  assert.ok(hasSuggestion(progressiveSuggestions, "analyzing", "examining"));
  assert.ok(hasSuggestion(progressiveSuggestions, "analyzing", "evaluating"));

  const methodSuggestions = analyzeText({ text: "The researcher completed the study.", focus: "Method", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(methodSuggestions, "completed", "conducted"));
  assert.ok(hasSuggestion(methodSuggestions, "completed", "carried out"));

  const nounSuggestions = analyzeText({ text: "The findings shaped the analysis.", focus: "General", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(nounSuggestions, "findings", "results"));
  assert.ok(hasSuggestion(nounSuggestions, "analysis", "examination"));

  const sentenceSuggestions = analyzeText({ text: "This shows the pattern. These findings show a cautious trend.", focus: "Findings", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(sentenceSuggestions, "shows", "indicates"));
  assert.ok(hasSuggestion(sentenceSuggestions, "show", "suggest"));

  const adverbSuggestions = analyzeText({ text: "The difference was significantly larger.", focus: "General", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(adverbSuggestions, "significantly", "substantially"));
  assert.ok(hasSuggestion(adverbSuggestions, "significantly", "considerably"));
  assert.ok(!adverbSuggestions.some((item) => item.original === "significantly" && item.replacement === "substantial"));
}
