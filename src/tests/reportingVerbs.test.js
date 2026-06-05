import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources, hasSuggestion } from "./testUtils.js";

export function testReportingVerbs() {
  const resources = getTestResources();
  assert.ok(resources.reportingVerbBank.length >= 70);
  for (const entry of resources.reportingVerbBank) {
    assert.ok(entry.strength_level);
    assert.ok(entry.certainty_level);
    assert.ok(entry.stance);
    assert.ok(Array.isArray(entry.safer_alternatives));
    assert.ok(Array.isArray(entry.stronger_alternatives));
  }

  const past = analyzeText({ text: "The findings showed a change.", focus: "Findings", resources }).suggestions;
  assert.ok(hasSuggestion(past, "showed", "indicated"));
  assert.ok(hasSuggestion(past, "showed", "suggested"));

  const present = analyzeText({ text: "The table shows the pattern.", focus: "Findings", resources }).suggestions;
  assert.ok(hasSuggestion(present, "shows", "indicates"));
  assert.ok(hasSuggestion(present, "shows", "suggests"));

  const progressive = analyzeText({ text: "The findings are showing a possible trend.", focus: "Findings", resources }).suggestions;
  assert.ok(hasSuggestion(progressive, "showing", "indicating"));
  assert.ok(hasSuggestion(progressive, "showing", "suggesting"));

  const suggest = analyzeText({ text: "The qualitative findings suggest a pattern.", focus: "Discussion", resources }).suggestions;
  assert.ok(!hasSuggestion(suggest, "suggest", "prove"));
  assert.ok(suggest.some((item) => item.original === "suggest" && ["indicate", "imply", "point to"].includes(item.replacement)));

  const indicate = analyzeText({ text: "The interview data indicate a pattern.", focus: "Discussion", resources }).suggestions;
  assert.ok(!hasSuggestion(indicate, "indicate", "prove"));

  const reported = analyzeText({ text: "Participants reported that they used L1 selectively.", focus: "Findings", resources }).suggestions;
  const demonstrated = reported.find((item) => item.original === "reported" && item.replacement === "demonstrated");
  assert.ok(!demonstrated || demonstrated.risk === "Review carefully");
  assert.ok(reported.some((item) => item.original === "reported" && item.replacement === "stated"));

  const prove = analyzeText({ text: "The results prove that the method works.", focus: "Discussion", resources }).suggestions;
  assert.ok(hasSuggestion(prove, "prove", "suggest"));
  assert.ok(hasSuggestion(prove, "prove", "indicate"));

  const literature = analyzeText({ text: "The authors argue that translanguaging supports participation.", focus: "Literature", resources }).suggestions;
  assert.ok(literature.some((item) => item.kind === "Reporting Verb" && item.meta.includes("argumentation")));
}
