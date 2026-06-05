import { safeRegExp } from "../utils/regex.js";

const LINKING_COMMA_RE = /(^|[.!?]\s+)(however|therefore|moreover|nevertheless|consequently|additionally|furthermore|overall|similarly|likewise)\s+(?!,)/giu;
const STACKING_RE = /\b(however|therefore|moreover|furthermore|nevertheless|consequently),?\s+(however|therefore|moreover|furthermore|nevertheless|consequently),?/giu;
const OVERUSE_CONNECTORS = ["however", "moreover", "furthermore", "therefore"];

export function analyzeConnectors({ text, focus, resources, addSuggestion }) {
  const connectorBank = resources.connectorBank || { warnings: [], overuse: [] };
  analyzeGrammarWarnings({ text, focus, connectorBank, addSuggestion });
  analyzeConnectorStacking({ text, addSuggestion });
  analyzeConnectorOveruse({ text, connectorBank, addSuggestion });
  suggestParagraphConnector({ text, focus, connectorBank, addSuggestion });
}

function analyzeGrammarWarnings({ text, focus, connectorBank, addSuggestion }) {
  addAlthoughPhraseWarnings(text, focus, addSuggestion);
  addDespiteClauseWarnings(text, focus, addSuggestion);
  addDueToClauseWarnings(text, focus, addSuggestion);
  addBecausePhraseWarnings(text, focus, addSuggestion);
  addLinkingCommaWarnings(text, focus, addSuggestion);

  for (const item of connectorBank.warnings || []) {
    if (["conn-linking-comma", "conn-stacking"].includes(item.id)) continue;
    const re = safeRegExp(item.pattern);
    if (!re) continue;
    for (const match of text.matchAll(re)) {
      if (alreadyHandled(match[0])) continue;
      addConnectorSuggestion({
        addSuggestion,
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        replacement: item.replacement_hint || match[0],
        risk: item.risk,
        explanation: item.explanation,
        meta: "grammar validation",
        scores: connectorScores(item.risk, 92)
      });
    }
  }
}

function analyzeConnectorOveruse({ text, connectorBank, addSuggestion }) {
  for (const connector of connectorBank.overuse || OVERUSE_CONNECTORS) {
    const matches = [...text.matchAll(new RegExp(`\\b${escapeRegExp(connector)}\\b`, "giu"))];
    if (matches.length > 2) {
      const match = matches[2];
      addConnectorSuggestion({
        addSuggestion,
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        replacement: "review connector choice",
        risk: "Moderate",
        explanation: `${connector} appears repeatedly. Review whether each transition is needed.`,
        meta: "overuse",
        scores: connectorScores("Moderate", 76)
      });
    }
  }
}

function analyzeConnectorStacking({ text, addSuggestion }) {
  for (const match of text.matchAll(STACKING_RE)) {
    const first = match[1];
    addConnectorSuggestion({
      addSuggestion,
      start: match.index,
      end: match.index + match[0].length,
      original: match[0],
      replacement: `${first},`,
      risk: "Moderate",
      explanation: "Avoid stacking sentence connectors mechanically; keep one connector that matches the relation.",
      meta: "connector stacking",
      scores: connectorScores("Moderate", 82)
    });
  }
}

function suggestParagraphConnector({ text, focus, connectorBank, addSuggestion }) {
  const trimmed = text.trim();
  if (!trimmed || /^(however|therefore|moreover|furthermore|in addition|overall|although|despite)\b/i.test(trimmed)) return;
  const relation = inferRelation(trimmed);
  if (!relation) return;
  const entry = connectorBank.entries?.find((item) => item.category === relation.category && item.connector === relation.connector);
  if (!entry) return;
  addConnectorSuggestion({
    addSuggestion,
    start: 0,
    end: 0,
    original: "",
    replacement: `${entry.connector[0].toUpperCase()}${entry.connector.slice(1)}, `,
    risk: entry.risk_level,
    explanation: `The paragraph appears to express ${entry.category}; "${entry.connector}" can make the relation explicit when appropriate.`,
    meta: `${entry.connector_type} / ${entry.category}`,
    scores: connectorScores(entry.risk_level, focus && entry.best_sections.includes(focus) ? 78 : 70)
  });
}

