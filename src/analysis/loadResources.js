import protectedTermsRaw from "../data/protected-terms.json" with { type: "json" };
import synonymCoreRaw from "../data/general-academic-synonym-core.json" with { type: "json" };
import academicWordFamiliesRaw from "../data/academic-word-families.json" with { type: "json" };
import collocationBankRaw from "../data/academic-collocation-bank.json" with { type: "json" };
import reportingVerbBankRaw from "../data/reporting-verbs-strength-bank.json" with { type: "json" };
import connectorBankRaw from "../data/academic-connectors-bank.json" with { type: "json" };
import cautiousWordingBankRaw from "../data/cautious-wording-bank.json" with { type: "json" };
import domainLexiconRaw from "../data/domain-lexicon.json" with { type: "json" };
import phrasePatternsRaw from "../data/academic-phrase-patterns.json" with { type: "json" };
import rewriteRulesRaw from "../data/rewrite-rules.json" with { type: "json" };
import personalBlacklistDefaultRaw from "../data/personal-blacklist.default.json" with { type: "json" };
import { ALLOWED_POS_LABELS, ALLOWED_RISK_LEVELS, ALLOWED_SECTIONS } from "../app/constants.js";

const VALIDATORS = {
  protectedTerms: validateProtectedTerms,
  synonymCore: validateSynonymCore,
  academicWordFamilies: validateIdArray,
  collocationBank: validateCollocationBank,
  reportingVerbBank: validateReportingVerbBank,
  connectorBank: validateConnectorBank,
  cautiousWordingBank: validateCautiousWordingBank,
  domainLexicon: validateDomainLexicon,
  phrasePatterns: validateIdArray,
  rewriteRules: validateIdArray,
  personalBlacklistDefault: validateIdArray
};

const RAW_RESOURCES = {
  protectedTerms: protectedTermsRaw,
  synonymCore: synonymCoreRaw,
  academicWordFamilies: academicWordFamiliesRaw,
  collocationBank: collocationBankRaw,
  reportingVerbBank: reportingVerbBankRaw,
  connectorBank: connectorBankRaw,
  cautiousWordingBank: cautiousWordingBankRaw,
  domainLexicon: domainLexiconRaw,
  phrasePatterns: phrasePatternsRaw,
  rewriteRules: rewriteRulesRaw,
  personalBlacklistDefault: personalBlacklistDefaultRaw
};

const EMPTY_RESOURCES = {
  protectedTerms: { exact: [], patterns: [] },
  synonymCore: [],
  academicWordFamilies: [],
  collocationBank: { good: [], blocked: [] },
  reportingVerbBank: [],
  connectorBank: { types: {}, warnings: [], overuse: [] },
  cautiousWordingBank: [],
  domainLexicon: [],
  phrasePatterns: [],
  rewriteRules: [],
  personalBlacklistDefault: []
};

export function loadResources() {
  const warnings = [];
  const resources = {};

  for (const [name, fallback] of Object.entries(EMPTY_RESOURCES)) {
    const raw = RAW_RESOURCES[name] ?? fallback;
    const validation = validateResource(name, raw);
    if (validation.warnings.length) {
      warnings.push(...validation.warnings);
      console.warn(`[HonorLex] Resource warning in ${name}:`, validation.warnings);
    }
    resources[name] = validation.valid ? raw : fallback;
  }

  const normalized = normalizeResources(resources);
  const health = createResourceHealth(normalized, warnings);
  return { resources: normalized, health };
}

function validateResource(name, value) {
  try {
    return VALIDATORS[name](value, name);
  } catch (error) {
    return { valid: false, warnings: [`${name}: ${error.message}`] };
  }
}

function ok(warnings = []) {
  return { valid: true, warnings };
}

function fail(message) {
  return { valid: false, warnings: [message] };
}

function validateIdArray(value, name) {
  if (!Array.isArray(value)) return fail(`${name} must be an array.`);
  return ok(validateUniqueIds(value, name));
}

function validateProtectedTerms(value) {
  if (!value || !Array.isArray(value.exact) || !Array.isArray(value.patterns)) {
    return fail("protectedTerms requires exact and patterns arrays.");
  }
  return ok(validateUniqueIds(value.patterns, "protectedTerms.patterns"));
}

