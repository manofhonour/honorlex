import { safeRegExp } from "../utils/regex.js";
import { preserveCase } from "../utils/text.js";

const QUALITATIVE_CONTEXT_RE = /\b(qualitative|interview|participant|participants|self-reported|reported|perception|belief|theme|thematic|teacher|student|classroom)\b/i;

export function analyzeCautiousWording({ text, focus, resources, addSuggestion }) {
  for (const item of resources.cautiousWordingBank || []) {
    if (!isSectionRelevant(item, focus)) continue;
    const re = safeRegExp(item.pattern);
    if (!re) continue;
    for (const match of text.matchAll(re)) {
      for (const replacement of selectReplacements(item, text, focus)) {
        addSuggestion({
          kind: "Cautious Wording",
          start: match.index,
          end: match.index + match[0].length,
          original: match[0],
          replacement: preserveCase(match[0], adaptReplacement(match[0], replacement)),
          risk: item.risk,
          explanation: buildExplanation(item, text, focus, replacement),
          meta: item.problem_type || item.meta || focus,
          scores: scoreCautiousRule(item, text, focus)
        });
      }
    }
  }
}

function adaptReplacement(original, replacement) {
  const first = original.toLowerCase().split(/\s+/)[0];
  if (["always", "undoubtedly", "definitely", "certainly"].includes(first)) return replacement;
  if (!first.endsWith("s") || replacement.split(/\s+/).length > 1 || replacement.endsWith("s")) return replacement;
  if (replacement.endsWith("y") && !/[aeiou]y$/i.test(replacement)) return `${replacement.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(replacement)) return `${replacement}es`;
  return `${replacement}s`;
}

function isSectionRelevant(item, focus) {
  if (item.problem_type === "AI-sounding phrase") return true;
  const sections = item.best_sections || ["General"];
  return focus === "General" || sections.includes(focus) || sections.includes("General");
}

function selectReplacements(item, text, focus) {
  const replacements = item.replacements || [item.replacement];
  if (item.problem_type === "overgeneralization") return replacements.slice(0, 3);
  if (!QUALITATIVE_CONTEXT_RE.test(text)) return replacements.slice(0, 2);
  const cautious = replacements.filter((replacement) => /\b(may|appears?|suggest|indicate|reported|perceived|could|some|participating)\b/i.test(replacement));
  return (cautious.length ? cautious : replacements)
    .sort((a, b) => qualitativePriority(b) - qualitativePriority(a))
    .slice(0, 2);
}

function qualitativePriority(replacement) {
  if (/\b(reported|perceived)\b/i.test(replacement)) return 2;
  if (/\b(may|could|appears?)\b/i.test(replacement)) return 1;
  return 0;
}

function buildExplanation(item, text, focus, replacement) {
  const contextNote = QUALITATIVE_CONTEXT_RE.test(text)
    ? " For qualitative, perception-based, or self-reported data, cautious wording is preferred."
    : "";
  const sectionNote = focus === "Findings"
    ? " In Findings, report the evidence without overinterpreting it."
    : focus === "Discussion"
      ? " In Discussion, cautious interpretation is appropriate."
      : focus === "Conclusion"
        ? " In Conclusion, avoid overstating beyond the study evidence."
        : "";
  return `${item.explanation} Suggested alternative: "${replacement}".${contextNote}${sectionNote}`;
}

function scoreCautiousRule(item, text, focus) {
  const qualitative = QUALITATIVE_CONTEXT_RE.test(text);
  const risk = item.risk || item.risk_level;
  return {
    grammar_fit_score: 92,
    collocation_fit_score: 84,
    academic_naturalness_score: risk === "Safe" ? 88 : 82,
    claim_risk_score: risk === "Review carefully" ? 78 : risk === "Moderate" ? 52 : 22,
    overall_score: qualitative || focus !== "General" ? 90 : 84
  };
}
