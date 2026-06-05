import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SECTIONS = ["General", "Literature", "Method", "Findings", "Discussion", "Conclusion", "TR Dizin", "APA/Style"];
const METHOD = ["General", "Method", "Findings", "Discussion", "TR Dizin"];
const LIT = ["General", "Literature", "Discussion", "Conclusion", "APA/Style"];

const required = { verb: 300, noun: 250, adjective: 200, adverb: 150, connector: 120 };

const priorityVerbs = [
  "use", "make", "do", "get", "give", "take", "find", "show", "see", "need", "help", "support", "improve",
  "increase", "decrease", "change", "develop", "create", "provide", "include", "involve", "explain", "describe",
  "discuss", "compare", "consider", "suggest", "indicate", "report", "argue", "claim", "note", "observe",
  "identify", "examine", "assess", "evaluate", "complete", "analyze", "analyse", "interpret", "investigate",
  "explore", "address", "highlight", "demonstrate", "reveal", "confirm", "establish", "imply", "conduct",
  "carry out", "collect", "code", "categorize", "classify", "select", "design", "apply", "employ", "implement",
  "measure", "test", "calculate", "estimate", "determine", "define", "present", "summarize", "synthesize",
  "review", "critique", "question", "clarify", "illustrate", "emphasize", "focus", "reflect", "relate", "link",
  "connect", "depend", "influence", "affect", "contribute", "facilitate", "enable", "limit", "restrict", "reduce",
  "promote", "encourage", "maintain", "require", "allow", "lead", "result", "occur", "emerge", "vary", "differ",
  "correspond", "align", "contrast", "combine", "integrate", "organize", "structure", "transform", "generate",
  "obtain", "achieve", "recognize", "perceive", "experience", "participate", "engage", "interact", "mediate",
  "position", "negotiate", "scaffold", "contextualize"
];

const verbGroups = [
  ["analysis", ["analyze", "analyse", "examine", "evaluate", "interpret", "investigate", "explore", "assess", "review", "inspect", "consider", "study", "scrutinize"]],
  ["reporting", ["show", "suggest", "indicate", "report", "note", "observe", "identify", "find", "reveal", "demonstrate", "illustrate", "highlight", "imply"]],
  ["methods", ["conduct", "carry out", "complete", "perform", "undertake", "administer", "collect", "code", "categorize", "classify", "select", "sample", "recruit", "interview", "survey", "observe", "transcribe"]],
  ["design", ["design", "develop", "create", "construct", "prepare", "produce", "generate", "formulate", "build", "organize", "structure", "arrange", "compile", "assemble"]],
  ["use", ["use", "apply", "employ", "adopt", "utilize", "draw on", "make use of"]],
  ["change", ["change", "modify", "adjust", "adapt", "revise", "alter", "shift", "transform", "refine", "update"]],
  ["increase", ["increase", "raise", "expand", "extend", "strengthen", "enhance", "improve", "promote", "facilitate", "encourage"]],
  ["decrease", ["decrease", "reduce", "limit", "restrict", "lower", "minimize", "moderate", "constrain", "narrow"]],
  ["explain", ["explain", "clarify", "account for", "describe", "define", "outline", "specify", "elaborate", "illustrate"]],
  ["compare", ["compare", "contrast", "differentiate", "relate", "link", "connect", "associate", "align", "correspond"]],
  ["argue", ["argue", "claim", "maintain", "contend", "propose", "suggest", "state", "assert"]],
  ["evidence", ["support", "confirm", "establish", "substantiate", "validate", "verify", "corroborate"]],
  ["present", ["present", "summarize", "synthesize", "report", "outline", "describe", "discuss", "document"]],
  ["learning", ["help", "enable", "facilitate", "support", "scaffold", "guide", "mediate", "encourage", "promote"]],
  ["process", ["occur", "emerge", "appear", "arise", "develop", "result", "follow", "continue", "persist", "vary", "differ"]],
  ["academic", ["address", "consider", "question", "critique", "contextualize", "theorize", "conceptualize", "operationalize", "problematize"]],
  ["participation", ["participate", "engage", "interact", "collaborate", "negotiate", "respond", "communicate", "share", "contribute"]],
  ["measurement", ["measure", "test", "calculate", "estimate", "determine", "quantify", "score", "rate", "record", "compare"]],
  ["management", ["maintain", "manage", "control", "monitor", "coordinate", "balance", "ensure", "protect", "preserve"]],
  ["cognition", ["recognize", "perceive", "experience", "understand", "notice", "interpret", "view", "regard", "conceptualize"]]
];

