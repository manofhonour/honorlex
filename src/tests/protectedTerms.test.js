import { analyzeText } from "../analysis/analyzeText.js";
import { applySuggestionSafely, findProtectedRanges } from "../analysis/protectedTerms.js";
import { assert, getTestResources, hasSuggestion } from "./testUtils.js";

export function testProtectedTerms() {
  const resources = getTestResources();
  const ranges = findProtectedRanges("The value was p < .05 in 2024 for P12 and CDA.", resources.protectedTerms);
  assert.ok(ranges.some((range) => range.value === "p < .05"));
  assert.ok(ranges.some((range) => range.value === "2024"));
  assert.ok(ranges.some((range) => range.value === "P12"));
  assert.ok(ranges.some((range) => range.value === "CDA"));

  assertProtected("This was reported (Smith, 2020).", "(Smith, 2020)", resources);
  assertProtected("The value was p = .016.", "p = .016", resources);
  assertProtected("ST1 described the lesson.", "ST1", resources);
  assertProtected("CDA guided the analysis.", "CDA", resources);
  assertProtected('The teacher said "I use L1 strategically".', '"I use L1 strategically"', resources);

  const text = "This shows CDA and p < .05.";
  const result = analyzeText({ text, focus: "General", resources });
  assert.ok(hasSuggestion(result.suggestions, "shows", "indicates"));
  assert.ok(!result.suggestions.some((item) => item.original === "CDA"));
  const suggestion = result.suggestions.find((item) => item.original === "shows" && item.replacement === "indicates");
  const applied = applySuggestionSafely(text, suggestion, resources.protectedTerms, result.protectedRanges);
  assert.equal(applied.blocked, false);
  assert.equal(applied.text, "This indicates CDA and p < .05.");
  assert.ok(applied.text.includes("CDA"));
  assert.ok(applied.text.includes("p < .05"));

  const blocked = applySuggestionSafely(text, { start: 11, end: 14, original: "CDA", replacement: "analysis" }, resources.protectedTerms, result.protectedRanges);
  assert.equal(blocked.blocked, true);
}

function assertProtected(text, expectedValue, resources) {
  const ranges = findProtectedRanges(text, resources.protectedTerms);
  assert.ok(ranges.some((range) => range.value === expectedValue), `${expectedValue} should be protected`);
}
