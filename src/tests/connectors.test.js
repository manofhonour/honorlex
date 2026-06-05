import { analyzeText } from "../analysis/analyzeText.js";
import { assert, getTestResources } from "./testUtils.js";

export function testConnectors() {
  const { suggestions } = analyzeText({ text: "However the finding is useful.", focus: "General", resources: getTestResources() });
  assert.ok(suggestions.some((item) => item.kind === "Connector" && item.replacement.startsWith("However,")));
}
