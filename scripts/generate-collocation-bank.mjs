import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SECTIONS = ["General", "Literature", "Method", "Findings", "Discussion", "Conclusion", "TR Dizin", "APA/Style"];
const METHOD = ["General", "Method", "Findings", "TR Dizin"];
const FINDINGS = ["General", "Findings", "Discussion"];
const LIT = ["General", "Literature", "Discussion", "APA/Style"];

const natural = [
  ["research", "conduct research", "verb+noun", "research process", METHOD],
  ["study", "conduct a study", "verb+noun", "research process", METHOD],
  ["analysis", "carry out an analysis", "verb+noun", "analysis process", METHOD],
  ["analysis", "perform an analysis", "verb+noun", "analysis process", METHOD],
  ["data", "analyze data", "verb+noun", "analysis process", METHOD],
  ["data", "interpret data", "verb+noun", "interpretation", FINDINGS],
  ["interview", "code interviews", "verb+noun", "qualitative analysis", METHOD],
  ["interview", "transcribe interviews", "verb+noun", "data preparation", METHOD],
  ["data", "collect data", "verb+noun", "data collection", METHOD],
  ["data", "gather data", "verb+noun", "data collection", METHOD],
  ["data", "obtain data", "verb+noun", "data collection", METHOD],
  ["findings", "present findings", "verb+noun", "finding report", FINDINGS],
  ["results", "report results", "verb+noun", "finding report", FINDINGS],
  ["findings", "interpret findings", "verb+noun", "interpretation", FINDINGS],
  ["implication", "discuss implications", "verb+noun", "discussion move", ["Discussion", "Conclusion"]],
  ["gap", "address a gap", "verb+noun", "literature gap", LIT],
  ["gap", "identify a gap", "verb+noun", "literature gap", LIT],
  ["gap", "fill a gap", "verb+noun", "literature gap", LIT],
  ["contribution", "make a contribution", "verb+noun", "research contribution", ["Discussion", "Conclusion"]],
  ["explanation", "offer an explanation", "verb+noun", "interpretation", FINDINGS],
  ["evidence", "provide evidence", "verb+noun", "supporting claim", FINDINGS],
  ["support", "provide support", "verb+noun", "supporting claim", FINDINGS],
  ["insight", "provide insight", "verb+noun", "interpretation", FINDINGS],
  ["question", "raise a question", "verb+noun", "critical discussion", LIT],
  ["problem", "pose a problem", "verb+noun", "problem statement", LIT],
  ["distinction", "draw a distinction", "verb+noun", "conceptual contrast", LIT],
  ["distinction", "make a distinction", "verb+noun", "conceptual contrast", LIT],
  ["relationship", "establish a relationship", "verb+noun", "relationship claim", FINDINGS],
  ["relationship", "examine a relationship", "verb+noun", "analysis process", METHOD],
  ["pattern", "identify a pattern", "verb+noun", "finding report", FINDINGS],
  ["pattern", "observe a pattern", "verb+noun", "finding report", FINDINGS],
  ["tendency", "show a tendency", "verb+noun", "finding report", FINDINGS],
  ["tendency", "suggest a tendency", "verb+noun", "cautious finding", FINDINGS],
  ["role", "play a role", "verb+noun", "interpretation", FINDINGS],
  ["function", "serve a function", "verb+noun", "interpretation", FINDINGS],
  ["effect", "have an effect", "verb+noun", "effect statement", FINDINGS],
  ["influence", "exert an influence", "verb+noun", "influence statement", FINDINGS],
  ["association", "be associated with", "verb+preposition", "relationship claim", FINDINGS],
  ["relationship", "be related to", "verb+preposition", "relationship claim", FINDINGS],
  ["link", "be linked to", "verb+preposition", "relationship claim", FINDINGS],
  ["depend", "depend on", "verb+preposition", "relationship claim", FINDINGS],
  ["result", "result in", "verb+preposition", "consequence", FINDINGS],
  ["lead", "lead to", "verb+preposition", "consequence", FINDINGS],
  ["contribution", "contribute to", "verb+preposition", "contribution", FINDINGS],
  ["account", "account for", "verb+preposition", "explanation", FINDINGS],
  ["focus", "focus on", "verb+preposition", "scope", SECTIONS],
  ["reference", "refer to", "verb+preposition", "reference", LIT],
  ["composition", "consist of", "verb+preposition", "description", SECTIONS],
  ["basis", "be based on", "verb+preposition", "basis", SECTIONS],
  ["concern", "be concerned with", "verb+preposition", "scope", LIT],
  ["limitation", "be limited to", "verb+preposition", "limitation", ["Method", "Discussion", "Conclusion"]],
  ["consistency", "be consistent with", "verb+preposition", "comparison", FINDINGS],
  ["comparison", "be comparable to", "verb+preposition", "comparison", FINDINGS],
  ["relevance", "be relevant to", "verb+preposition", "relevance", SECTIONS],
  ["appropriacy", "be appropriate for", "verb+preposition", "appropriacy", SECTIONS],
  ["usefulness", "be useful for", "verb+preposition", "usefulness", SECTIONS],
  ["centrality", "be central to", "verb+preposition", "centrality", SECTIONS],
  ["significance", "be significant for", "verb+preposition", "significance", FINDINGS],
  ["evidence", "empirical evidence", "adjective+noun", "evidence", FINDINGS],
  ["evidence", "strong evidence", "adjective+noun", "evidence", FINDINGS],
  ["evidence", "limited evidence", "adjective+noun", "evidence", FINDINGS],
  ["evidence", "available evidence", "adjective+noun", "evidence", FINDINGS],
  ["data", "qualitative data", "adjective+noun", "data type", METHOD],
  ["data", "quantitative data", "adjective+noun", "data type", METHOD],
  ["data", "interview data", "noun+noun", "data type", METHOD],
  ["data", "survey data", "noun+noun", "data type", METHOD],
  ["data", "self-reported data", "adjective+noun", "data type", METHOD],
  ["statistics", "descriptive statistics", "adjective+noun", "analysis type", METHOD],
  ["analysis", "statistical analysis", "adjective+noun", "analysis type", METHOD],
  ["analysis", "thematic analysis", "adjective+noun", "analysis type", METHOD],
  ["analysis", "critical analysis", "adjective+noun", "analysis type", LIT],
  ["analysis", "discourse analysis", "noun+noun", "domain method", METHOD],
  ["analysis", "textual analysis", "adjective+noun", "domain method", METHOD],
  ["practice", "discursive practice", "adjective+noun", "CDA domain", LIT],
  ["practice", "social practice", "adjective+noun", "CDA domain", LIT],
  ["discourse", "classroom discourse", "noun+noun", "ELT domain", METHOD],
  ["belief", "teacher beliefs", "noun+noun", "ELT domain", FINDINGS],
  ["perception", "student perceptions", "noun+noun", "ELT domain", FINDINGS],
  ["practice", "reported practices", "adjective+noun", "ELT domain", FINDINGS],
  ["practice", "classroom practices", "noun+noun", "ELT domain", FINDINGS],
  ["support", "pedagogical support", "adjective+noun", "ELT domain", FINDINGS],
  ["support", "instructional support", "adjective+noun", "ELT domain", FINDINGS],
  ["exposure", "target-language exposure", "adjective+noun", "ELT domain", FINDINGS],
  ["use", "native-language use", "adjective+noun", "ELT domain", FINDINGS],
  ["use", "language use", "noun+noun", "ELT domain", FINDINGS],
  ["participation", "classroom participation", "noun+noun", "ELT domain", FINDINGS],
  ["opportunity", "language learning opportunities", "noun+noun", "ELT domain", FINDINGS],
  ["difference", "significant difference", "adjective+noun", "finding report", FINDINGS],
  ["difference", "meaningful difference", "adjective+noun", "finding report", FINDINGS],
  ["pattern", "clear pattern", "adjective+noun", "finding report", FINDINGS],
  ["pattern", "recurring pattern", "adjective+noun", "finding report", FINDINGS],
  ["theme", "emerging theme", "adjective+noun", "finding report", FINDINGS],
  ["limitation", "major limitation", "adjective+noun", "limitation", ["Discussion", "Conclusion"]],
  ["implication", "important implication", "adjective+noun", "discussion move", ["Discussion", "Conclusion"]],
  ["implication", "practical implication", "adjective+noun", "discussion move", ["Discussion", "Conclusion"]],
  ["contribution", "theoretical contribution", "adjective+noun", "contribution", ["Discussion", "Conclusion"]],
  ["limitation", "methodological limitation", "adjective+noun", "limitation", ["Method", "Discussion", "Conclusion"]]
];