const supplementalVerbs = [
  "accept", "account", "acknowledge", "adapt", "add", "adjust", "adopt", "advance", "advocate", "allocate", "alter",
  "answer", "appear", "arrange", "ask", "associate", "assume", "attend", "attribute", "avoid", "balance", "base",
  "benefit", "build", "capture", "challenge", "characterize", "check", "cite", "collaborate", "communicate",
  "compile", "complement", "conceptualize", "conclude", "construct", "contain", "contextualise", "continue",
  "control", "convert", "coordinate", "corroborate", "deliver", "derive", "document", "draw", "edit", "educate",
  "ensure", "extend", "extract", "fill", "form", "formulate", "guide", "interview", "justify", "manage", "map",
  "minimize", "monitor", "operationalize", "outline", "perform", "problematize", "produce", "protect", "quantify",
  "rate", "record", "recruit", "refine", "regard", "represent", "respond", "revise", "sample", "score", "share",
  "specify", "state", "substantiate", "survey", "theorize", "trace", "transcribe", "undertake", "validate", "verify",
  "view", "administer", "assemble", "assign", "avoid", "broaden", "calculate", "capture", "center", "characterise",
  "circulate", "combine", "comment", "compare", "compose", "constrain", "contextualise", "define", "differentiate",
  "direct", "distinguish", "draft", "emerge", "enhance", "estimate", "fill in", "follow", "foreground", "frame",
  "generalize", "generalise", "infer", "integrate", "lower", "model", "moderate", "narrow", "notice", "persist",
  "prepare", "prioritize", "prioritise", "propose", "raise", "reconsider", "reframe", "represent", "resolve",
  "retain", "score", "strengthen", "subdivide", "translate", "triangulate", "underline", "update", "widen",
  "activate", "adapt", "adopt", "aggregate", "anchor", "annotate", "anticipate", "approximate", "articulate",
  "broaden", "calibrate", "centralize", "centre", "chart", "circulate", "cluster", "compare", "consolidate",
  "correct", "differentiate", "disaggregate", "display", "distribute", "elicit", "embed", "enact", "encode",
  "exclude", "foreground", "group", "harmonize", "incorporate", "index", "initiate", "input", "isolate",
  "label", "locate", "merge", "normalize", "offset", "pilot", "plot", "process", "qualify", "recode",
  "redistribute", "reorganize", "replicate", "screen", "sequence", "separate", "situate", "standardize",
  "tabulate", "target", "transfer", "visualize"
];

const priorityNouns = [
  "study", "research", "analysis", "finding", "result", "data", "evidence", "method", "methodology", "participant",
  "teacher", "student", "learner", "response", "interview", "questionnaire", "survey", "observation", "classroom",
  "context", "practice", "belief", "perception", "attitude", "experience", "approach", "framework", "theory", "model",
  "concept", "issue", "problem", "question", "aim", "purpose", "objective", "focus", "scope", "gap", "limitation",
  "implication", "contribution", "section", "article", "paper", "thesis", "dissertation", "proposal", "literature",
  "review", "source", "reference", "claim", "argument", "explanation", "interpretation", "comparison", "contrast",
  "relationship", "association", "difference", "similarity", "pattern", "theme", "code", "category", "factor",
  "variable", "effect", "impact", "influence", "role", "function", "process", "procedure", "strategy", "technique",
  "task", "activity", "material", "resource", "tool", "support", "exposure", "participation", "comprehension",
  "motivation", "anxiety", "proficiency", "performance", "development", "improvement", "change", "increase",
  "decrease", "frequency", "distribution", "level", "degree", "extent", "quality", "reliability", "validity",
  "sample", "population", "group", "case", "example", "instance", "condition", "setting", "environment", "discourse",
  "ideology", "identity", "positioning", "agency", "power", "interaction", "scaffolding", "translanguaging",
  "language use", "L1 use", "target language"
];

