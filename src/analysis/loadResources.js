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
  return ok(validateUniqueIds(value.patterns, "protectedTerms.patterns", "label"));
}

function validateSynonymCore(value) {
  if (!Array.isArray(value)) return fail("synonymCore must be an array.");
  const warnings = validateUniqueIds(value, "synonymCore");
  for (const entry of value) {
    requireFields(entry, ["id", "lemma", "pos", "replacements"], "synonymCore", warnings);
    validateAllowed(entry.pos, ALLOWED_POS_LABELS, `${entry.id}.pos`, warnings);
    for (const replacement of entry.replacements || []) {
      requireFields(replacement, ["lemma", "risk", "sections", "explanation"], entry.id, warnings);
      validateAllowed(replacement.risk, ALLOWED_RISK_LEVELS, `${entry.id}.risk`, warnings);
      validateSections(replacement.sections, `${entry.id}.sections`, warnings);
    }
  }
  return ok(warnings);
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
  return {
    protectedTerms: resources.protectedTerms,
    synonymCore: resources.synonymCore,
    synonymsByLemma: Object.fromEntries(resources.synonymCore.map((entry) => [entry.lemma, entry])),
    academicWordFamilies: resources.academicWordFamilies,
    collocationBank: resources.collocationBank,
    reportingVerbBank: resources.reportingVerbBank,
    reportingVerbsByLemma: Object.fromEntries(resources.reportingVerbBank.map((entry) => [entry.lemma, entry.replacements])),
    connectorBank: resources.connectorBank,
    cautiousWordingBank: resources.cautiousWordingBank,
    domainLexicon: resources.domainLexicon,
    phrasePatterns: resources.phrasePatterns,
    rewriteRules: resources.rewriteRules,
    personalBlacklistDefault: resources.personalBlacklistDefault
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
