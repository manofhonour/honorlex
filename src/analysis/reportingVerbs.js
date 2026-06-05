import { describeSurface } from "./pos.js";
import { inflectReplacement } from "./inflection.js";

export function analyzeReportingVerbs({ text, focus, resources, addSuggestion }) {
  const wordRe = /\b[A-Za-z][A-Za-z'-]*\b/g;
  for (const match of text.matchAll(wordRe)) {
    const surface = match[0];
    const context = describeSurface(surface, {
      before: text.slice(Math.max(0, match.index - 1), match.index),
      after: text.slice(match.index + surface.length, match.index + surface.length + 1),
      start: match.index,
      end: match.index + surface.length
    });
    const bank = resources.reportingVerbsByLemma?.[context.lemma];
    if (!bank) continue;

    for (const candidate of bank) {
      if (!candidate.sections.includes(focus) && focus !== "General") continue;
      const inflected = inflectReplacement(context, candidate.lemma, candidate.pos || "verb");
      addSuggestion({
        kind: inflected.phraseRewrite ? "Phrase Rewrite" : "Reporting verb",
        start: match.index,
        end: match.index + surface.length,
        original: surface,
        replacement: inflected.replacement,
        risk: candidate.risk,
        explanation: candidate.explanation,
        meta: candidate.sections.join(", ")
      });
    }
  }
}