const nounGroups = [
  ["research", ["study", "research", "project", "article", "paper", "thesis", "dissertation", "proposal", "review", "source"]],
  ["result", ["finding", "result", "outcome", "pattern", "theme", "evidence", "observation", "response"]],
  ["method", ["method", "methodology", "approach", "procedure", "strategy", "technique", "design", "framework", "model"]],
  ["people", ["participant", "teacher", "student", "learner", "respondent", "interviewee", "group", "sample", "population"]],
  ["concept", ["concept", "issue", "question", "problem", "focus", "objective", "purpose", "aim", "scope", "gap"]],
  ["argument", ["claim", "argument", "explanation", "interpretation", "account", "position", "view", "perspective"]],
  ["relation", ["relationship", "association", "link", "connection", "difference", "similarity", "contrast", "comparison"]],
  ["quality", ["quality", "reliability", "validity", "accuracy", "rigor", "consistency", "clarity", "coherence"]],
  ["process", ["process", "development", "change", "increase", "decrease", "improvement", "shift", "transition"]],
  ["domain", ["discourse", "ideology", "identity", "positioning", "agency", "power", "interaction", "scaffolding", "translanguaging"]]
];

const supplementalNouns = [
  "account", "accuracy", "adaptation", "administration", "alignment", "alternative", "application", "assessment",
  "assignment", "audience", "background", "basis", "benefit", "boundary", "case study", "challenge", "chapter",
  "choice", "classification", "coding", "coherence", "collection", "collaboration", "communication", "community",
  "component", "constraint", "content", "criterion", "dataset", "definition", "description", "dimension", "direction",
  "draft", "element", "engagement", "evaluation", "example", "exercise", "field", "form", "format", "genre", "grade",
  "indicator", "instruction", "instrument", "item", "knowledge", "lesson", "measure", "meaning", "member", "note",
  "outcome", "paragraph", "perspective", "phase", "phenomenon", "point", "position", "principle", "priority", "profile",
  "program", "protocol", "range", "reason", "recommendation", "record", "reflection", "region", "relationship", "report",
  "representation", "requirement", "response pattern", "risk", "rubric", "score", "sequence", "session", "statement",
  "structure", "subsection", "table", "tendency", "term", "text", "transcript", "transition", "trend", "unit", "value",
  "variation", "view", "word", "work", "writing", "accountability", "achievement", "argumentation", "availability",
  "awareness", "capacity", "characteristic", "clause", "competence", "complexity", "concern", "conclusion", "connection",
  "consequence", "criterion", "curriculum", "difficulty", "emphasis", "expectation", "feedback", "identity work",
  "instructional practice", "interaction pattern", "language policy", "learning outcome", "local context", "meaning making",
  "pedagogy", "preference", "preparation", "progress", "purpose", "rationale", "reader", "relevance", "research design",
  "school", "sentence", "skill", "strength", "subtheme", "summary", "teacher belief", "teaching practice", "tension",
  "trajectory", "transcription", "understanding", "weakness"
];

const priorityAdjectives = [
  "important", "significant", "relevant", "useful", "valuable", "central", "key", "main", "major", "minor", "clear",
  "unclear", "specific", "general", "broad", "narrow", "strong", "weak", "limited", "considerable", "substantial",
  "moderate", "slight", "possible", "likely", "unlikely", "apparent", "evident", "consistent", "inconsistent", "similar",
  "different", "distinct", "comparable", "appropriate", "suitable", "effective", "ineffective", "reliable", "valid",
  "accurate", "inaccurate", "rigorous", "systematic", "qualitative", "quantitative", "mixed", "thematic", "descriptive",
  "interpretive", "critical", "discursive", "social", "pedagogical", "instructional", "contextual", "interactional",
  "linguistic", "academic", "empirical", "theoretical", "conceptual", "methodological", "practical", "educational",
  "institutional", "local", "global", "individual", "collective", "frequent", "common", "rare", "occasional", "selective",
  "temporary", "purposeful", "controlled", "meaningful", "complex", "simple", "problematic", "challenging", "beneficial",
  "detrimental", "cautious", "tentative"
];

