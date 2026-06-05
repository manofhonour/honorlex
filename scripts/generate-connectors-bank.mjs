import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SECTIONS = ["General", "Literature", "Method", "Findings", "Discussion", "Conclusion", "TR Dizin", "APA/Style"];
const TYPE = {
  coord: "coordinating_conjunction",
  sub: "subordinating_conjunction",
  adv: "linking_adverbial",
  prep: "prepositional_connector",
  phrase: "phrase_connector"
};

const rows = [
  ["addition", "and", TYPE.coord, "between_words_phrases_or_clauses", "usually no comma for simple pairs", "connects parallel items or clauses"],
  ["addition", "also", TYPE.adv, "mid_sentence_or_sentence_start", "comma optional at sentence start", "adds a related point"],
  ["addition", "in addition", TYPE.adv, "sentence_start", "comma after connector", "adds a related sentence-level point"],
  ["addition", "additionally", TYPE.adv, "sentence_start", "comma after connector", "adds a related point"],
  ["addition", "moreover", TYPE.adv, "sentence_start", "comma after connector", "adds a stronger related point"],
  ["addition", "furthermore", TYPE.adv, "sentence_start", "comma after connector", "adds a further related point"],
  ["addition", "besides", TYPE.adv, "sentence_start", "comma after connector", "informal in some academic contexts"],
  ["addition", "as well as", TYPE.prep, "between_parallel_elements", "no comma unless needed for clarity", "connects parallel noun phrases or clauses"],
  ["addition", "not only...but also", TYPE.phrase, "paired_structure", "parallel grammar required", "adds emphasis through parallel structure"],
  ["addition", "another point is that", TYPE.phrase, "sentence_start", "comma usually not required after that", "adds a new point explicitly"],
  ["contrast", "but", TYPE.coord, "between_clauses", "comma before but when joining clauses", "marks contrast"],
  ["contrast", "however", TYPE.adv, "sentence_start", "comma after connector", "marks sentence-level contrast"],
  ["contrast", "nevertheless", TYPE.adv, "sentence_start", "comma after connector", "marks contrast despite preceding point"],
  ["contrast", "nonetheless", TYPE.adv, "sentence_start", "comma after connector", "marks contrast despite preceding point"],
  ["contrast", "in contrast", TYPE.adv, "sentence_start", "comma after connector", "marks contrast"],
  ["contrast", "by contrast", TYPE.adv, "sentence_start", "comma after connector", "marks contrast"],
  ["contrast", "on the other hand", TYPE.adv, "sentence_start", "comma after connector", "marks contrast with another side"],
  ["contrast", "whereas", TYPE.sub, "between_clauses", "comma before whereas when second clause contrasts", "connects two contrasting clauses"],
  ["contrast", "while", TYPE.sub, "between_clauses", "comma depends on clause order", "can mark contrast between clauses"],
  ["contrast", "conversely", TYPE.adv, "sentence_start", "comma after connector", "marks opposite relation"],
  ["contrast", "yet", TYPE.coord, "between_clauses", "comma before yet when joining clauses", "marks contrast"],
  ["contrast", "still", TYPE.adv, "sentence_start", "comma often after connector", "marks continuing contrast"],
  ["concession", "although", TYPE.sub, "before_clause", "comma after introductory although-clause", "must be followed by a full clause"],
  ["concession", "though", TYPE.sub, "before_clause_or_clause_end", "comma depends on position", "must introduce or follow a clause"],
  ["concession", "even though", TYPE.sub, "before_clause", "comma after introductory clause", "must be followed by a full clause"],
  ["concession", "despite", TYPE.prep, "before_noun_phrase_or_gerund", "comma after introductory phrase", "must be followed by a noun phrase or gerund"],
  ["concession", "in spite of", TYPE.prep, "before_noun_phrase_or_gerund", "comma after introductory phrase", "must be followed by a noun phrase or gerund"],
  ["concession", "regardless of", TYPE.prep, "before_noun_phrase", "comma after introductory phrase", "must be followed by a noun phrase"],
  ["concession", "even so", TYPE.adv, "sentence_start", "comma after connector", "marks concession across sentences"],
  ["concession", "admittedly", TYPE.adv, "sentence_start", "comma after connector", "acknowledges a limitation"],
  ["concession", "while it is true that", TYPE.phrase, "before_clause", "comma after introductory clause", "introduces a conceded clause"],
  ["concession", "despite this", TYPE.adv, "sentence_start", "comma after connector", "marks concession across sentences"],
  ["cause/reason", "because", TYPE.sub, "before_clause", "no comma when reason follows main clause", "must be followed by a clause"],
  ["cause/reason", "since", TYPE.sub, "before_clause", "comma depends on position", "introduces reason or time clause"],
  ["cause/reason", "as", TYPE.sub, "before_clause", "comma depends on position", "introduces reason clause"],
  ["cause/reason", "because of", TYPE.prep, "before_noun_phrase", "no comma inside phrase", "must be followed by a noun phrase"],
  ["cause/reason", "due to", TYPE.prep, "before_noun_phrase", "no comma inside phrase", "must be followed by a noun phrase"],
  ["cause/reason", "owing to", TYPE.prep, "before_noun_phrase", "no comma inside phrase", "must be followed by a noun phrase"],
  ["cause/reason", "on account of", TYPE.prep, "before_noun_phrase", "no comma inside phrase", "must be followed by a noun phrase"],
  ["cause/reason", "given that", TYPE.sub, "before_clause", "comma after introductory clause", "must be followed by a clause"],
  ["cause/reason", "in view of", TYPE.prep, "before_noun_phrase", "comma after introductory phrase when sentence-initial", "must be followed by a noun phrase"],
  ["cause/reason", "as a result of", TYPE.prep, "before_noun_phrase", "comma after introductory phrase when sentence-initial", "must be followed by a noun phrase"],
  ["consequence/result", "therefore", TYPE.adv, "sentence_start", "comma after connector", "marks result"],
  ["consequence/result", "thus", TYPE.adv, "sentence_start", "comma after connector", "marks result or inference"],
  ["consequence/result", "consequently", TYPE.adv, "sentence_start", "comma after connector", "marks result"],
  ["consequence/result", "as a result", TYPE.adv, "sentence_start", "comma after connector", "marks result"],
  ["consequence/result", "for this reason", TYPE.adv, "sentence_start", "comma after connector", "marks reasoned result"],
  ["consequence/result", "accordingly", TYPE.adv, "sentence_start", "comma after connector", "marks result"],
  ["consequence/result", "hence", TYPE.adv, "sentence_start", "comma usually after connector", "marks result; can sound formal"],
  ["consequence/result", "this suggests that", TYPE.phrase, "sentence_start", "no comma after that", "introduces cautious inference"],
  ["consequence/result", "this may explain why", TYPE.phrase, "sentence_start", "no comma after why", "introduces cautious explanation"],
  ["consequence/result", "this can be attributed to", TYPE.phrase, "sentence_start", "follow with noun phrase", "introduces attribution"],
  ["clarification", "that is", TYPE.adv, "sentence_start_or_mid_sentence", "comma after connector", "clarifies meaning"],
  ["clarification", "in other words", TYPE.adv, "sentence_start", "comma after connector", "restates meaning"],
  ["clarification", "to put it differently", TYPE.adv, "sentence_start", "comma after connector", "restates meaning"],
  ["clarification", "more specifically", TYPE.adv, "sentence_start", "comma after connector", "narrows meaning"],
  ["clarification", "to clarify", TYPE.adv, "sentence_start", "comma after connector", "clarifies meaning"],
  ["clarification", "namely", TYPE.adv, "mid_sentence", "comma before and after when parenthetical", "specifies an item"],
  ["clarification", "what this means is that", TYPE.phrase, "sentence_start", "no comma after that", "explains implication"],
  ["illustration", "for example", TYPE.adv, "sentence_start_or_mid_sentence", "comma after connector", "introduces example"],
  ["illustration", "for instance", TYPE.adv, "sentence_start_or_mid_sentence", "comma after connector", "introduces example"],
  ["illustration", "such as", TYPE.prep, "before_examples", "no comma directly after such as", "introduces examples"],
  ["illustration", "including", TYPE.prep, "before_examples", "comma before including when nonessential", "introduces examples"],
  ["illustration", "as illustrated by", TYPE.prep, "before_noun_phrase", "comma depends on position", "points to example"],
  ["illustration", "as shown in", TYPE.prep, "before_noun_phrase", "comma depends on position", "points to table or figure"],
  ["illustration", "to illustrate", TYPE.adv, "sentence_start", "comma after connector", "introduces illustration"],
  ["comparison", "similarly", TYPE.adv, "sentence_start", "comma after connector", "marks similarity"],
  ["comparison", "likewise", TYPE.adv, "sentence_start", "comma after connector", "marks similarity"],
  ["comparison", "in the same way", TYPE.adv, "sentence_start", "comma after connector", "marks similarity"],
  ["comparison", "in a similar vein", TYPE.adv, "sentence_start", "comma after connector", "marks similarity"],
  ["comparison", "consistent with this", TYPE.adv, "sentence_start", "comma after connector", "marks alignment"],
  ["comparison", "parallel to this", TYPE.adv, "sentence_start", "comma after connector", "marks parallel relation"],
  ["sequence", "first", TYPE.adv, "sentence_start", "comma after connector", "marks first step"],
  ["sequence", "second", TYPE.adv, "sentence_start", "comma after connector", "marks second step"],
  ["sequence", "third", TYPE.adv, "sentence_start", "comma after connector", "marks third step"],
  ["sequence", "finally", TYPE.adv, "sentence_start", "comma after connector", "marks final step"],
  ["sequence", "next", TYPE.adv, "sentence_start", "comma after connector", "marks next step"],
  ["sequence", "then", TYPE.adv, "sentence_start", "comma usually after connector", "marks sequence"],
  ["sequence", "subsequently", TYPE.adv, "sentence_start", "comma after connector", "marks later step"],
  ["sequence", "before this", TYPE.adv, "sentence_start", "comma after connector", "marks earlier step"],
  ["sequence", "after this", TYPE.adv, "sentence_start", "comma after connector", "marks later step"],
  ["sequence", "at this stage", TYPE.adv, "sentence_start", "comma after connector", "marks stage"],
  ["sequence", "following this", TYPE.adv, "sentence_start", "comma after connector", "marks following step"],
  ["summary/conclusion", "overall", TYPE.adv, "sentence_start", "comma after connector", "summarizes"],
  ["summary/conclusion", "in sum", TYPE.adv, "sentence_start", "comma after connector", "summarizes"],
  ["summary/conclusion", "in summary", TYPE.adv, "sentence_start", "comma after connector", "summarizes"],
  ["summary/conclusion", "to summarize", TYPE.adv, "sentence_start", "comma after connector", "summarizes"],
  ["summary/conclusion", "in conclusion", TYPE.adv, "sentence_start", "comma after connector", "concludes"],
  ["summary/conclusion", "to conclude", TYPE.adv, "sentence_start", "comma after connector", "concludes"],
  ["summary/conclusion", "taken as a whole", TYPE.adv, "sentence_start", "comma after connector", "summarizes evidence"],
  ["summary/conclusion", "the evidence suggests", TYPE.phrase, "sentence_start", "no comma after suggests", "summarizes evidence cautiously"],
  ["summary/conclusion", "these findings suggest", TYPE.phrase, "sentence_start", "no comma after suggest", "summarizes findings cautiously"],
  ["qualification", "to some extent", TYPE.adv, "sentence_start_or_mid_sentence", "comma depends on position", "qualifies claim"],
  ["qualification", "in some cases", TYPE.adv, "sentence_start", "comma after connector", "qualifies scope"],
  ["qualification", "in this respect", TYPE.adv, "sentence_start", "comma after connector", "qualifies relation"],
  ["qualification", "in this regard", TYPE.adv, "sentence_start", "comma after connector", "qualifies relation"],
  ["qualification", "under certain conditions", TYPE.prep, "sentence_start", "comma after introductory phrase", "qualifies conditions"],
  ["qualification", "depending on", TYPE.prep, "before_noun_phrase", "comma depends on position", "qualifies condition"],
  ["qualification", "where appropriate", TYPE.adv, "sentence_start_or_end", "comma depends on position", "qualifies applicability"],
  ["qualification", "in specific contexts", TYPE.adv, "sentence_start", "comma after introductory phrase", "qualifies context"],
  ["limitation", "however", TYPE.adv, "sentence_start", "comma after connector", "marks limitation or contrast"],
  ["limitation", "nevertheless", TYPE.adv, "sentence_start", "comma after connector", "marks limitation despite evidence"],
  ["limitation", "despite this", TYPE.adv, "sentence_start", "comma after connector", "marks limitation"],
  ["limitation", "this should be interpreted cautiously", TYPE.phrase, "sentence_start", "no comma required", "adds caution"],
  ["limitation", "a limitation of this is", TYPE.phrase, "sentence_start", "no comma required", "introduces limitation"],
  ["limitation", "this finding is limited by", TYPE.phrase, "sentence_start", "follow with noun phrase", "introduces limitation"],
  ["limitation", "it should be noted that", TYPE.phrase, "sentence_start", "comma usually not required", "adds caution"]
];