const nodes = [
  "research", "study", "data", "evidence", "findings", "results", "analysis", "method", "methodology", "design", "sample",
  "participant", "response", "interview", "questionnaire", "survey", "observation", "corpus", "variable", "measure", "scale",
  "item", "reliability", "validity", "coding", "theme", "category", "pattern", "argument", "claim", "point", "issue",
  "problem", "question", "gap", "limitation", "implication", "contribution", "conclusion", "section", "literature", "review",
  "source", "reference", "framework", "theory", "model", "concept", "perspective", "approach", "teacher", "student",
  "learner", "classroom", "language", "discourse", "ideology", "interaction", "participation", "comprehension", "exposure",
  "proficiency", "motivation", "anxiety", "belief", "attitude", "perception", "practice", "translanguaging", "scaffolding",
  "positioning", "agency", "identity"
];

const genericByNode = {
  research: ["academic research", "empirical research"],
  study: ["current study", "previous study"],
  data: ["research data", "qualitative data"],
  evidence: ["empirical evidence", "available evidence"],
  findings: ["qualitative findings", "main findings"],
  results: ["main results", "reported results"],
  analysis: ["detailed analysis", "qualitative analysis"],
  method: ["research method", "appropriate method"],
  methodology: ["research methodology", "qualitative methodology"],
  design: ["research design", "study design"],
  sample: ["small sample", "study sample"],
  participant: ["study participants", "research participants"],
  response: ["participant responses", "interview responses"],
  interview: ["semi-structured interviews", "participant interviews"],
  questionnaire: ["survey questionnaire", "structured questionnaire"],
  survey: ["questionnaire survey", "student survey"],
  observation: ["classroom observation", "structured observation"],
  corpus: ["text corpus", "research corpus"],
  variable: ["dependent variable", "independent variable"],
  measure: ["reliable measure", "valid measure"],
  scale: ["Likert scale", "measurement scale"],
  item: ["questionnaire item", "survey item"],
  reliability: ["internal reliability", "acceptable reliability"],
  validity: ["construct validity", "content validity"],
  coding: ["thematic coding", "initial coding"],
  theme: ["emerging theme", "recurring theme"],
  category: ["coding category", "analytical category"],
  pattern: ["clear pattern", "recurring pattern"],
  argument: ["central argument", "main argument"],
  claim: ["research claim", "central claim"],
  point: ["main point", "important point"],
  issue: ["important issue", "central issue"],
  problem: ["research problem", "practical problem"],
  question: ["research question", "central question"],
  gap: ["research gap", "literature gap"],
  limitation: ["major limitation", "methodological limitation"],
  implication: ["practical implication", "important implication"],
  contribution: ["theoretical contribution", "methodological contribution"],
  conclusion: ["main conclusion", "tentative conclusion"],
  section: ["method section", "findings section"],
  literature: ["relevant literature", "existing literature"],
  review: ["literature review", "systematic review"],
  source: ["secondary source", "primary source"],
  reference: ["APA reference", "relevant reference"],
  framework: ["theoretical framework", "conceptual framework"],
  theory: ["social theory", "learning theory"],
  model: ["analytical model", "conceptual model"],
  concept: ["key concept", "central concept"],
  perspective: ["critical perspective", "pedagogical perspective"],
  approach: ["qualitative approach", "pedagogical approach"],
  teacher: ["teacher beliefs", "teacher practices"],
  student: ["student perceptions", "student participation"],
  learner: ["learner autonomy", "learner participation"],
  classroom: ["classroom discourse", "classroom practices"],
  language: ["language use", "target language"],
  discourse: ["classroom discourse", "critical discourse"],
  ideology: ["language ideology", "dominant ideology"],
  interaction: ["classroom interaction", "peer interaction"],
  participation: ["classroom participation", "student participation"],
  comprehension: ["reading comprehension", "student comprehension"],
  exposure: ["target-language exposure", "language exposure"],
  proficiency: ["language proficiency", "English proficiency"],
  motivation: ["student motivation", "learning motivation"],
  anxiety: ["language anxiety", "student anxiety"],
  belief: ["teacher beliefs", "student beliefs"],
  attitude: ["student attitudes", "teacher attitudes"],
  perception: ["student perceptions", "teacher perceptions"],
  practice: ["classroom practices", "reported practices"],
  translanguaging: ["pedagogical translanguaging", "translanguaging practices"],
  scaffolding: ["teacher scaffolding", "peer scaffolding"],
  positioning: ["student positioning", "teacher positioning"],
  agency: ["teacher agency", "student agency"],
  identity: ["teacher identity", "learner identity"]
};