const adjectiveGroups = [
  ["importance", ["important", "significant", "relevant", "central", "key", "main", "noteworthy", "meaningful", "valuable"]],
  ["clarity", ["clear", "explicit", "specific", "precise", "direct", "transparent", "coherent", "accessible"]],
  ["scope", ["general", "broad", "wide", "overall", "narrow", "limited", "specific", "focused"]],
  ["strength", ["strong", "substantial", "considerable", "moderate", "limited", "slight", "weak"]],
  ["fit", ["appropriate", "suitable", "relevant", "useful", "applicable", "practical", "effective"]],
  ["quality", ["reliable", "valid", "accurate", "rigorous", "systematic", "consistent", "credible"]],
  ["method", ["qualitative", "quantitative", "mixed", "thematic", "descriptive", "interpretive", "critical", "empirical", "methodological"]],
  ["domain", ["pedagogical", "instructional", "contextual", "interactional", "linguistic", "academic", "educational", "institutional"]],
  ["frequency", ["frequent", "common", "regular", "occasional", "rare", "selective", "temporary"]],
  ["risk", ["possible", "likely", "unlikely", "apparent", "tentative", "cautious", "potential"]]
];

const supplementalAdjectives = [
  "accessible", "additional", "adequate", "analytical", "applicable", "available", "balanced", "basic", "careful",
  "chronological", "coherent", "collaborative", "comparative", "compatible", "comprehensive", "conditional", "consistent",
  "constructive", "contemporary", "credible", "cultural", "detailed", "direct", "diverse", "early", "ethical", "explicit",
  "focused", "formal", "functional", "implicit", "initial", "interrelated", "large", "later", "logical", "longitudinal",
  "measurable", "multiple", "necessary", "negative", "noteworthy", "observable", "overall", "partial", "positive",
  "potential", "precise", "preliminary", "primary", "productive", "professional", "regular", "related", "representative",
  "responsive", "secondary", "small", "stable", "transparent", "typical", "varied", "wide", "written", "oral", "reflective",
  "student-centered", "teacher-led", "data-driven", "evidence-based", "research-based", "school-based", "classroom-based",
  "context-specific", "theory-informed", "practice-oriented", "textual", "discursive", "sociocultural", "multilingual",
  "bilingual", "monolingual", "target-language", "native-language", "self-reported", "semi-structured", "open-ended",
  "closed-ended", "cross-sectional", "sequential", "explanatory", "exploratory", "descriptive", "inferential", "statistical",
  "conceptual", "pedagogic", "interactional", "institutional", "disciplinary", "ethical", "observable", "manageable",
  "analysable", "contextualised", "cumulative", "deductive", "documented", "emergent", "evaluative", "formative",
  "inductive", "integrated", "interpretable", "iterative", "measured", "multidimensional", "neutral", "operational",
  "participatory", "plausible", "provisional", "replicable", "situated", "summative", "targeted", "triangulated",
  "verifiable", "workable"
];

const priorityAdverbs = [
  "significantly", "generally", "particularly", "especially", "mainly", "primarily", "largely", "mostly", "partly",
  "partially", "relatively", "comparatively", "consistently", "frequently", "occasionally", "rarely", "often", "usually",
  "typically", "clearly", "explicitly", "implicitly", "directly", "indirectly", "closely", "broadly", "narrowly",
  "systematically", "carefully", "critically", "theoretically", "methodologically", "empirically", "pedagogically",
  "contextually", "interactionally", "linguistically", "academically", "statistically", "qualitatively", "quantitatively",
  "thematically", "descriptively", "cautiously", "tentatively", "potentially", "possibly", "likely", "arguably", "notably",
  "importantly", "consequently", "therefore", "thus", "however", "nevertheless", "moreover", "furthermore", "similarly",
  "alternatively", "specifically", "respectively"
];

const supplementalAdverbs = [
  "additionally", "adequately", "analytically", "appropriately", "basically", "briefly", "chronologically", "coherently",
  "collaboratively", "comparably", "comparatively", "comprehensively", "conceptually", "conditionally", "constructively",
  "contemporaneously", "credibly", "culturally", "descriptively", "differently", "effectively", "ethically", "eventually",
  "explicitly", "formally", "functionally", "initially", "locally", "logically", "mainly", "meaningfully", "methodically",
  "moderately", "negatively", "normally", "partly", "positively", "practically", "precisely", "previously", "productively",
  "professionally", "regularly", "reliably", "selectively", "sequentially", "slightly", "socially", "specifically",
  "stably", "substantially", "sufficiently", "temporarily", "transparently", "typically", "ultimately", "usefully",
  "validly", "widely", "increasingly", "decreasingly", "jointly", "separately", "cautiously", "tentatively", "probably",
  "plausibly", "reasonably", "accurately", "closely", "critically", "empirically", "pedagogically", "linguistically",
  "academically", "statistically", "qualitatively", "quantitatively", "thematically", "interactionally", "contextually",
  "methodologically", "theoretically", "subsequently", "meanwhile", "overall", "otherwise", "instead", "thereafter",
  "first", "second", "third", "finally", "next", "then", "analytically", "deductively", "inductively", "iteratively",
  "operationally", "provisionally", "reflectively", "replicably", "separately", "jointly", "visibly", "measurably",
  "subsequently", "previously", "approximately", "proportionally", "contextually", "situationally", "textually",
  "discursively", "socioculturally", "multilingually"
];

