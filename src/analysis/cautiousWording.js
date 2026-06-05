import { safeRegExp } from "../utils/regex.js";
import { preserveCase } from "../utils/text.js";

export function analyzeCautiousWording({ text, focus, resources, addSuggestion }) {
  for (const item of resources.cautiousWordingBank || []) {
    const re = safeRegExp(item.pattern);
    if (!re) continue;
    for (const match of text.matchAll(re)) {
      addSuggestion({
        kind: "Cautious wording",
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        replacement: preserveCase(match[0], item.replacement),
        risk: item.risk,
        explanation: item.explanation,
        meta: focus
      });
    }
  }
}