function validateSynonymCore(value) {
  if (!Array.isArray(value)) return fail("synonymCore must be an array.");
  const warnings = validateUniqueIds(value, "synonymCore");
  for (const entry of value) {
    requireFields(entry, ["id", "lemma"], "synonymCore", warnings);
    const pos = entry.part_of_speech || entry.pos;
    if (!pos) warnings.push(`${entry.id}: missing required field "part_of_speech".`);
    validateAllowed(pos, ALLOWED_POS_LABELS, `${entry.id}.part_of_speech`, warnings);
    if (entry.risk_level) validateAllowed(entry.risk_level, ALLOWED_RISK_LEVELS, `${entry.id}.risk_level`, warnings);
    if (entry.best_sections) validateSections(entry.best_sections, `${entry.id}.best_sections`, warnings);
    if (entry.forms && typeof entry.forms !== "object") warnings.push(`${entry.id}.forms: forms must be an object.`);

    validateAlternativeGroup(entry.safe_alternatives, "Safe", entry, warnings);
    validateAlternativeGroup(entry.moderate_alternatives, "Moderate", entry, warnings);
    validateAlternativeGroup(entry.risky_alternatives, "Review carefully", entry, warnings);

    for (const replacement of entry.replacements || []) {
      requireFields(replacement, ["lemma", "risk", "sections", "explanation"], entry.id, warnings);
      validateAllowed(replacement.risk, ALLOWED_RISK_LEVELS, `${entry.id}.risk`, warnings);
      validateSections(replacement.sections, `${entry.id}.sections`, warnings);
      if (replacement.pos) validateAllowed(replacement.pos, ALLOWED_POS_LABELS, `${entry.id}.replacement.pos`, warnings);
    }
  }
  return ok(warnings);
}

function validateAlternativeGroup(alternatives, risk, entry, warnings) {
  if (alternatives == null) return;
  if (!Array.isArray(alternatives)) {
    warnings.push(`${entry.id}.${risk}: alternatives must be an array.`);
    return;
  }
  for (const alternative of alternatives) {
    const item = typeof alternative === "string" ? { lemma: alternative } : alternative;
    requireFields(item, ["lemma"], entry.id, warnings);
    if (item.pos) validateAllowed(item.pos, ALLOWED_POS_LABELS, `${entry.id}.alternative.pos`, warnings);
    if (item.sections) validateSections(item.sections, `${entry.id}.alternative.sections`, warnings);
    if (item.risk) validateAllowed(item.risk, ALLOWED_RISK_LEVELS, `${entry.id}.alternative.risk`, warnings);
  }
  validateAllowed(risk, ALLOWED_RISK_LEVELS, `${entry.id}.alternatives.risk`, warnings);
}

function validateCollocationBank(value) {
  if (!value || !Array.isArray(value.good) || !Array.isArray(value.blocked)) {
    return fail("collocationBank requires good and blocked arrays.");
  }
  const warnings = [...validateUniqueIds(value.good, "collocationBank.good"), ...validateUniqueIds(value.blocked, "collocationBank.blocked")];
  for (const item of [...value.good, ...value.blocked]) {
    requireFields(item, ["id", "risk", "explanation"], "collocationBank", warnings);
    validateAllowed(item.risk, ALLOWED_RISK_LEVELS, `${item.id}.risk`, warnings);
  }
  return ok(warnings);
}

function validateReportingVerbBank(value) {
  if (!Array.isArray(value)) return fail("reportingVerbBank must be an array.");
  const warnings = validateUniqueIds(value, "reportingVerbBank");
  for (const entry of value) {
    const isNewSchema = entry.verb != null;
    if (isNewSchema) {
      requireFields(entry, ["id", "verb", "forms", "strength_level", "certainty_level", "stance", "best_sections", "safer_alternatives", "stronger_alternatives", "risk_level"], "reportingVerbBank", warnings);
      validateAllowed(entry.risk_level, ALLOWED_RISK_LEVELS, `${entry.id}.risk_level`, warnings);
      validateSections(entry.best_sections || [], `${entry.id}.best_sections`, warnings);
      validateAllowed(entry.strength_level, ["cautious", "neutral", "strong", "absolute"], `${entry.id}.strength_level`, warnings);
      validateAllowed(entry.certainty_level, ["tentative", "moderate", "confident", "absolute"], `${entry.id}.certainty_level`, warnings);
      validateAllowed(entry.stance, ["neutral reporting", "author position", "critical stance", "finding report", "method description", "interpretation", "argumentation", "limitation"], `${entry.id}.stance`, warnings);
      validateReportingAlternatives(entry.safer_alternatives, entry, warnings);
      validateReportingAlternatives(entry.stronger_alternatives, entry, warnings);
      continue;
    }
    requireFields(entry, ["id", "lemma", "pos", "replacements"], "reportingVerbBank", warnings);
    validateAllowed(entry.pos, ALLOWED_POS_LABELS, `${entry.id}.pos`, warnings);
    for (const replacement of entry.replacements || []) {
      requireFields(replacement, ["lemma", "risk", "sections", "explanation"], entry.id, warnings);
      validateAllowed(replacement.risk, ALLOWED_RISK_LEVELS, `${entry.id}.risk`, warnings);
      validateSections(replacement.sections, `${entry.id}.sections`, warnings);
    }
  }
  return ok(warnings);
}