const priorityConnectors = [
  "and", "but", "or", "so", "yet", "because", "since", "although", "though", "even though", "whereas", "while", "if",
  "unless", "when", "after", "before", "as", "as long as", "in addition", "additionally", "moreover", "furthermore",
  "also", "besides", "however", "nevertheless", "nonetheless", "in contrast", "by contrast", "on the other hand",
  "conversely", "similarly", "likewise", "in the same way", "therefore", "thus", "consequently", "as a result",
  "for this reason", "because of this", "due to", "owing to", "as a consequence", "for example", "for instance",
  "such as", "in particular", "specifically", "namely", "that is", "in other words", "to clarify", "first", "second",
  "third", "finally", "next", "then", "subsequently", "meanwhile", "overall", "in sum", "in summary", "in conclusion",
  "to conclude", "despite", "in spite of", "regardless of", "even so", "still", "to some extent", "in this respect",
  "in this regard", "with respect to", "in relation to", "regarding", "concerning"
];

const supplementalConnectors = [
  "as well as", "along with", "not only", "in addition to", "apart from", "except for", "rather than", "instead of",
  "where applicable", "provided that", "provided", "assuming that", "given that", "considering that", "as soon as",
  "once", "until", "whenever", "where", "wherever", "whether", "even if", "as if", "as though", "whereby", "in order to",
  "so that", "in order that", "thereby", "hence", "accordingly", "because of", "on account of", "in light of",
  "in view of", "as illustrated by", "as shown by", "for this purpose", "for comparison", "in comparison",
  "compared with", "compared to", "relative to", "unlike", "like", "in a similar way", "in turn", "at the same time",
  "at this stage", "at first", "initially", "subsequently", "thereafter", "later", "previously", "above all",
  "more specifically", "in practical terms", "in methodological terms", "from this perspective", "in this case",
  "in these cases", "in doing so", "taken together", "on balance", "overall", "briefly", "to summarize",
  "to sum up", "in short", "in brief", "nevertheless", "nonetheless", "even then", "notwithstanding", "despite this",
  "in spite of this", "for all that", "with regard to", "as regards", "in terms of", "on the basis of", "according to",
  "as reported by", "as noted by", "as discussed above", "as mentioned earlier", "as described below", "respectively"
];

