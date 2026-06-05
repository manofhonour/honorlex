import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SECTIONS = {
  neutral: ["General", "Literature", "Findings", "Discussion"],
  literature: ["Literature", "Discussion", "APA/Style"],
  method: ["Method", "Findings", "TR Dizin"],
  findings: ["Findings", "Discussion"],
  discussion: ["Discussion", "Conclusion"],
  critical: ["Literature", "Discussion"],
  general: ["General", "Literature", "Method", "Findings", "Discussion", "Conclusion"]
};

const warnings = {
  prove: "\"prove\" is usually too strong for social science and qualitative findings.",
  demonstrate: "\"demonstrate\" may overstate evidence if based on self-reported data.",
  reveal: "\"reveal\" may sound dramatic if overused.",
  claim: "\"claim\" can sound skeptical or distancing.",
  strong: "Use stronger reporting verbs only when the evidence type supports a strong claim."
};

const lexicon = [
  ["state", "neutral", "moderate", "neutral reporting", SECTIONS.neutral, ["report", "note", "mention"], ["assert", "claim"]],
  ["note", "cautious", "tentative", "neutral reporting", SECTIONS.literature, ["state", "report", "mention"], ["argue", "assert"]],
  ["report", "neutral", "moderate", "finding report", SECTIONS.findings, ["state", "note", "describe"], ["demonstrate"]],
  ["mention", "cautious", "tentative", "neutral reporting", SECTIONS.neutral, ["note", "state", "refer to"], ["assert"]],
  ["describe", "neutral", "moderate", "neutral reporting", SECTIONS.general, ["outline", "present", "explain"], ["demonstrate"]],
  ["observe", "neutral", "moderate", "finding report", SECTIONS.findings, ["note", "identify", "report"], ["confirm"]],
  ["present", "neutral", "moderate", "neutral reporting", SECTIONS.general, ["outline", "summarize", "describe"], ["demonstrate"]],
  ["outline", "neutral", "moderate", "neutral reporting", SECTIONS.general, ["summarize", "present", "describe"], ["assert"]],
  ["summarize", "neutral", "moderate", "neutral reporting", SECTIONS.literature, ["review", "outline", "present"], ["argue"]],
  ["review", "neutral", "moderate", "neutral reporting", SECTIONS.literature, ["summarize", "discuss", "examine"], ["critique"]],
  ["discuss", "neutral", "moderate", "neutral reporting", SECTIONS.general, ["examine", "consider", "review"], ["argue"]],
  ["explain", "neutral", "moderate", "interpretation", SECTIONS.general, ["clarify", "describe", "account for"], ["prove"]],
  ["define", "neutral", "confident", "neutral reporting", SECTIONS.general, ["describe", "specify", "clarify"], ["establish"]],
  ["introduce", "neutral", "moderate", "neutral reporting", SECTIONS.literature, ["present", "outline", "describe"], ["establish"]],
  ["examine", "neutral", "moderate", "method description", SECTIONS.method, ["investigate", "analyze", "assess"], ["prove"]],
  ["investigate", "neutral", "moderate", "method description", SECTIONS.method, ["examine", "explore", "assess"], ["establish"]],
  ["explore", "cautious", "tentative", "method description", SECTIONS.method, ["examine", "investigate", "consider"], ["prove"]],
  ["analyze", "neutral", "moderate", "method description", SECTIONS.method, ["examine", "evaluate", "interpret"], ["demonstrate"]],
  ["analyse", "neutral", "moderate", "method description", SECTIONS.method, ["examine", "evaluate", "interpret"], ["demonstrate"]],
  ["assess", "neutral", "moderate", "method description", SECTIONS.method, ["evaluate", "examine", "measure"], ["confirm"]],
  ["evaluate", "neutral", "moderate", "method description", SECTIONS.method, ["assess", "examine", "interpret"], ["prove"]],
  ["compare", "neutral", "moderate", "method description", SECTIONS.method, ["contrast", "examine", "relate"], ["establish"]],
  ["contrast", "neutral", "moderate", "method description", SECTIONS.method, ["compare", "differentiate", "examine"], ["prove"]],
  ["identify", "cautious", "moderate", "finding report", SECTIONS.findings, ["find", "observe", "report"], ["confirm"]],
  ["determine", "strong", "confident", "method description", SECTIONS.method, ["identify", "estimate", "assess"], ["prove"]],
  ["measure", "neutral", "moderate", "method description", SECTIONS.method, ["assess", "calculate", "estimate"], ["confirm"]],
  ["test", "neutral", "moderate", "method description", SECTIONS.method, ["examine", "assess", "evaluate"], ["prove"]],
  ["estimate", "cautious", "tentative", "method description", SECTIONS.method, ["calculate", "approximate", "measure"], ["determine"]],
  ["calculate", "neutral", "confident", "method description", SECTIONS.method, ["estimate", "measure", "compute"], ["prove"]],
  ["classify", "neutral", "moderate", "method description", SECTIONS.method, ["categorize", "code", "group"], ["establish"]],
  ["categorize", "neutral", "moderate", "method description", SECTIONS.method, ["classify", "code", "group"], ["establish"]],
  ["code", "neutral", "moderate", "method description", SECTIONS.method, ["categorize", "classify", "label"], ["prove"]],
  ["find", "neutral", "moderate", "finding report", SECTIONS.findings, ["identify", "observe", "report"], ["prove"]],
  ["show", "neutral", "moderate", "finding report", SECTIONS.findings, ["indicate", "suggest", "illustrate"], ["demonstrate"]],
  ["indicate", "cautious", "moderate", "finding report", SECTIONS.findings, ["suggest", "point to", "show"], ["demonstrate"]],
  ["suggest", "cautious", "tentative", "interpretation", SECTIONS.discussion, ["indicate", "imply", "point to"], ["prove"]],
  ["reveal", "strong", "confident", "finding report", SECTIONS.findings, ["show", "indicate", "suggest"], ["demonstrate"]],
  ["demonstrate", "strong", "confident", "finding report", SECTIONS.findings, ["indicate", "suggest", "show"], ["prove"]],
  ["establish", "strong", "confident", "argumentation", SECTIONS.discussion, ["indicate", "suggest", "support"], ["prove"]],
  ["confirm", "strong", "confident", "finding report", SECTIONS.findings, ["support", "indicate", "suggest"], ["prove"]],
  ["prove", "absolute", "absolute", "argumentation", SECTIONS.discussion, ["suggest", "indicate", "support"], []],
  ["imply", "cautious", "tentative", "interpretation", SECTIONS.discussion, ["suggest", "indicate", "point to"], ["establish"]],
  ["point out", "neutral", "moderate", "neutral reporting", SECTIONS.literature, ["note", "highlight", "identify"], ["assert"]],
  ["highlight", "neutral", "moderate", "interpretation", SECTIONS.general, ["emphasize", "note", "identify"], ["prove"]],
  ["illustrate", "neutral", "moderate", "finding report", SECTIONS.findings, ["show", "indicate", "present"], ["demonstrate"]],
  ["argue", "neutral", "moderate", "argumentation", SECTIONS.literature, ["suggest", "propose", "maintain"], ["assert"]],
  ["claim", "strong", "confident", "author position", SECTIONS.literature, ["state", "argue", "suggest"], ["assert"]],
  ["maintain", "strong", "confident", "author position", SECTIONS.literature, ["argue", "state", "suggest"], ["assert"]],
  ["propose", "neutral", "moderate", "argumentation", SECTIONS.literature, ["suggest", "argue", "put forward"], ["assert"]],
  ["contend", "strong", "confident", "argumentation", SECTIONS.literature, ["argue", "suggest", "maintain"], ["assert"]],
  ["assert", "strong", "confident", "author position", SECTIONS.literature, ["state", "argue", "claim"], []],
  ["question", "neutral", "moderate", "critical stance", SECTIONS.critical, ["challenge", "critique", "examine"], ["reject"]],
  ["challenge", "strong", "confident", "critical stance", SECTIONS.critical, ["question", "critique", "examine"], ["oppose"]],
  ["criticize", "strong", "confident", "critical stance", SECTIONS.critical, ["critique", "question", "challenge"], ["reject"]],
  ["critique", "neutral", "moderate", "critical stance", SECTIONS.critical, ["evaluate", "question", "examine"], ["criticize"]],
  ["support", "neutral", "moderate", "argumentation", SECTIONS.discussion, ["indicate", "suggest", "align with"], ["confirm"]],
  ["oppose", "strong", "confident", "critical stance", SECTIONS.critical, ["question", "challenge", "contrast with"], ["reject"]],
  ["appear", "cautious", "tentative", "interpretation", SECTIONS.discussion, ["seem", "suggest", "indicate"], ["prove"]],
  ["seem", "cautious", "tentative", "interpretation", SECTIONS.discussion, ["appear", "suggest", "indicate"], ["prove"]],
  ["tend", "cautious", "tentative", "interpretation", SECTIONS.discussion, ["appear", "seem", "suggest"], ["prove"]],
  ["point to", "cautious", "tentative", "interpretation", SECTIONS.discussion, ["suggest", "indicate", "imply"], ["establish"]],
  ["may show", "cautious", "tentative", "interpretation", SECTIONS.discussion, ["may indicate", "may suggest", "appear to show"], ["prove"]],
  ["may indicate", "cautious", "tentative", "interpretation", SECTIONS.discussion, ["may suggest", "suggest", "indicate"], ["prove"]],
  ["appear to suggest", "cautious", "tentative", "interpretation", SECTIONS.discussion, ["seem to suggest", "may suggest", "suggest"], ["prove"]],
  ["use", "neutral", "moderate", "method description", SECTIONS.method, ["employ", "apply", "adopt"], ["prove"]],
  ["employ", "neutral", "moderate", "method description", SECTIONS.method, ["use", "apply", "adopt"], ["prove"]],
  ["adopt", "neutral", "moderate", "method description", SECTIONS.method, ["use", "employ", "apply"], ["establish"]],
  ["apply", "neutral", "moderate", "method description", SECTIONS.method, ["use", "employ", "implement"], ["prove"]],
  ["implement", "neutral", "moderate", "method description", SECTIONS.method, ["apply", "use", "carry out"], ["prove"]],
  ["conduct", "neutral", "moderate", "method description", SECTIONS.method, ["carry out", "undertake", "perform"], ["prove"]],
  ["carry out", "neutral", "moderate", "method description", SECTIONS.method, ["conduct", "undertake", "perform"], ["prove"]],
  ["collect", "neutral", "moderate", "method description", SECTIONS.method, ["gather", "obtain", "record"], ["prove"]],
  ["transcribe", "neutral", "moderate", "method description", SECTIONS.method, ["record", "prepare", "document"], ["prove"]]
];

