import { getLemma } from "./pos.js";
import { inflectVerb } from "./inflection.js";
import { preserveCase } from "../utils/text.js";

export function analyzeSynonyms({ text, focus, resources, addSuggestion }) {
  const wordRe = /\b[A-Za-z][A-Za-z'-]*\b/g;
  for (const match of text.matchAll(wordRe)) {
    const surface = match[0];
    const lemma = getLemma(surface);
    const entry = resources.synonymsByLemma?.[lemma];
    if (!entry) continue;

    for (const candidate of entry.replacements || []) {
      const sections = candidate.sections || candidate.focus || [];
      if (!sections.includes(focus) && !sections.includes("General")) continue;
      const replacement = entry.pos === "verb" ? inflectVerb(surface, candidate.lemma) : candidate.lemma;
      addSuggestion({
        kind: "Synonym",
        start: match.index,
        end: match.index + surface.length,
        original: surface,
        replacement: preserveCase(surface, replacement),
        risk: candidate.risk,
        explanation: candidate.explanation,
        meta: `${entry.pos} preserved`
      });
    }
  }
}