function validateReportingAlternatives(alternatives, entry, warnings) {
  if (!Array.isArray(alternatives)) {
    warnings.push(`${entry.id}: alternatives must be arrays.`);
    return;
  }
  for (const alternative of alternatives) {
    const item = typeof alternative === "string" ? { verb: alternative } : alternative;
    requireFields(item, ["verb"], entry.id, warnings);
    if (item.risk) validateAllowed(item.risk, ALLOWED_RISK_LEVELS, `${entry.id}.alternative.risk`, warnings);
    if (item.sections) validateSections(item.sections, `${entry.id}.alternative.sections`, warnings);
  }
}

function validateConnectorBank(value) {
  if (!value || typeof value.types !== "object" || !Array.isArray(value.warnings) || !Array.isArray(value.overuse)) {
    return fail("connectorBank requires types, warnings, and overuse.");
  }
  const warnings = validateUniqueIds(value.warnings, "connectorBank.warnings");
  for (const item of value.warnings) {
    requireFields(item, ["id", "pattern", "risk", "explanation"], "connectorBank", warnings);
    validateAllowed(item.risk, ALLOWED_RISK_LEVELS, `${item.id}.risk`, warnings);
  }
  return ok(warnings);
}

function validateCautiousWordingBank(value) {
  if (!Array.isArray(value)) return fail("cautiousWordingBank must be an array.");
  const warnings = validateUniqueIds(value, "cautiousWordingBank");
  for (const item of value) {
    requireFields(item, ["id", "pattern", "replacement", "risk", "explanation"], "cautiousWordingBank", warnings);
    validateAllowed(item.risk, ALLOWED_RISK_LEVELS, `${item.id}.risk`, warnings);
  }
  return ok(warnings);
}

function validateDomainLexicon(value) {
  if (!Array.isArray(value)) return fail("domainLexicon must be an array.");
  const warnings = validateUniqueIds(value, "domainLexicon");
  for (const item of value) {
    requireFields(item, ["id", "term", "pos"], "domainLexicon", warnings);
    validateAllowed(item.pos, ALLOWED_POS_LABELS, `${item.id}.pos`, warnings);
  }
  return ok(warnings);
}

function validateUniqueIds(items, name, field = "id") {
  const warnings = [];
  const seen = new Set();
  for (const item of items) {
    const id = item?.[field];
    if (!id) {
      warnings.push(`${name}: item is missing ${field}.`);
      continue;
    }
    if (seen.has(id)) warnings.push(`${name}: duplicate ${field} "${id}".`);
    seen.add(id);
  }
  return warnings;
}

function requireFields(item, fields, name, warnings) {
  for (const field of fields) {
    if (item?.[field] == null) warnings.push(`${name}: missing required field "${field}".`);
  }
}

function validateAllowed(value, allowed, label, warnings) {
  if (!allowed.includes(value)) warnings.push(`${label}: unsupported value "${value}".`);
}

function validateSections(sections, label, warnings) {
  if (!Array.isArray(sections)) {
    warnings.push(`${label}: sections must be an array.`);
    return;
  }
  for (const section of sections) validateAllowed(section, ALLOWED_SECTIONS, label, warnings);
}

function normalizeResources(resources) {
  const synonymCore = resources.synonymCore.map(normalizeSynonymEntry);
  const reportingVerbBank = resources.reportingVerbBank.map(normalizeReportingVerbEntry);
  return {
    protectedTerms: resources.protectedTerms,
    synonymCore,
    synonymsByLemma: Object.fromEntries(synonymCore.map((entry) => [entry.lemma, entry])),
    academicWordFamilies: resources.academicWordFamilies,
    collocationBank: resources.collocationBank,
    reportingVerbBank,
    reportingVerbsByLemma: Object.fromEntries(reportingVerbBank.map((entry) => [entry.verb, entry.replacements])),
    reportingVerbsByForm: createReportingVerbFormMap(reportingVerbBank),
    connectorBank: resources.connectorBank,
    cautiousWordingBank: resources.cautiousWordingBank,
    domainLexicon: resources.domainLexicon,
    phrasePatterns: resources.phrasePatterns,
    rewriteRules: resources.rewriteRules,
    personalBlacklistDefault: resources.personalBlacklistDefault
  };
}