function forms(verb) {
  const irregular = {
    find: { base: "find", third_person: "finds", past: "found", ing: "finding", past_participle: "found" },
    show: { base: "show", third_person: "shows", past: "showed", ing: "showing", past_participle: "shown" },
    carry_out: { base: "carry out", third_person: "carries out", past: "carried out", ing: "carrying out", past_participle: "carried out" },
    point_out: { base: "point out", third_person: "points out", past: "pointed out", ing: "pointing out", past_participle: "pointed out" },
    point_to: { base: "point to", third_person: "points to", past: "pointed to", ing: "pointing to", past_participle: "pointed to" },
    may_show: { base: "may show" },
    may_indicate: { base: "may indicate" },
    appear_to_suggest: { base: "appear to suggest", third_person: "appears to suggest", past: "appeared to suggest", ing: "appearing to suggest" }
  };
  const key = verb.replace(/\s+/g, "_");
  if (irregular[key]) return irregular[key];
  if (verb.includes(" ")) return { base: verb };
  const third = verb.endsWith("y") && !/[aeiou]y$/i.test(verb) ? `${verb.slice(0, -1)}ies` : /(s|x|z|ch|sh)$/i.test(verb) ? `${verb}es` : `${verb}s`;
  const past = verb.endsWith("e") ? `${verb}d` : verb.endsWith("y") && !/[aeiou]y$/i.test(verb) ? `${verb.slice(0, -1)}ied` : `${verb}ed`;
  const ing = verb.endsWith("e") && !verb.endsWith("ee") ? `${verb.slice(0, -1)}ing` : `${verb}ing`;
  return { base: verb, third_person: third, past, ing, past_participle: past };
}

