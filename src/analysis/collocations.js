import { safeRegExp } from "../utils/regex.js";

export function analyzeCollocations({ text, resources, addSuggestion }) {
  for (const item of resources.collocationBank?.blocked || []) {
    const re = safeRegExp(item.pattern);
    if (!re) continue;
    for (const match of text.matchAll(re)) {
      addSuggestion({
        kind: "Collocation",
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        replacement: item.replacement,
        risk: item.risk,
        explanation: item.explanation,
        meta: item.category
      });
    }
  }
}