function normalizeReportingVerbEntry(entry) {
  if (!entry.verb) {
    return {
      ...entry,
      verb: entry.lemma,
      forms: entry.forms || { base: entry.lemma },
      strength_level: "neutral",
      certainty_level: "moderate",
      stance: "neutral reporting",
      best_sections: entry.sections || ["General"],
      safe_use: "",
      risky_use: "",
      safer_alternatives: entry.replacements || [],
      stronger_alternatives: [],
      common_patterns: [],
      risk_level: "Safe",
      replacements: entry.replacements || []
    };
  }

  const replacements = [
    ...normalizeReportingAlternativeGroup(entry.safer_alternatives, "Safe", entry),
    ...normalizeReportingAlternativeGroup(entry.stronger_alternatives, "Review carefully", entry)
  ];

  return {
    ...entry,
    pos: "verb",
    replacements
  };
}

function normalizeReportingAlternativeGroup(alternatives = [], fallbackRisk, entry) {
  return alternatives.map((alternative) => {
    const item = typeof alternative === "string" ? { verb: alternative } : alternative;
    return {
      lemma: item.verb,
      pos: "verb",
      risk: item.risk || fallbackRisk,
      sections: item.sections || entry.best_sections || ["General"],
      explanation: item.explanation || `Reporting verb alternative for ${entry.verb}.`,
      strength_level: item.strength_level || entry.strength_level,
      certainty_level: item.certainty_level || entry.certainty_level,
      warning: item.warning || entry.warning
    };
  });
}

function createReportingVerbFormMap(entries) {
  const pairs = [];
  for (const entry of entries) {
    const forms = Object.values(entry.forms || {}).flat().filter(Boolean);
    for (const form of [entry.verb, ...forms]) {
      pairs.push([form.toLowerCase(), entry]);
    }
  }
  return Object.fromEntries(pairs.sort((a, b) => b[0].length - a[0].length));
}

function normalizeSynonymEntry(entry) {
  const pos = entry.part_of_speech || entry.pos;
  const bestSections = entry.best_sections || entry.sections || ["General"];
  const replacements = entry.replacements
    ? entry.replacements.map((replacement) => normalizeReplacement(replacement, pos, bestSections))
    : [
        ...normalizeAlternativeGroup(entry.safe_alternatives, "Safe", pos, bestSections),
        ...normalizeAlternativeGroup(entry.moderate_alternatives, "Moderate", pos, bestSections),
        ...normalizeAlternativeGroup(entry.risky_alternatives, "Review carefully", pos, bestSections)
      ];

  return {
    ...entry,
    pos,
    forms: entry.forms || { base: entry.lemma },
    context_rules: entry.context_rules || [],
    collocation_rules: entry.collocation_rules || [],
    best_sections: bestSections,
    replacements
  };
}

function normalizeAlternativeGroup(alternatives = [], risk, pos, bestSections) {
  return alternatives.map((alternative) => normalizeReplacement(alternative, pos, bestSections, risk));
}

function normalizeReplacement(alternative, pos, bestSections, fallbackRisk) {
  const item = typeof alternative === "string" ? { lemma: alternative } : alternative;
  return {
    lemma: item.lemma,
    pos: item.pos || pos,
    risk: item.risk || fallbackRisk || "Safe",
    sections: item.sections || item.best_sections || bestSections,
    explanation: item.explanation || "Common academic alternative with matching part of speech."
  };
}

function createResourceHealth(resources, warnings) {
  return {
    warnings,
    counts: {
      synonyms: resources.synonymCore.length,
      collocations: resources.collocationBank.good.length + resources.collocationBank.blocked.length,
      connectors: Object.values(resources.connectorBank.types).reduce((sum, group) => sum + group.length, 0),
      reportingVerbs: resources.reportingVerbBank.length,
      protectedTerms: resources.protectedTerms.exact.length + resources.protectedTerms.patterns.length,
      rewriteRules: resources.rewriteRules.length,
      cautiousWordingRules: resources.cautiousWordingBank.length
    }
  };
}