const bad = [
  ["make-research", "research", "\\bmake (?:a )?research\\b", "conduct research", "verb+noun", "research process", "Safe", "Use conduct research, not make research."],
  ["do-research", "research", "\\bdo research\\b", "conduct research", "verb+noun", "research process", "Safe", "Conduct research is the standard academic collocation."],
  ["do-study", "study", "\\bdo a study\\b", "conduct a study", "verb+noun", "research process", "Safe", "Conduct a study is the natural academic collocation."],
  ["make-study", "study", "\\bmake a study\\b", "conduct a study", "verb+noun", "research process", "Safe", "Use conduct a study for research design."],
  ["statistics-data", "data", "\\bstatistics data\\b", "statistical data", "adjective+noun", "data type", "Safe", "Statistical data is the natural adjective-noun form."],
  ["big-significance", "significance", "\\bbig significance\\b", "considerable significance", "adjective+noun", "emphasis", "Moderate", "Big is informal; check whether significance is statistical or general."],
  ["big-effect", "effect", "\\bbig effect\\b", "substantial effect", "adjective+noun", "effect statement", "Moderate", "Substantial effect is more academic, but check evidence strength."],
  ["strongly-important", "important", "\\bstrongly important\\b", "particularly important", "adverb+adjective", "emphasis", "Safe", "Particularly important is a natural academic intensifier."],
  ["ascertain-findings", "findings", "\\bascertain findings\\b", "interpret findings", "verb+noun", "finding interpretation", "Moderate", "Interpret findings is more natural; examine findings may also fit."],
  ["give-result", "result", "\\bgive a result\\b", "produce a result", "verb+noun", "finding report", "Safe", "Produce a result or yield a result is more natural."],
  ["take-data", "data", "\\btake data\\b", "collect data", "verb+noun", "data collection", "Safe", "Collect data is the standard research collocation."],
  ["make-analysis", "analysis", "\\bmake (?:an? )?analysis\\b", "conduct an analysis", "verb+noun", "analysis process", "Safe", "Conduct an analysis or carry out an analysis is natural."],
  ["do-analysis", "analysis", "\\bdo (?:an? )?analysis\\b", "conduct an analysis", "verb+noun", "analysis process", "Safe", "Conduct an analysis is more academic than do analysis."],
  ["find-result", "result", "\\bfind a result\\b", "obtain a result", "verb+noun", "finding report", "Moderate", "Obtain or report a result is more natural, depending on context."],
  ["say-finding", "finding", "\\bsay a finding\\b", "report a finding", "verb+noun", "finding report", "Safe", "Report a finding is the natural academic expression."],
  ["teacher-thinks", "teacher", "\\bteacher thinks\\b", "teachers reported", "noun+verb", "self-reported belief", "Review carefully", "This may need plural agreement and evidence-sensitive wording."],
  ["students-learn-better", "student", "\\bstudents learn better\\b", "students reported improved understanding", "clause", "claim strength", "Review carefully", "This revision avoids inventing learning gains; review against evidence."]
];

