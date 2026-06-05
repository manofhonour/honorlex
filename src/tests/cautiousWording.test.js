import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources, hasSuggestion } from "./testUtils.js";

export function testCautiousWording() {
  const resources = getTestResources();
  assert.ok(resources.cautiousWordingBank.length >= 55);
  assert.ok(resources.cautiousWordingBank.some((item) => item.problem_type === "overclaiming"));
  assert.ok(resources.cautiousWordingBank.some((item) => item.problem_type === "AI-sounding phrase"));

  const overclaiming = analyzeText({ text: "The results prove the point.", focus: "Findings", resources }).suggestions;
  assert.ok(hasSuggestion(overclaiming, "The results prove", "The results indicate"));
  assert.ok(overclaiming.some((item) => item.kind === "Cautious Wording" && item.meta === "overclaiming"));

  const certainty = analyzeText({ text: "It is clear that teachers changed their practice.", focus: "Discussion", resources }).suggestions;
  assert.ok(hasSuggestion(certainty, "It is clear that", "It appears that"));

  const generalization = analyzeText({ text: "All teachers always used L1.", focus: "Findings", resources }).suggestions;
  assert.ok(hasSuggestion(generalization, "All teachers", "The participating teachers"));
  assert.ok(hasSuggestion(generalization, "always", "often"));

  const causality = analyzeText({ text: "The interview data directly improves comprehension and causes better participation.", focus: "Findings", resources }).suggestions;
  assert.ok(hasSuggestion(causality, "directly improves", "was perceived as supporting"));
  assert.ok(hasSuggestion(causality, "causes", "may contribute to"));

  const informal = analyzeText({ text: "This is very important and helps a lot.", focus: "Discussion", resources }).suggestions;
  assert.ok(hasSuggestion(informal, "very important", "significant"));
  assert.ok(hasSuggestion(informal, "helps a lot", "supports"));

  const aiSounding = analyzeText({ text: "This chapter delves into robust insights and sheds light on teacher beliefs.", focus: "Literature", resources }).suggestions;
  assert.ok(hasSuggestion(aiSounding, "delves into", "examines"));
  assert.ok(hasSuggestion(aiSounding, "robust insights", "useful insights"));
  assert.ok(hasSuggestion(aiSounding, "sheds light on", "examines"));

  const hedged = analyzeText({ text: "This may suggest that some teachers used L1.", focus: "Discussion", resources }).suggestions;
  assert.ok(!hedged.some((item) => item.original === "may suggest"));
}
