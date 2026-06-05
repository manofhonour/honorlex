import { safeRegExp } from "../utils/regex.js";

export function analyzeCollocations({ text, focus, resources, addSuggestion }) {
  for (const item of resources.collocationBank?.blocked || []) {
    const re = safeRegExp(item.pattern);
    if (!re) continue;
    for (const match of text.matchAll(re)) {
      const replacement = preserveSimpleCase(match[0], item.replacement);
      addSuggestion({
        kind: "Collocation",
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        replacement,
        risk: item.risk_level || item.risk,
        explanation: buildExplanation(item, focus),
        meta: `${item.pattern_type} / ${item.academic_function}`,
        scores: scoreCollocation(item, focus)
      });
    }
  }
}

export function replacementBreaksCollocation({ text, start, end, replacement, resources }) {
  const before = text.slice(Math.max(0, start - 30), start);
  const after = text.slice(end, Math.min(text.length, end + 30));
  const candidateText = `${before}${replacement}${after}`.toLowerCase();
  return (resources.collocationBank?.blocked || []).some((item) => {
    const re = safeRegExp(item.pattern);
    return re?.test(candidateText);
  });
}

function buildExplanation(item, focus) {
  const sectionFit = item.best_sections?.includes(focus) || item.best_sections?.includes("General")
    ? "fits this writing section"
    : "is a general academic correction";
  const warning = item.warning ? ` ${item.warning}` : "";
  return `${item.explanation} "${item.collocation}" is a natural ${item.pattern_type} collocation for ${item.academic_function} and ${sectionFit}.${warning}`;
}

function scoreCollocation(item, focus) {
  const sectionFit = item.best_sections?.includes(focus) || item.best_sections?.includes("General") ? 100 : 78;
  const risk = item.risk_level || item.risk;
  const claimRisk = risk === "Safe" ? 12 : risk === "Moderate" ? 38 : 72;
  return {
    grammar_fit_score: 96,
    collocation_fit_score: 100,
    academic_naturalness_score: risk === "Safe" ? 94 : 82,
    claim_risk_score: claimRisk,
    overall_score: Math.round(94 * 0.62 + sectionFit * 0.22 + (100 - claimRisk) * 0.16)
  };
}

function preserveSimpleCase(original, replacement) {
  if (original[0] === original[0]?.toUpperCase()) return `${replacement[0].toUpperCase()}${replacement.slice(1)}`;
  return replacement;
}
