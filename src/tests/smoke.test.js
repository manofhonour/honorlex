import { analyzeText } from "../analysis/analyzeText.js";
import { loadResources } from "../analysis/loadResources.js";
import { testApplySuggestionShape } from "./applySuggestion.test.js";
import { testCautiousWording } from "./cautiousWording.test.js";
import { testCollocations } from "./collocations.test.js";
import { testConnectors } from "./connectors.test.js";
import { testPosInflection } from "./posInflection.test.js";
import { testProtectedTerms } from "./protectedTerms.test.js";
import { testSynonyms } from "./synonyms.test.js";
import { assert } from "./testUtils.js";

function smoke() {
  const { resources, health } = loadResources();
  const result = analyzeText({ text: "These findings show that the results prove the point.", focus: "General", resources });
  assert.ok(result.suggestions.length > 0);
  assert.equal(health.counts.synonyms, 11);
}

const tests = [
  smoke,
  testProtectedTerms,
  testPosInflection,
  testSynonyms,
  testConnectors,
  testCollocations,
  testCautiousWording,
  testApplySuggestionShape
];

for (const test of tests) {
  test();
}

console.log(`HonorLex tests passed: ${tests.length}`);