function addAlthoughPhraseWarnings(text, focus, addSuggestion) {
  const re = /\balthough\s+((?:the|a|an)\s+[A-Za-z-]+(?:\s+[A-Za-z-]+){0,3}),/giu;
  for (const match of text.matchAll(re)) {
    const phrase = match[1];
    if (/\b(was|were|is|are|has|have|did|does|do|can|could|may|might|should|would)\b/i.test(phrase)) continue;
    addConnectorSuggestion({
      addSuggestion,
      start: match.index,
      end: match.index + match[0].length,
      original: match[0],
      replacement: match[0].replace(/^although/i, "Despite"),
      risk: "Safe",
      explanation: "Although should introduce a full clause. Use despite before a noun phrase.",
      meta: "subordinator vs prepositional connector",
      scores: connectorScores("Safe", 96)
    });
  }
}

function addDespiteClauseWarnings(text, focus, addSuggestion) {
  const re = /\bdespite\s+([^,.]+?\b(?:was|were|is|are|has|have|did|does|do|can|could|may|might|should|would)\b[^,.]*),?/giu;
  for (const match of text.matchAll(re)) {
    addConnectorSuggestion({
      addSuggestion,
      start: match.index,
      end: match.index + match[0].length,
      original: match[0],
      replacement: match[0].replace(/^despite/i, "Although"),
      risk: "Safe",
      explanation: "Despite should introduce a noun phrase or gerund. Use although before a full clause.",
      meta: "prepositional connector vs subordinator",
      scores: connectorScores("Safe", 96)
    });
  }
}

function addDueToClauseWarnings(text, focus, addSuggestion) {
  const re = /\bdue to\s+([^,.]+?\b(?:did|does|do|was|were|is|are|has|have|can|could|may|might|should|would)\b[^,.]*)/giu;
  for (const match of text.matchAll(re)) {
    addConnectorSuggestion({
      addSuggestion,
      start: match.index,
      end: match.index + match[0].length,
      original: match[0],
      replacement: match[0].replace(/^due to/i, "because"),
      risk: "Safe",
      explanation: "Due to should be followed by a noun phrase. Use because before a full clause.",
      meta: "cause connector grammar",
      scores: connectorScores("Safe", 95)
    });
  }
}

function addBecausePhraseWarnings(text, focus, addSuggestion) {
  const re = /\bbecause\s+((?:the|a|an)\s+[A-Za-z-]+(?:\s+[A-Za-z-]+){0,4}),/giu;
  for (const match of text.matchAll(re)) {
    const phrase = match[1];
    if (/\b(was|were|is|are|has|have|did|does|do|can|could|may|might|should|would)\b/i.test(phrase)) continue;
    addConnectorSuggestion({
      addSuggestion,
      start: match.index,
      end: match.index + match[0].length,
      original: match[0],
      replacement: match[0].replace(/^because/i, "Because of"),
      risk: "Moderate",
      explanation: "Because introduces a clause. Because of introduces a noun phrase.",
      meta: "cause connector grammar",
      scores: connectorScores("Moderate", 86)
    });
  }
}

function addLinkingCommaWarnings(text, focus, addSuggestion) {
  for (const match of text.matchAll(LINKING_COMMA_RE)) {
    const prefix = match[1] || "";
    const connector = match[2];
    const start = match.index + prefix.length;
    addConnectorSuggestion({
      addSuggestion,
      start,
      end: start + connector.length,
      original: connector,
      replacement: `${connector},`,
      risk: "Safe",
      explanation: "Sentence-initial linking adverbials such as however, therefore, moreover, and nevertheless normally need a comma.",
      meta: "punctuation rule",
      scores: connectorScores("Safe", 98)
    });
  }
}

function inferRelation(text) {
  if (/\b(small sample|limited|limitation|cautious|however)\b/i.test(text)) return { category: "limitation", connector: "however" };
  if (/\b(result|therefore|because|lead to|as a result)\b/i.test(text)) return { category: "consequence/result", connector: "therefore" };
  if (/\b(similar|consistent|likewise|same)\b/i.test(text)) return { category: "comparison", connector: "similarly" };
  return null;
}

function addConnectorSuggestion({ addSuggestion, start, end, original, replacement, risk, explanation, meta, scores }) {
  addSuggestion({
    kind: "Connector",
    start,
    end,
    original,
    replacement,
    risk,
    explanation,
    meta,
    scores
  });
}

function connectorScores(risk, overall) {
  return {
    grammar_fit_score: Math.min(100, overall + 2),
    collocation_fit_score: 82,
    academic_naturalness_score: risk === "Safe" ? 88 : 76,
    claim_risk_score: risk === "Safe" ? 12 : 42,
    overall_score: overall
  };
}

function alreadyHandled(original) {
  return /^(although|despite|due to|because)\b/i.test(original);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