function riskFor(strength, verb) {
  if (verb === "prove" || strength === "absolute") return "Review carefully";
  if (["strong"].includes(strength)) return "Review carefully";
  return "Safe";
}

function alt(verb, risk, sections, explanation) {
  return { verb, risk, sections, explanation };
}

function entry([verb, strength, certainty, stance, sections, safer, stronger], index) {
  const warning = verb === "prove" ? warnings.prove : verb === "demonstrate" ? warnings.demonstrate : verb === "reveal" ? warnings.reveal : verb === "claim" ? warnings.claim : strength === "strong" || strength === "absolute" ? warnings.strong : "";
  return {
    id: `rv-${String(index + 1).padStart(3, "0")}-${verb.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`,
    verb,
    forms: forms(verb),
    strength_level: strength,
    certainty_level: certainty,
    stance,
    best_sections: sections,
    safe_use: strength === "cautious" ? "Use for tentative, qualitative, perception-based, or self-reported data." : "Use when the sentence reports, describes, or interprets evidence without overstating it.",
    risky_use: strength === "strong" || strength === "absolute" ? "Risky for qualitative, interview-based, perception-based, or self-reported data unless evidence is direct and strong." : "Risk increases if the replacement makes the evidence sound more certain than it is.",
    safer_alternatives: safer.map((item) => alt(item, "Safe", sections, `Safer alternative to "${verb}" that reduces claim strength.`)),
    stronger_alternatives: stronger.map((item) => alt(item, "Review carefully", sections, `Stronger alternative to "${verb}"; check evidence before using.`)),
    common_patterns: patternsFor(verb),
    original_example: exampleFor(verb),
    warning,
    risk_level: riskFor(strength, verb)
  };
}

function patternsFor(verb) {
  const patterns = {
    suggest: ["The findings suggest that...", "The data suggest..."],
    indicate: ["The results indicate that...", "The findings indicate..."],
    examine: ["Previous studies have examined..."],
    argue: ["The authors argue that..."],
    report: ["Participants reported that..."],
    reveal: ["The analysis revealed..."],
    find: ["The study found that..."],
    show: ["The findings show that..."]
  };
  return patterns[verb] || [`The study ${forms(verb).third_person || verb} that...`];
}

function exampleFor(verb) {
  if (verb === "prove") return "The results prove that the intervention is effective.";
  if (verb === "report") return "Participants reported that they used translanguaging selectively.";
  if (verb === "show") return "The findings showed a change in classroom participation.";
  if (verb === "suggest") return "The findings suggest that context shaped teacher beliefs.";
  return `The study ${forms(verb).third_person || verb} the issue.`;
}

const entries = lexicon.map(entry);
writeFileSync(resolve("src/data/reporting-verbs-strength-bank.json"), `${JSON.stringify(entries, null, 2)}\n`);
console.log(JSON.stringify({ reportingVerbs: entries.length }, null, 2));
