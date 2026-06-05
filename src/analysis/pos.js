const IRREGULAR_LEMMAS = new Map([
  ["shown", "show"],
  ["found", "find"],
  ["findings", "finding"],
  ["analyses", "analyse"],
  ["criteria", "criterion"],
  ["phenomena", "phenomenon"],
  ["data", "datum"],
  ["carried out", "carry out"],
  ["carries out", "carry out"],
  ["carrying out", "carry out"]
]);

const POS_LEXICON = new Map([
  ["analyze", "verb"], ["analyse", "verb"], ["complete", "verb"], ["examine", "verb"], ["evaluate", "verb"],
  ["interpret", "verb"], ["investigate", "verb"], ["indicate", "verb"], ["suggest", "verb"], ["show", "verb"],
  ["demonstrate", "verb"], ["illustrate", "verb"], ["report", "verb"], ["argue", "verb"], ["claim", "verb"],
  ["find", "verb"], ["identify", "verb"], ["describe", "verb"], ["discuss", "verb"], ["support", "verb"],
  ["provide", "verb"], ["conduct", "verb"], ["carry out", "verb"], ["finish", "verb"],
  ["finding", "noun"], ["result", "noun"], ["study", "noun"], ["analysis", "noun"], ["interpretation", "noun"],
  ["examination", "noun"], ["criterion", "noun"], ["phenomenon", "noun"], ["datum", "noun"], ["participant", "noun"],
  ["teacher", "noun"], ["student", "noun"], ["practice", "noun"], ["belief", "noun"], ["response", "noun"],
  ["significant", "adjective"], ["important", "adjective"], ["meaningful", "adjective"], ["substantial", "adjective"],
  ["clear", "adjective"], ["consistent", "adjective"], ["effective", "adjective"], ["general", "adjective"],
  ["specific", "adjective"], ["frequent", "adjective"], ["careful", "adjective"], ["critical", "adjective"],
  ["significantly", "adverb"], ["substantially", "adverb"], ["meaningfully", "adverb"], ["considerably", "adverb"],
  ["clearly", "adverb"], ["consistently", "adverb"], ["effectively", "adverb"], ["importantly", "adverb"],
  ["generally", "adverb"], ["specifically", "adverb"], ["frequently", "adverb"], ["carefully", "adverb"],
  ["critically", "adverb"]
]);

export function getLemma(surface) {
  const lower = surface.toLowerCase();
  if (IRREGULAR_LEMMAS.has(lower)) return IRREGULAR_LEMMAS.get(lower);
  if (lower.endsWith("sis")) return lower;
  if (lower.endsWith("ying")) return `${lower.slice(0, -4)}y`;
  if (lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("ves")) return `${lower.slice(0, -3)}f`;
  if (lower.endsWith("ing")) return lemmatizeIng(lower);
  if (lower.endsWith("ed")) return lemmatizePast(lower);
  if (lower.endsWith("es")) return lemmatizeThirdPerson(lower);
  if (lower.endsWith("s") && lower.length > 3 && !lower.endsWith("ss")) return lower.slice(0, -1);
  return lower;
}

export function detectWordContext(text, start, end) {
  const surface = text.slice(start, end);
  return describeSurface(surface, {
    before: text.slice(Math.max(0, start - 1), start),
    after: text.slice(end, end + 1),
    start,
    end
  });
}

export function describeSurface(surface, environment = {}) {
  const lemma = getLemma(surface);
  const pos = detectPos(surface, lemma);
  return {
    surface,
    lemma,
    pos,
    verb: pos === "verb" ? detectVerbForm(surface, lemma) : null,
    noun: pos === "noun" ? { number: detectNounNumber(surface, lemma) } : null,
    degree: pos === "adjective" || pos === "adverb" ? detectDegree(surface) : null,
    capitalization: detectCapitalization(surface),
    punctuation: {
      before: environment.before || "",
      after: environment.after || ""
    },
    start: environment.start,
    end: environment.end
  };
}

export function detectPos(surface, lemma = getLemma(surface)) {
  const lower = surface.toLowerCase();
  if (POS_LEXICON.has(lower)) return POS_LEXICON.get(lower);
  if (POS_LEXICON.has(lemma)) return POS_LEXICON.get(lemma);
  if (lower.endsWith("ly")) return "adverb";
  if (lower.endsWith("ing") || lower.endsWith("ed")) return "verb";
  if (lower.endsWith("tion") || lower.endsWith("sis") || lower.endsWith("ment") || lower.endsWith("ness")) return "noun";
  if (lower.endsWith("al") || lower.endsWith("ive") || lower.endsWith("ful") || lower.endsWith("ant") || lower.endsWith("ent")) return "adjective";
  return "noun";
}

export function isSamePos(sourcePos, replacementPos) {
  return sourcePos === replacementPos;
}

function detectVerbForm(surface, lemma) {
  const lower = surface.toLowerCase();
  if (lower === "shown" || lower === "found") return { tense: "pastParticiple", agreement: "none" };
  if (lower.endsWith("ing")) return { tense: "progressive", agreement: "none" };
  if (lower.endsWith("ed") || lower === "showed") return { tense: "past", agreement: "none" };
  if ((lower.endsWith("s") || lower.endsWith("ies")) && lower !== lemma && !lower.endsWith("ss")) {
    return { tense: "present", agreement: "thirdPersonSingular" };
  }
  return { tense: "base", agreement: "base" };
}

function detectNounNumber(surface, lemma) {
  const lower = surface.toLowerCase();
  if (["analyses", "criteria", "phenomena", "data"].includes(lower)) return "plural";
  if (lower.endsWith("sis")) return "singular";
  if ((lower.endsWith("s") || lower.endsWith("ies")) && lower !== lemma && !lower.endsWith("ss")) return "plural";
  return "singular";
}

function detectDegree(surface) {
  const lower = surface.toLowerCase();
  if (lower.startsWith("most ") || lower.endsWith("est")) return "superlative";
  if (lower.startsWith("more ") || lower.endsWith("er")) return "comparative";
  return "positive";
}

function detectCapitalization(surface) {
  if (surface === surface.toUpperCase()) return "upper";
  if (surface[0] === surface[0].toUpperCase()) return "title";
  return "lower";
}

function lemmatizeIng(lower) {
  const stem = lower.slice(0, -3);
  if (stem.endsWith("y")) return stem;
  if (stem.endsWith("rr")) return stem.slice(0, -1);
  if (stem.endsWith("t") && POS_LEXICON.has(stem)) return stem;
  if (POS_LEXICON.has(`${stem}e`)) return `${stem}e`;
  return stem;
}

function lemmatizePast(lower) {
  const stem = lower.slice(0, -2);
  if (lower.endsWith("ied")) return `${lower.slice(0, -3)}y`;
  if (stem.endsWith("rr")) return stem.slice(0, -1);
  if (POS_LEXICON.has(stem)) return stem;
  if (POS_LEXICON.has(`${stem}e`)) return `${stem}e`;
  return stem;
}

function lemmatizeThirdPerson(lower) {
  if (lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("ches") || lower.endsWith("shes") || lower.endsWith("sses") || lower.endsWith("xes")) return lower.slice(0, -2);
  const stem = lower.slice(0, -1);
  return POS_LEXICON.has(stem) ? stem : lower.slice(0, -2);
}