const custom = {
  complete: {
    safe: ["finish", "conduct", "carry out"],
    context: [
      { pattern: "completed a task", prefer: "finished a task", explanation: "Use finish for ordinary task completion." },
      { pattern: "completed a study", prefer: "conducted a study", explanation: "Use conduct for research activity." },
      { pattern: "completed an analysis", prefer: "carried out an analysis", explanation: "Use carried out for analytic procedures." },
      { pattern: "completed a form", prefer: "filled in a form", explanation: "Use filled in for forms." },
      { pattern: "completed a section", prefer: "finished a section", explanation: "Use finish for document sections." }
    ]
  },
  analyze: {
    safe: ["examine", "evaluate", "interpret"],
    context: [
      { pattern: "analyzed data", prefer: "examined data", explanation: "Examined is a cautious academic alternative." },
      { pattern: "analyzed results", prefer: "evaluated results", explanation: "Evaluated fits discussion of results." },
      { pattern: "analyzed a text", prefer: "interpreted the text", explanation: "Interpreted fits textual analysis." },
      { pattern: "analyzed interviews", prefer: "coded interviews", explanation: "Coded fits qualitative interview data." },
      { pattern: "analyzed responses", prefer: "coded responses", explanation: "Coded fits qualitative response data." }
    ]
  },
  analyse: {
    safe: ["examine", "evaluate", "interpret"],
    context: [
      { pattern: "analysed data", prefer: "examined data", explanation: "Examined is a cautious academic alternative." },
      { pattern: "analysed results", prefer: "evaluated results", explanation: "Evaluated fits discussion of results." }
    ]
  },
  show: {
    safe: ["indicate", "suggest", "illustrate"],
    context: [
      { pattern: "findings show", prefer: "findings suggest", explanation: "Suggest avoids overclaiming." },
      { pattern: "results show", prefer: "results indicate", explanation: "Indicate fits empirical results." },
      { pattern: "table shows", prefer: "table presents", explanation: "Presents fits tables and figures." },
      { pattern: "study shows", prefer: "study suggests", explanation: "Suggests is cautious for study-level claims." }
    ]
  },
  important: {
    safe: ["significant", "central", "key"],
    moderate: ["meaningful", "valuable"],
    context: [
      { pattern: "important issue", prefer: "significant issue", explanation: "Significant is a conventional academic alternative." },
      { pattern: "important for teachers", prefer: "relevant for teachers", explanation: "Relevant is more precise for audience value." },
      { pattern: "important finding", prefer: "noteworthy finding", explanation: "Noteworthy is cautious and academic." },
      { pattern: "very important", prefer: "particularly important", explanation: "Particularly important is clearer than intensification." }
    ]
  },
  significant: { safe: ["important", "meaningful", "substantial"], moderate: ["noteworthy"] },
  significantly: { safe: ["substantially", "meaningfully", "considerably"], moderate: ["notably"] },
  finding: { safe: ["result", "outcome"], moderate: ["theme", "pattern"] },
  analysis: { safe: ["interpretation", "examination"], moderate: ["evaluation"] }
};

const categoryAlternatives = new Map();
for (const [, terms] of [...verbGroups, ...nounGroups, ...adjectiveGroups]) {
  for (const term of terms) categoryAlternatives.set(term, terms);
}

function unique(items) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function takeMinimum(pos, priority, supplemental, groups) {
  const terms = unique([...priority, ...groups.flatMap(([, items]) => items), ...supplemental]);
  if (terms.length < required[pos]) throw new Error(`${pos} terms: ${terms.length}, required ${required[pos]}`);
  return terms.slice(0, required[pos]);
}

function makeAlternative(lemma, pos, risk, sections = SECTIONS) {
  return {
    lemma,
    pos,
    sections,
    risk,
    explanation: risk === "Review carefully"
      ? "Use only when the evidence and sentence context support the stronger or less direct wording."
      : "Common academic alternative with matching part of speech."
  };
}

function alternativesFor(lemma, pos) {
  const override = custom[lemma] || {};
  if (override.safe || override.moderate) {
    return {
      safe: (override.safe || []).map((item) => makeAlternative(item, pos, "Safe")),
      moderate: (override.moderate || []).map((item) => makeAlternative(item, pos, "Moderate")),
      risky: (override.risky || []).map((item) => makeAlternative(item, pos, "Review carefully"))
    };
  }

  const group = categoryAlternatives.get(lemma) || [];
  const candidates = group.filter((item) => item !== lemma);
  const safe = candidates.slice(0, 3);
  const moderate = candidates.slice(3, 5);
  if (!safe.length) {
    const fallback = pos === "verb" ? ["consider"] : pos === "noun" ? ["concept"] : pos === "adjective" ? ["relevant"] : pos === "adverb" ? ["generally"] : ["in addition"];
    safe.push(...fallback.filter((item) => item !== lemma));
  }
  return {
    safe: safe.map((item) => makeAlternative(item, pos, "Safe")),
    moderate: moderate.map((item) => makeAlternative(item, pos, "Moderate")),
    risky: []
  };
}

function verbForms(lemma) {
  if (lemma === "carry out") return { base: "carry out", third_person: "carries out", past: "carried out", ing: "carrying out" };
  if (lemma.includes(" ")) return { base: lemma };
  const third = lemma.endsWith("y") && !/[aeiou]y$/.test(lemma) ? `${lemma.slice(0, -1)}ies` : /(s|x|z|ch|sh)$/.test(lemma) ? `${lemma}es` : `${lemma}s`;
  const past = lemma.endsWith("e") ? `${lemma}d` : lemma.endsWith("y") && !/[aeiou]y$/.test(lemma) ? `${lemma.slice(0, -1)}ied` : `${lemma}ed`;
  const ing = lemma.endsWith("e") && !lemma.endsWith("ee") ? `${lemma.slice(0, -1)}ing` : `${lemma}ing`;
  return { base: lemma, third_person: third, past, ing };
}

