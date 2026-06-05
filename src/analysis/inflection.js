import { describeSurface, isSamePos } from "./pos.js";
import { preserveCase } from "../utils/text.js";

const IRREGULAR_NOUNS = {
  analysis: { singular: "analysis", plural: "analyses" },
  criterion: { singular: "criterion", plural: "criteria" },
  phenomenon: { singular: "phenomenon", plural: "phenomena" },
  datum: { singular: "datum", plural: "data" }
};

const ADVERBS = {
  significant: "significantly",
  clear: "clearly",
  consistent: "consistently",
  effective: "effectively",
  important: "importantly",
  substantial: "substantially",
  general: "generally",
  specific: "specifically",
  frequent: "frequently",
  careful: "carefully",
  critical: "critically",
  meaningful: "meaningfully",
  considerable: "considerably"
};

export function inflectVerb(source, lemma) {
  return inflectReplacement(describeSurface(source), lemma, "verb").replacement;
}

export function inflectReplacement(sourceContext, replacementLemma, replacementPos = sourceContext.pos) {
  const phraseRewrite = !isSamePos(sourceContext.pos, replacementPos);
  let replacement = replacementLemma;

  if (!phraseRewrite && sourceContext.pos === "verb") {
    replacement = inflectVerbByContext(sourceContext, replacementLemma);
  } else if (!phraseRewrite && sourceContext.pos === "noun") {
    replacement = inflectNounByContext(sourceContext, replacementLemma);
  } else if (!phraseRewrite && sourceContext.pos === "adverb") {
    replacement = inflectAdverb(replacementLemma);
  }

  return {
    replacement: preserveCase(sourceContext.surface, replacement),
    phraseRewrite
  };
}

export function inflectVerbByContext(sourceContext, lemma) {
  if (lemma.includes(" ")) return inflectVerbPhrase(sourceContext, lemma);
  const form = sourceContext.verb?.tense || "base";
  if (form === "progressive") return toIng(lemma);
  if (form === "past" || form === "pastParticiple") return toPast(lemma);
  if (sourceContext.verb?.agreement === "thirdPersonSingular") return toThirdPerson(lemma);
  return lemma;
}

export function inflectNounByContext(sourceContext, lemma) {
  const number = sourceContext.noun?.number || "singular";
  return number === "plural" ? pluralizeNoun(lemma) : singularizeNoun(lemma);
}

export function inflectAdverb(lemma) {
  return ADVERBS[lemma] || (lemma.endsWith("ly") ? lemma : `${lemma}ly`);
}

export function pluralizeNoun(lemma) {
  if (IRREGULAR_NOUNS[lemma]) return IRREGULAR_NOUNS[lemma].plural;
  if (lemma.endsWith("y") && !/[aeiou]y$/i.test(lemma)) return `${lemma.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(lemma)) return `${lemma}es`;
  return `${lemma}s`;
}

export function singularizeNoun(surface) {
  for (const forms of Object.values(IRREGULAR_NOUNS)) {
    if (surface === forms.plural) return forms.singular;
  }
  return surface;
}

function inflectVerbPhrase(sourceContext, phrase) {
  if (phrase === "carry out") {
    const form = sourceContext.verb?.tense || "base";
    if (form === "progressive") return "carrying out";
    if (form === "past" || form === "pastParticiple") return "carried out";
    if (sourceContext.verb?.agreement === "thirdPersonSingular") return "carries out";
  }
  return phrase;
}

function toPast(lemma) {
  if (lemma === "find") return "found";
  if (lemma.endsWith("e")) return `${lemma}d`;
  if (lemma.endsWith("y") && !/[aeiou]y$/i.test(lemma)) return `${lemma.slice(0, -1)}ied`;
  return `${lemma}ed`;
}

function toIng(lemma) {
  if (lemma === "carry out") return "carrying out";
  if (lemma.endsWith("ie")) return `${lemma.slice(0, -2)}ying`;
  if (lemma.endsWith("e") && !lemma.endsWith("ee")) return `${lemma.slice(0, -1)}ing`;
  return `${lemma}ing`;
}

function toThirdPerson(lemma) {
  if (lemma === "carry out") return "carries out";
  if (lemma.endsWith("y") && !/[aeiou]y$/i.test(lemma)) return `${lemma.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(lemma)) return `${lemma}es`;
  return `${lemma}s`;
}
