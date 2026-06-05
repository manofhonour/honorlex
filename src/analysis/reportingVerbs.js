import { getLemma } from "./pos.js";
import { inflectVerb } from "./inflection.js";
import { preserveCase } from "../utils/text.js";

export function analyzeReportingVerbs({ text, focus, resources, addSuggestion }) {
  const wordRe = /\b(?:show|shows|showed|showing|report|reports|reported|prove|proves|proved|proving)\b/gi;
  for (const match of text.matchAll(wordRe)) {
    const surface = match[0];
    const lemma = getLemma(surface);
    const bank = resources.reportingVerbsByLemma?.[lemma];
    if (!bank) continue;

    for (const candidate of bank) {
      if (!candidate.sections.includes(focus) && focus !== "General") continue;
      const replacement = preserveCase(surface, inflectVerb(surface, candidate.lemma));
      addSuggestion({
        kind: "Reporting verb",
        start: match.index,
        end: match.index + surface.length,
        original: surface,
        replacement,
        risk: candidate.risk,
        explanation: candidate.explanation,
        meta: candidate.sections.join(", ")
      });
    }
  }
}
