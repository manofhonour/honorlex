import { describeSurface } from "./pos.js";
import { inflectReplacement } from "./inflection.js";
import { MINIMUM_SUGGESTION_QUALITY, scoreSynonymCandidate } from "./ranking.js";
import { replacementBreaksCollocation } from "./collocations.js";

export function analyzeSynonyms({ text, focus, resources, addSuggestion }) {
  const wordRe = /\b[A-Za-z][A-Za-z'-]*\b/g;
  for (const match of text.matchAll(wordRe)) {
    const surface = match[0];
    const context = describeSurface(surface, {
      before: text.slice(Math.max(0, match.index - 1), match.index),
      after: text.slice(match.index + surface.length, match.index + surface.length + 1),
      start: match.index,
      end: match.index + surface.length
    });
    const entry = resources.synonymsByLemma?.[context.lemma];
    if (!entry) continue;
    if (entry.pos !== context.pos) continue;

    for (const candidate of entry.replacements || []) {
      const sections = candidate.sections || candidate.focus || [];
      if (!sections.includes(focus) && !sections.includes("General")) continue;
      const inflected = inflectReplacement(context, candidate.lemma, candidate.pos || entry.pos);
      if (replacementBreaksCollocation({ text, start: match.index, end: match.index + surface.length, replacement: inflected.replacement, resources })) continue;
      const ranking = scoreSynonymCandidate({ entry, candidate, context, focus, text, resources, inflected });
      if (ranking.blocked || ranking.scores.overall_score < MINIMUM_SUGGESTION_QUALITY) continue;
      addSuggestion({
        kind: inflected.phraseRewrite ? "Phrase Rewrite" : ranking.category,
        start: match.index,
        end: match.index + surface.length,
        original: surface,
        replacement: inflected.replacement,
        risk: candidate.risk,
        explanation: `${candidate.explanation} ${ranking.explanation}`,
        meta: inflected.phraseRewrite ? `${context.pos} to ${candidate.pos}` : `${entry.pos} preserved`,
        scores: ranking.scores
      });
    }
  }
}
