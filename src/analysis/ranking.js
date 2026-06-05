export function riskRank(risk) {
  return { Safe: 0, Moderate: 1, "Review carefully": 2 }[risk] ?? 3;
}

export const MINIMUM_SUGGESTION_QUALITY = 60;

const REPORTING_VERBS = new Set(["show", "suggest", "indicate", "demonstrate", "reveal", "report", "argue", "claim", "find", "identify"]);
const STRONG_CLAIM_VERBS = new Set(["prove", "confirm", "demonstrate", "establish", "reveal"]);
const CAUTIOUS_CLAIM_VERBS = new Set(["suggest", "indicate", "report", "note", "identify", "describe"]);

export function rankSuggestions(items, options = {}) {
  return [...items]
    .filter((item) => options.showAll || !item.scores || item.scores.overall_score >= MINIMUM_SUGGESTION_QUALITY)
    .sort((a, b) => {
      const scoreDelta = (b.scores?.overall_score ?? 70) - (a.scores?.overall_score ?? 70);
      return riskRank(a.risk) - riskRank(b.risk) || scoreDelta || a.start - b.start;
    });
}

export function scoreSynonymCandidate({ entry, candidate, context, focus, text, resources, inflected }) {
  if (isSuggestionReplacementBlocked(candidate.lemma, resources)) {
    return { blocked: true, reason: "The replacement is blacklisted or protected." };
  }

  const candidatePos = candidate.pos || entry.pos;
  const grammarFit = candidatePos === context.pos && !inflected.phraseRewrite ? 100 : 35;
  const collocationFit = calculateCollocationFit({ candidate, context, text, resources, replacement: inflected.replacement });
  const academicNaturalness = calculateAcademicNaturalness(candidate);
  const claimRisk = calculateClaimRisk({ entry, candidate });
  const sectionFit = calculateSectionFit(candidate.sections || entry.best_sections || [], focus);
  const domainFit = calculateDomainFit(text, resources);
  const userPreference = calculateUserPreference(candidate, resources);
  const riskPenalty = riskRank(candidate.risk) * 8;

  const overall = clamp(Math.round(
    grammarFit * 0.24 +
    collocationFit * 0.18 +
    academicNaturalness * 0.18 +
    (100 - claimRisk) * 0.14 +
    sectionFit * 0.1 +
    domainFit * 0.07 +
    userPreference * 0.05 +
    (100 - riskPenalty) * 0.04
  ));

  return {
    blocked: grammarFit < 60,
    category: REPORTING_VERBS.has(entry.lemma) ? "Reporting Verb" : candidatePos === "connector" ? "Connector" : "Academic Synonym",
    scores: {
      grammar_fit_score: grammarFit,
      collocation_fit_score: collocationFit,
      academic_naturalness_score: academicNaturalness,
      claim_risk_score: claimRisk,
      overall_score: overall
    },
    explanation: buildRankingExplanation({ candidate, context, inflected, sectionFit, collocationFit, claimRisk })
  };
}

function calculateCollocationFit({ candidate, context, text, resources, replacement }) {
  const before = nearestWord(text.slice(Math.max(0, context.start - 40), context.start), "before");
  const after = nearestWord(text.slice(context.end, Math.min(text.length, context.end + 40)), "after");
  const replacementPhrase = `${before} ${replacement} ${after}`.trim().toLowerCase();

  for (const item of resources.collocationBank?.blocked || []) {
    const re = new RegExp(item.pattern, "i");
    if (re.test(replacementPhrase)) return 20;
  }

  const good = resources.collocationBank?.good || [];
  if (good.some((item) => replacementPhrase.includes(item.collocation.toLowerCase()))) return 95;
  if (candidate.collocations?.some((item) => replacementPhrase.includes(String(item).toLowerCase()))) return 92;
  return candidate.risk === "Safe" ? 86 : candidate.risk === "Moderate" ? 74 : 62;
}

function calculateAcademicNaturalness(candidate) {
  if (candidate.academic_frequency) return clamp(candidate.academic_frequency);
  if (candidate.risk === "Safe") return 88;
  if (candidate.risk === "Moderate") return 74;
  return 58;
}

function calculateClaimRisk({ entry, candidate }) {
  const lemma = candidate.lemma.toLowerCase();
  if (STRONG_CLAIM_VERBS.has(lemma)) return 82;
  if (CAUTIOUS_CLAIM_VERBS.has(lemma)) return 20;
  if (entry.pos !== "verb") return riskRank(candidate.risk) * 25;
  return candidate.risk === "Safe" ? 28 : candidate.risk === "Moderate" ? 52 : 76;
}

function calculateSectionFit(sections, focus) {
  if (sections.includes(focus)) return 100;
  if (sections.includes("General")) return 84;
  return 62;
}

function calculateDomainFit(text, resources) {
  const lower = text.toLowerCase();
  const domainTerms = resources.domainLexicon || [];
  return domainTerms.some((item) => lower.includes(item.term.toLowerCase())) ? 92 : 78;
}

function calculateUserPreference(candidate, resources) {
  const preferred = resources.userPreferences?.preferredSynonyms || [];
  return preferred.includes(candidate.lemma) ? 100 : 76;
}

export function isSuggestionReplacementBlocked(replacement, resources) {
  return isBlacklisted(replacement, resources) || isProtectedReplacement(replacement, resources);
}

function isBlacklisted(replacement, resources) {
  const blacklist = resources.personalBlacklistDefault || [];
  const lowerReplacement = replacement.toLowerCase();
  return blacklist.some((item) => {
    const term = typeof item === "string" ? item : item.term || item.lemma || item.phrase;
    if (!term) return false;
    const lowerTerm = term.toLowerCase();
    return lowerTerm === lowerReplacement || inflectedForms(lowerTerm).includes(lowerReplacement);
  });
}

function isProtectedReplacement(replacement, resources) {
  return (resources.protectedTerms?.exact || []).some((term) => term.toLowerCase() === replacement.toLowerCase());
}

function inflectedForms(lemma) {
  if (lemma.endsWith("y") && !/[aeiou]y$/.test(lemma)) return [`${lemma.slice(0, -1)}ies`, `${lemma.slice(0, -1)}ied`];
  if (lemma.endsWith("e")) return [`${lemma}s`, `${lemma}d`, `${lemma.slice(0, -1)}ing`];
  return [`${lemma}s`, `${lemma}ed`, `${lemma}ing`];
}

function buildRankingExplanation({ candidate, context, inflected, sectionFit, collocationFit, claimRisk }) {
  const tense = context.verb?.tense && context.verb.tense !== "base" ? ` and preserves ${context.verb.tense} form` : "";
  const sectionNote = sectionFit >= 90 ? "fits this writing section" : "is usable but less section-specific";
  const collocationNote = collocationFit >= 90 ? "fits the local collocation" : "has acceptable academic collocation fit";
  const claimNote = claimRisk <= 30 ? "keeps the claim cautious" : claimRisk >= 70 ? "may strengthen the claim" : "has moderate claim strength";
  return `"${inflected.replacement}" is a ${candidate.risk.toLowerCase()} academic alternative${tense}; it ${sectionNote}, ${collocationNote}, and ${claimNote}.`;
}

function nearestWord(fragment, direction) {
  const matches = [...fragment.matchAll(/[A-Za-z][A-Za-z'-]*/g)].map((match) => match[0]);
  if (!matches.length) return "";
  return direction === "before" ? matches.at(-1) : matches[0];
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}
