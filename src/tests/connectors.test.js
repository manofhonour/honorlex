import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources, hasSuggestion } from "./testUtils.js";

export function testConnectors() {
  const resources = getTestResources();
  assert.ok(resources.connectorBank.entries.length >= 100);
  assert.ok(resources.connectorBank.entries.some((item) => item.connector === "although" && item.connector_type === "subordinating_conjunction"));
  assert.ok(resources.connectorBank.entries.some((item) => item.connector === "despite" && item.connector_type === "prepositional_connector"));
  assert.ok(resources.connectorBank.entries.some((item) => item.connector === "however" && item.punctuation_rule.includes("comma")));

  const comma = analyzeText({ text: "However the finding is useful.", focus: "General", resources }).suggestions;
  assert.ok(comma.some((item) => item.kind === "Connector" && item.replacement === "However,"));

  const although = analyzeText({ text: "Although the small sample, the findings are useful.", focus: "Discussion", resources }).suggestions;
  assert.ok(although.some((item) => item.kind === "Connector" && item.original.startsWith("Although") && item.replacement.startsWith("Despite")));

  const despite = analyzeText({ text: "Despite the sample was small, the findings are useful.", focus: "Discussion", resources }).suggestions;
  assert.ok(despite.some((item) => item.kind === "Connector" && item.original.startsWith("Despite") && item.replacement.startsWith("Although")));

  const dueTo = analyzeText({ text: "The teacher used L1 due to students did not understand.", focus: "Discussion", resources }).suggestions;
  assert.ok(dueTo.some((item) => item.kind === "Connector" && item.original.startsWith("due to") && item.replacement.startsWith("because")));

  const because = analyzeText({ text: "Because the small sample, the findings should be interpreted cautiously.", focus: "Discussion", resources }).suggestions;
  assert.ok(because.some((item) => item.kind === "Connector" && item.replacement.startsWith("Because of")));

  const stacking = analyzeText({ text: "However, moreover, the findings are useful.", focus: "Discussion", resources }).suggestions;
  assert.ok(hasSuggestion(stacking, "However, moreover,", "However,"));

  const overuse = analyzeText({ text: "However, the sample was small. However, the findings are useful. However, this should be interpreted cautiously.", focus: "Discussion", resources }).suggestions;
  assert.ok(overuse.some((item) => item.kind === "Connector" && item.meta === "overuse"));
}