function naturalEntry([node, collocation, patternType, academicFunction, sections], index) {
  return {
    id: `col-good-${String(index + 1).padStart(3, "0")}-${slug(collocation)}`,
    node_word: node,
    collocation,
    pattern_type: patternType,
    academic_function: academicFunction,
    best_sections: sections,
    example: `The sentence uses "${collocation}" as a natural academic collocation.`,
    warning: "",
    risk_level: "Safe"
  };
}

function nodeEntry(node, collocation, index) {
  const patternType = collocation.split(" ").length === 2 ? "noun+noun" : "adjective+noun";
  return naturalEntry([node, collocation, patternType, "academic expression", SECTIONS], index);
}

function badEntry([id, node, pattern, replacement, patternType, academicFunction, risk, explanation]) {
  return {
    id: `col-block-${id}`,
    node_word: node,
    collocation: replacement,
    pattern,
    replacement,
    pattern_type: patternType,
    academic_function: academicFunction,
    best_sections: SECTIONS,
    example: `${pattern.replace(/\\b/g, "").replace(/[\\^$]/g, "")} -> ${replacement}`,
    warning: risk === "Review carefully" ? "Review context before applying; this fix may affect meaning." : "",
    risk_level: risk,
    explanation
  };
}

const good = [
  ...natural.map(naturalEntry),
  ...nodes.flatMap((node, nodeIndex) => (genericByNode[node] || []).map((collocation, offset) => nodeEntry(node, collocation, natural.length + nodeIndex * 2 + offset)))
];

const blocked = bad.map(badEntry);
const bank = { good, blocked };
writeFileSync(resolve("src/data/academic-collocation-bank.json"), `${JSON.stringify(bank, null, 2)}\n`);
console.log(JSON.stringify({ good: good.length, blocked: blocked.length }, null, 2));

function slug(value) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}
