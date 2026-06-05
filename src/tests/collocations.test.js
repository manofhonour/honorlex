import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources, hasSuggestion } from "./testUtils.js";

export function testCollocations() {
  const resources = getTestResources();
  assert.ok(resources.collocationBank.good.length >= 200);
  assert.ok(resources.collocationBank.blocked.length >= 17);
  assert.ok(resources.collocationBank.good.some((item) => item.collocation === "conduct research" && item.node_word === "research"));
  assert.ok(resources.collocationBank.good.some((item) => item.collocation === "empirical evidence" && item.pattern_type === "adjective+noun"));
  assert.ok(resources.collocationBank.good.some((item) => item.collocation === "teacher beliefs" && item.academic_function.includes("ELT")));

  const { suggestions } = analyzeText({ text: "They make a research.", focus: "General", resources });
  assert.ok(hasSuggestion(suggestions, "make a research", "conduct research"));
  assert.equal(suggestions[0].kind, "Collocation");
  assert.equal(suggestions[0].scores.collocation_fit_score, 100);

  const awkward = analyzeText({
    text: "The authors do a study and take data. The paper uses statistics data and strongly important findings.",
    focus: "Method",
    resources
  }).suggestions;
  assert.ok(hasSuggestion(awkward, "do a study", "conduct a study"));
  assert.ok(hasSuggestion(awkward, "take data", "collect data"));
  assert.ok(hasSuggestion(awkward, "statistics data", "statistical data"));
  assert.ok(hasSuggestion(awkward, "strongly important", "particularly important"));

  const analysis = analyzeText({ text: "The researchers make analysis and ascertain findings.", focus: "Findings", resources }).suggestions;
  assert.ok(hasSuggestion(analysis, "make analysis", "conduct an analysis"));
  assert.ok(hasSuggestion(analysis, "ascertain findings", "interpret findings"));
  assert.equal(analysis.find((item) => item.original === "ascertain findings").risk, "Moderate");

  const risky = analyzeText({ text: "The text says that students learn better.", focus: "Findings", resources }).suggestions;
  assert.ok(hasSuggestion(risky, "students learn better", "students reported improved understanding"));
  assert.equal(risky.find((item) => item.original === "students learn better").risk, "Review carefully");
}
