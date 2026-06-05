import { safeRegExp } from "../utils/regex.js";

export function analyzeConnectors({ text, resources, addSuggestion }) {
  const connectorBank = resources.connectorBank || { warnings: [], overuse: [] };
  for (const item of connectorBank.warnings || []) {
    const re = safeRegExp(item.pattern);
    if (!re) continue;
    for (const match of text.matchAll(re)) {
      const original = match[0];
      const replacement = original.toLowerCase().startsWith("although")
        ? original.replace(/^although/i, "Despite").replace(/,\s*$/, ",")
        : original.toLowerCase().startsWith("despite")
          ? original.replace(/^despite/i, "Although")
          : original.replace(/\b(however|therefore|moreover|nevertheless)\s+/i, "$1, ");
      addSuggestion({
        kind: "Connector",
        start: match.index,
        end: match.index + original.length,
        original,
        replacement,
        risk: item.risk,
        explanation: item.explanation,
        meta: "grammar fit"
      });
    }
  }

  for (const connector of connectorBank.overuse || []) {
    const matches = [...text.matchAll(new RegExp(`\\b${connector}\\b`, "giu"))];
    if (matches.length > 2) {
      const match = matches[2];
      addSuggestion({
        kind: "Connector overuse",
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        replacement: "consider varying this connector",
        risk: "Moderate",
        explanation: `${connector} appears repeatedly. Review whether each transition is needed.`,
        meta: "style"
      });
    }
  }
}