const warnings = [
  ["conn-despite-clause", "\\bdespite\\s+(?:the|a|an)?\\s*[A-Za-z-]+\\s+(?:was|were|is|are|has|have|did|does|do|can|could|may|might|should|would)\\b", "Although", "Despite should introduce a noun phrase or gerund, not a full clause.", "Safe"],
  ["conn-although-phrase", "\\balthough\\s+(?:the|a|an)\\s+[A-Za-z-]+\\s*,", "Despite", "Although should introduce a full clause. Use despite before a noun phrase.", "Moderate"],
  ["conn-linking-comma", "^(\\s*)(however|therefore|moreover|nevertheless|consequently|additionally|furthermore|overall|similarly|likewise)\\s+(?!,)", "$2, ", "Sentence-initial linking adverbials normally need a comma.", "Safe"],
  ["conn-due-to-clause", "\\bdue to\\s+[A-Za-z-]+\\s+(?:did|does|do|was|were|is|are|has|have|can|could|may|might|should|would)\\b", "because", "Due to should be followed by a noun phrase; use because before a clause.", "Safe"],
  ["conn-because-phrase", "\\bbecause\\s+(?:of\\s+)?(?:the|a|an)\\s+[A-Za-z-]+\\s*,", "because of", "Because introduces a clause; because of introduces a noun phrase.", "Moderate"],
  ["conn-stacking", "\\b(?:however|therefore|moreover|furthermore|nevertheless|consequently),?\\s+(?:however|therefore|moreover|furthermore|nevertheless|consequently),?", "", "Avoid stacking sentence connectors mechanically.", "Moderate"]
];

