import { describeSurface } from "./pos.js";
import { inflectReplacement } from "./inflection.js";
import { MINIMUM_SUGGESTION_QUALITY, scoreSynonymCandidate } from "./ranking.js";

const QUALITATIVE_CONTEXT_RE = /\b(qualitative|interview|participant|participants|perception|belief|self-reported|reported|response|responses|theme|thematic|classroom|teacher|student)\b/i;
const FORBIDDEN_STRENGTHENING = new Set(["suggest->prove", "indicate->prove", "imply->prove", "appear->prove", "seem->prove", "tend->prove"]);

export function analyzeReportingVerbs({ text, focus, resources, addSuggestion }) {
  const matches = findReportingVerbMatches(text, resources);
  for (const match of matches) {
    const context = buildContext(text, match);
    const entry = match.entry;

    for (const candidate of entry.replacements || []) {
      if (!candidate.sections.includes(focus) && focus !== "General") continue;
      if (isForbiddenStrengthening(entry.verb, candidate.lemma)) continue;
      const adjusted = adjustCandidateForContext(candidate, text, entry);
      const inflected = inflectReplacement(context, adjusted.lemma, adjusted.pos || "verb");
      const ranking = scoreSynonymCandidate({ entry: { lemma: entry.verb, pos: "verb", best_sections: entry.best_sections }, candidate: adjusted, context, focus, text, resources, inflected });
      if (ranking.blocked || ranking.scores.overall_score < MINIMUM_SUGGESTION_QUALITY) continue;
      addSuggestion({
        kind: inflected.phraseRewrite ? "Phrase Rewrite" : "Reporting Verb",
        start: match.start,
        end: match.end,
        original: match.surface,
        replacement: inflected.replacement,
        risk: adjusted.risk,
        explanation: buildExplanation(entry, adjusted, ranking),
        meta: `${entry.strength_level} / ${entry.certainty_level} / ${entry.stance}`,
        scores: ranking.scores
      });
    }
  }
}

function findReportingVerbMatches(text, resources) {
  const entries = Object.entries(resources.reportingVerbsByForm || {}).sort((a, b) => b[0].length - a[0].length);
  const ranges = [];
  const matches = [];
  for (const [form, entry] of entries) {
    const re = new RegExp(`(?<![A-Za-z'-])${escapeRegExp(form)}(?![A-Za-z'-])`, "gi");
    for (const found of text.matchAll(re)) {
      const start = found.index;
      const end = start + found[0].length;
      if (ranges.some((range) => start < range.end && end > range.start)) continue;
      ranges.push({ start, end });
      matches.push({ start, end, surface: found[0], form, entry });
    }
  }
  return matches.sort((a, b) => a.start - b.start);
}

function buildContext(text, match) {
  const base = describeSurface(match.surface.split(/\s+/)[0], {
    before: text.slice(Math.max(0, match.start - 1), match.start),
    after: text.slice(match.end, match.end + 1),
    start: match.start,
    end: match.end
  });
  return {
    ...base,
    surface: match.surface,
    lemma: match.entry.verb,
    pos: "verb",
    verb: detectVerbFormFromEntry(match)
  };
}

function detectVerbFormFromEntry(match) {
  const forms = match.entry.forms || {};
  const surface = match.surface.toLowerCase();
  if (surface === String(forms.third_person).toLowerCase()) return { tense: "present", agreement: "thirdPersonSingular" };
  if (surface === String(forms.past).toLowerCase()) return { tense: "past", agreement: "none" };
  if (surface === String(forms.past_participle).toLowerCase()) return { tense: "pastParticiple", agreement: "none" };
  if (surface === String(forms.ing).toLowerCase()) return { tense: "progressive", agreement: "none" };
  return { tense: "base", agreement: "base" };
}

function adjustCandidateForContext(candidate, text, entry) {
  const qualitative = QUALITATIVE_CONTEXT_RE.test(text);
  const strong = ["prove", "confirm", "establish", "demonstrate"].includes(candidate.lemma);
  if (!qualitative || !strong) return candidate;
  return {
    ...candidate,
    risk: "Review carefully",
    explanation: `${candidate.explanation} Stronger verbs need review with qualitative, interview-based, perception-based, or self-reported data.`,
    warning: entry.warning || candidate.warning
  };
}

function isForbiddenStrengthening(source, replacement) {
  if (replacement === "prove" && source !== "prove") return true;
  return FORBIDDEN_STRENGTHENING.has(`${source}->${replacement}`);
}

function buildExplanation(entry, candidate, ranking) {
  const sectionText = candidate.sections.join(", ");
  const warning = candidate.warning || entry.warning ? ` ${candidate.warning || entry.warning}` : "";
  return `${candidate.explanation} Strength: ${entry.strength_level}; certainty: ${entry.certainty_level}; suitable sections: ${sectionText}. ${ranking.explanation}${warning}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
