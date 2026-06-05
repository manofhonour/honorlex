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
  const rankedShow = sentenceSuggestions.find((item) => item.original === "shows" && item.replacement === "indicates");
  assert.equal(rankedShow.kind, "Reporting Verb");
  assert.equal(rankedShow.scores.grammar_fit_score, 100);
  assert.ok(rankedShow.scores.overall_score >= 60);
  assert.match(rankedShow.explanation, /preserves present form|academic alternative/);

  const adverbSuggestions = analyzeText({ text: "The difference was significantly larger.", focus: "General", resources: getTestResources() }).suggestions;
  assert.ok(hasSuggestion(adverbSuggestions, "significantly", "substantially"));
  assert.ok(hasSuggestion(adverbSuggestions, "significantly", "considerably"));
  assert.ok(!adverbSuggestions.some((item) => item.original === "significantly" && item.replacement === "substantial"));

  const rankingResources = structuredClone(resources);
  rankingResources.synonymsByLemma.show.replacements.push({
    lemma: "demonstrate",
    pos: "verb",
    risk: "Review carefully",
    sections: ["General", "Findings"],
    explanation: "Stronger reporting verb."
  });
  const rankingSuggestions = analyzeText({ text: "The study showed results.", focus: "Findings", resources: rankingResources }).suggestions.filter((item) => item.original === "showed");
  assert.ok(hasSuggestion(rankingSuggestions, "showed", "indicated"));
  assert.ok(hasSuggestion(rankingSuggestions, "showed", "demonstrated"));
  assert.ok(rankingSuggestions.findIndex((item) => item.replacement === "indicated") < rankingSuggestions.findIndex((item) => item.replacement === "demonstrated"));
  assert.ok(rankingSuggestions.find((item) => item.replacement === "demonstrated").scores.claim_risk_score > 70);

  const blacklistResources = structuredClone(resources);
  blacklistResources.personalBlacklistDefault = [{ id: "blacklist-indicate", term: "indicate" }];
  const blacklistSuggestions = analyzeText({ text: "This shows the pattern.", focus: "General", resources: blacklistResources }).suggestions;
  assert.ok(!hasSuggestion(blacklistSuggestions, "shows", "indicates"));

  const protectedReplacementResources = structuredClone(resources);
  protectedReplacementResources.synonymsByLemma.show.replacements.push({
    lemma: "CDA",
    pos: "verb",
    risk: "Safe",
    sections: ["General"],
    explanation: "Invalid protected replacement."
  });
  protectedReplacementResources.synonymsByLemma.show.replacements.push({
    lemma: "analysis",
    pos: "noun",
    risk: "Safe",
    sections: ["General"],
    explanation: "Invalid POS replacement."
  });
  const protectedReplacementSuggestions = analyzeText({ text: "This shows the pattern.", focus: "General", resources: protectedReplacementResources }).suggestions;
  assert.ok(!hasSuggestion(protectedReplacementSuggestions, "shows", "CDA"));
  assert.ok(!hasSuggestion(protectedReplacementSuggestions, "shows", "analysis"));
}