const overuse = ["however", "moreover", "furthermore", "therefore"];

const entries = rows.map(([category, connector, connectorType, position, punctuationRule, grammarRule], index) => ({
  id: `conn-${String(index + 1).padStart(3, "0")}-${connector.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}`,
  connector,
  category,
  connector_type: connectorType,
  position,
  punctuation_rule: punctuationRule,
  grammar_rule: grammarRule,
  best_sections: sectionFor(category),
  example: exampleFor(connector, category),
  avoid_when: avoidWhen(connector, connectorType),
  warning: warningFor(connector),
  risk_level: riskFor(connector)
}));

const bank = {
  entries,
  types: Object.fromEntries(groupBy(entries, "category")),
  warnings: warnings.map(([id, pattern, replacement_hint, explanation, risk]) => ({ id, pattern, replacement_hint, explanation, risk })),
  overuse
};

writeFileSync(resolve("src/data/academic-connectors-bank.json"), `${JSON.stringify(bank, null, 2)}\n`);
console.log(JSON.stringify({ entries: entries.length, warnings: bank.warnings.length }, null, 2));

function groupBy(items, field) {
  const map = new Map();
  for (const item of items) {
    const group = map.get(item[field]) || [];
    group.push(item.connector);
    map.set(item[field], group);
  }
  return map;
}