function nounForms(lemma) {
  const irregular = { analysis: "analyses", criterion: "criteria", phenomenon: "phenomena", datum: "data" };
  const plural = irregular[lemma] || (lemma.includes(" ") ? lemma : lemma.endsWith("y") && !/[aeiou]y$/.test(lemma) ? `${lemma.slice(0, -1)}ies` : /(s|x|z|ch|sh)$/.test(lemma) ? `${lemma}es` : `${lemma}s`);
  return { singular: lemma, plural };
}

function entry(lemma, pos, index) {
  const alternatives = alternativesFor(lemma, pos);
  const idLemma = lemma.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return {
    id: `syn-${pos}-${String(index + 1).padStart(3, "0")}-${idLemma}`,
    lemma,
    part_of_speech: pos,
    forms: pos === "verb" ? verbForms(lemma) : pos === "noun" ? nounForms(lemma) : { base: lemma },
    safe_alternatives: alternatives.safe,
    moderate_alternatives: alternatives.moderate,
    risky_alternatives: alternatives.risky,
    context_rules: custom[lemma]?.context || [],
    collocation_rules: [],
    best_sections: pos === "verb" || pos === "noun" ? METHOD : pos === "connector" ? SECTIONS : LIT,
    example: exampleFor(lemma, pos),
    warning: pos === "connector" ? "Check sentence grammar before replacing connector types." : "",
    risk_level: "Safe"
  };
}

function exampleFor(lemma, pos) {
  if (pos === "verb") return `The study may ${lemma} the issue in academic context.`;
  if (pos === "noun") return `The ${lemma} is discussed in relation to the research aim.`;
  if (pos === "adjective") return `This is a ${lemma} point for the discussion.`;
  if (pos === "adverb") return `The pattern was ${lemma} related to the context.`;
  return `${lemma}, the sentence should remain grammatically appropriate.`;
}

function connectorAlternatives(lemma) {
  const addition = ["in addition", "additionally", "moreover", "furthermore", "also"];
  const contrast = ["however", "nevertheless", "nonetheless", "in contrast", "by contrast"];
  const consequence = ["therefore", "thus", "consequently", "as a result", "for this reason"];
  const example = ["for example", "for instance", "such as", "in particular", "specifically"];
  const sequence = ["first", "second", "next", "then", "finally"];
  const summary = ["overall", "in sum", "in summary", "in conclusion", "to conclude"];
  const group = [addition, contrast, consequence, example, sequence, summary].find((items) => items.includes(lemma)) || priorityConnectors;
  return group.filter((item) => item !== lemma).slice(0, 3).map((item) => makeAlternative(item, "connector", "Safe"));
}

const verbs = takeMinimum("verb", priorityVerbs, supplementalVerbs, verbGroups).map((lemma, index) => entry(lemma, "verb", index));
const nouns = takeMinimum("noun", priorityNouns, supplementalNouns, nounGroups).map((lemma, index) => entry(lemma, "noun", index));
const adjectives = takeMinimum("adjective", priorityAdjectives, supplementalAdjectives, adjectiveGroups).map((lemma, index) => entry(lemma, "adjective", index));
const adverbs = takeMinimum("adverb", priorityAdverbs, supplementalAdverbs, []).map((lemma, index) => entry(lemma, "adverb", index));
const connectors = takeMinimum("connector", priorityConnectors, supplementalConnectors, []).map((lemma, index) => ({
  ...entry(lemma, "connector", index),
  safe_alternatives: connectorAlternatives(lemma),
  best_sections: SECTIONS
}));

const entries = [...verbs, ...nouns, ...adjectives, ...adverbs, ...connectors];
const output = resolve("src/data/general-academic-synonym-core.json");
writeFileSync(output, `${JSON.stringify(entries, null, 2)}\n`);

console.log(JSON.stringify({
  total: entries.length,
  verbs: verbs.length,
  nouns: nouns.length,
  adjectives: adjectives.length,
  adverbs: adverbs.length,
  connectors: connectors.length
}, null, 2));