function sectionFor(category) {
  if (category === "sequence") return ["Method", "Findings", "General"];
  if (category === "summary/conclusion") return ["Discussion", "Conclusion", "General"];
  if (category === "limitation") return ["Discussion", "Conclusion", "APA/Style"];
  if (category === "illustration") return ["General", "Literature", "Findings", "Discussion"];
  return SECTIONS;
}

function exampleFor(connector, category) {
  if (connector === "although") return "Although the sample was small, the findings are useful.";
  if (connector === "despite") return "Despite the small sample, the findings are useful.";
  if (connector === "whereas") return "Secondary teachers used L1 frequently, whereas high school teachers were more selective.";
  if (connector === "however") return "However, the findings should be interpreted cautiously.";
  if (connector === "due to") return "The variation may be due to limited exposure.";
  if (connector === "because") return "The teacher used L1 because students did not understand the task.";
  return `${connector[0].toUpperCase()}${connector.slice(1)}, this connector can support ${category}.`;
}

function avoidWhen(connector, connectorType) {
  if (connector === "although") return "Avoid before only a noun phrase.";
  if (connector === "despite" || connector === "in spite of") return "Avoid before a full finite clause.";
  if (connector === "due to") return "Avoid before a full clause.";
  if (connector === "because") return "Avoid before only a noun phrase unless using because of.";
  if (connectorType === TYPE.adv) return "Avoid repeated mechanical use in consecutive sentences.";
  return "";
}

function warningFor(connector) {
  if (["however", "moreover", "furthermore", "therefore"].includes(connector)) return "Avoid mechanical overuse.";
  if (connector === "besides") return "Can sound informal; review academic tone.";
  if (connector === "hence") return "Can sound overly formal in some contexts.";
  return "";
}

function riskFor(connector) {
  if (["besides", "hence", "claim"].includes(connector)) return "Moderate";
  return "Safe";
}
