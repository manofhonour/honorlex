import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SECTIONS = ["General", "Literature", "Method", "Findings", "Discussion", "Conclusion", "TR Dizin", "APA/Style"];
const FINDINGS = ["Findings", "Discussion", "Conclusion"];
const DISCUSSION = ["Discussion", "Conclusion"];
const LIT = ["Literature", "Discussion", "APA/Style"];

const rows = [
  ["this proves that", "overclaiming", ["this suggests that", "this may indicate that", "this can be interpreted as"], FINDINGS, "Proof is rarely appropriate in thesis writing unless the design establishes certainty.", "This proves that translanguaging improves learning.", "This suggests that translanguaging may support learning.", "Review carefully"],
  ["the results prove", "overclaiming", ["the results indicate", "the findings suggest", "the results may suggest"], FINDINGS, "Avoid presenting results as proof in social science contexts.", "The results prove the point.", "The results indicate the point.", "Review carefully"],
  ["this clearly proves", "overclaiming", ["this appears to suggest", "this may indicate", "the evidence points to"], FINDINGS, "Clearly proves combines certainty and proof.", "This clearly proves the effect.", "This appears to suggest an effect.", "Review carefully"],
  ["this demonstrates beyond doubt", "excessive certainty", ["this suggests", "this provides evidence that", "this may support"], DISCUSSION, "Beyond doubt is too absolute for most academic claims.", "This demonstrates beyond doubt that the approach works.", "This may support the interpretation that the approach works.", "Review carefully"],
  ["this confirms that", "overclaiming", ["this supports the view that", "this may indicate that", "this finding may support"], FINDINGS, "Confirm can overstate evidence unless the design directly tests confirmation.", "This confirms that teachers prefer L1 use.", "This may indicate that teachers prefer L1 use.", "Review carefully"],
  ["this establishes that", "overclaiming", ["this suggests that", "this may support the interpretation that", "the evidence points to"], DISCUSSION, "Establishes can overstate certainty.", "This establishes that motivation increased.", "This suggests that motivation may have increased.", "Review carefully"],
  ["this shows conclusively", "excessive certainty", ["this suggests", "this indicates", "this may show"], FINDINGS, "Conclusive language is usually too strong.", "This shows conclusively that the method is effective.", "This suggests that the method may be effective.", "Review carefully"],
  ["it is obvious that", "excessive certainty", ["it appears that", "the evidence suggests that", "it may be argued that"], DISCUSSION, "Obvious can sound unsupported and dismissive.", "It is obvious that students benefited.", "The evidence suggests that students may have benefited.", "Moderate"],
  ["it is clear that", "excessive certainty", ["it appears that", "the findings suggest that", "the results indicate that"], DISCUSSION, "Clear that may overstate interpretation.", "It is clear that teachers changed their practice.", "The findings suggest that teachers may have changed their practice.", "Moderate"],
  ["without doubt", "excessive certainty", ["with some caution", "based on the available evidence", "to some extent"], DISCUSSION, "Avoid absolute certainty unless warranted.", "Without doubt, the intervention worked.", "Based on the available evidence, the intervention may have worked.", "Review carefully"],
  ["undoubtedly", "excessive certainty", ["arguably", "possibly", "based on the findings"], DISCUSSION, "Undoubtedly signals excessive certainty.", "Undoubtedly, L1 use improved comprehension.", "The findings suggest that L1 use may have supported comprehension.", "Review carefully"],
  ["definitely", "excessive certainty", ["likely", "possibly", "appears to"], DISCUSSION, "Definitely is too absolute for cautious academic prose.", "This definitely influenced participation.", "This appears to have influenced participation.", "Moderate"],
  ["certainly", "excessive certainty", ["likely", "arguably", "to some extent"], DISCUSSION, "Certainly may overstate interpretation.", "This certainly explains the pattern.", "This may help explain the pattern.", "Moderate"],
  ["all teachers", "overgeneralization", ["many teachers", "some teachers", "the participating teachers"], FINDINGS, "Avoid generalizing beyond the sample.", "All teachers supported translanguaging.", "The participating teachers supported translanguaging.", "Moderate"],
  ["all students", "overgeneralization", ["many students", "some students", "the students in this study"], FINDINGS, "Avoid generalizing beyond the sample.", "All students improved.", "The students in this study appeared to improve.", "Moderate"],
  ["everyone", "overgeneralization", ["many participants", "some participants", "the participants in this study"], FINDINGS, "Everyone usually overgeneralizes.", "Everyone agreed.", "Many participants agreed.", "Moderate"],
  ["no one", "overgeneralization", ["few participants", "none of the participants in this sample", "no participating teacher"], FINDINGS, "No one can overgeneralize unless sample scope is explicit.", "No one disagreed.", "Few participants disagreed.", "Moderate"],
  ["always", "overgeneralization", ["often", "frequently", "tended to"], FINDINGS, "Always overgeneralizes repeated behavior.", "Teachers always used L1.", "Teachers often used L1.", "Moderate"],
  ["never", "overgeneralization", ["rarely", "seldom", "did not appear to"], FINDINGS, "Never overgeneralizes repeated behavior.", "Students never used English.", "Students rarely used English.", "Moderate"],
  ["in every case", "overgeneralization", ["in many cases", "in some cases", "in the cases examined"], FINDINGS, "Avoid universal scope.", "In every case, students preferred Turkish.", "In many cases, students preferred Turkish.", "Moderate"],
  ["in all contexts", "overgeneralization", ["in some contexts", "in the contexts examined", "in many contexts"], DISCUSSION, "Avoid universal context claims.", "This works in all contexts.", "This may work in some contexts.", "Moderate"],
  ["teachers always", "overgeneralization", ["teachers often", "teachers tended to", "the participating teachers often"], FINDINGS, "Avoid universal behavior claims.", "Teachers always translated instructions.", "Teachers often translated instructions.", "Moderate"],
  ["students never", "overgeneralization", ["students rarely", "students did not appear to", "the participating students rarely"], FINDINGS, "Avoid universal behavior claims.", "Students never used L2.", "Students rarely used L2.", "Moderate"],
  ["causes", "unsupported causality", ["may contribute to", "may be associated with", "appears to influence"], FINDINGS, "Causal language requires design support.", "L1 use causes better participation.", "L1 use may be associated with better participation.", "Review carefully"],
  ["caused", "unsupported causality", ["may have contributed to", "was associated with", "appeared to influence"], FINDINGS, "Causal language requires design support.", "The activity caused improvement.", "The activity may have contributed to improvement.", "Review carefully"],
  ["leads to", "causal overclaim", ["may lead to", "may be associated with", "may contribute to"], FINDINGS, "Leads to can imply causality.", "The method leads to improvement.", "The method may contribute to improvement.", "Moderate"],
  ["makes students", "causal overclaim", ["may help students", "was reported to support students", "may encourage students"], FINDINGS, "Makes students can overstate causal force.", "The task makes students participate.", "The task may encourage students to participate.", "Moderate"],
  ["ensures", "unsupported causality", ["may support", "can help", "may contribute to"], DISCUSSION, "Ensures is too absolute.", "Feedback ensures improvement.", "Feedback may support improvement.", "Review carefully"],
  ["guarantees", "unsupported causality", ["may support", "can contribute to", "may increase the likelihood of"], DISCUSSION, "Guarantees is too absolute.", "Training guarantees success.", "Training may contribute to success.", "Review carefully"],
  ["results in", "causal overclaim", ["may result in", "may be linked to", "may contribute to"], FINDINGS, "Results in can overstate causality.", "The intervention results in better scores.", "The intervention may be linked to better scores.", "Moderate"],
  ["has a big effect on", "informal intensity", ["may have a substantial effect on", "may be associated with", "appears to influence"], FINDINGS, "Big effect is informal and may overstate impact.", "The method has a big effect on motivation.", "The method may be associated with motivation.", "Moderate"],
  ["directly improves", "unsupported causality", ["may improve", "may support", "was perceived as supporting"], FINDINGS, "Directly improves implies causality.", "Translanguaging directly improves comprehension.", "Translanguaging may support comprehension.", "Review carefully"],
  ["very important", "informal intensity", ["significant", "particularly important", "central"], SECTIONS, "Very important can be tightened.", "This is very important.", "This is particularly important.", "Safe"],
  ["really important", "informal intensity", ["particularly important", "significant", "central"], SECTIONS, "Really is informal.", "This is really important.", "This is particularly important.", "Safe"],
  ["big effect", "informal intensity", ["substantial effect", "possible effect", "considerable effect"], FINDINGS, "Big is informal.", "This had a big effect.", "This may have had a substantial effect.", "Moderate"],
  ["a lot of", "weak academic wording", ["many", "a large number of", "substantial"], SECTIONS, "Use a more precise academic quantifier.", "A lot of teachers agreed.", "Many teachers agreed.", "Safe"],
  ["lots of", "weak academic wording", ["many", "a large number of", "several"], SECTIONS, "Lots of is informal.", "Lots of students participated.", "Many students participated.", "Safe"],
  ["huge", "informal intensity", ["substantial", "considerable", "important"], SECTIONS, "Huge is often informal or overstated.", "This was a huge limitation.", "This was a substantial limitation.", "Moderate"],
  ["great", "weak academic wording", ["important", "beneficial", "substantial"], SECTIONS, "Great is vague in academic writing.", "The activity had a great benefit.", "The activity had a substantial benefit.", "Safe"],
  ["good", "weak academic wording", ["beneficial", "appropriate", "useful"], SECTIONS, "Good is often vague.", "This is a good strategy.", "This is a useful strategy.", "Safe"],
  ["bad", "weak academic wording", ["problematic", "limited", "ineffective"], SECTIONS, "Bad is informal and vague.", "This was a bad outcome.", "This was a problematic outcome.", "Safe"],
  ["thing", "weak academic wording", ["issue", "aspect", "factor"], SECTIONS, "Thing is vague.", "This thing affected participation.", "This factor affected participation.", "Safe"],
  ["stuff", "weak academic wording", ["materials", "content", "aspects"], SECTIONS, "Stuff is informal.", "The teacher used different stuff.", "The teacher used different materials.", "Safe"],
  ["get better", "weak academic wording", ["improve", "develop", "show improvement"], SECTIONS, "Use a more academic verb.", "Students get better over time.", "Students improve over time.", "Safe"],
  ["helps a lot", "informal intensity", ["supports", "may support", "provides considerable support"], SECTIONS, "Helps a lot is informal.", "The activity helps a lot.", "The activity may support learning.", "Safe"],
  ["delve into", "AI-sounding phrase", ["examine", "discuss", "analyze"], LIT, "This phrase can sound formulaic or ornate.", "This chapter delves into the literature.", "This chapter examines the literature.", "Moderate"],
  ["dive into", "AI-sounding phrase", ["examine", "discuss", "analyze"], LIT, "This phrase is informal and can sound AI-like.", "The study dives into teacher beliefs.", "The study examines teacher beliefs.", "Moderate"],
  ["sheds light on", "AI-sounding phrase", ["examines", "clarifies", "provides insight into"], LIT, "This phrase can sound formulaic.", "The study sheds light on classroom discourse.", "The study examines classroom discourse.", "Moderate"],
  ["robust insights", "AI-sounding phrase", ["useful insights", "important insights", "evidence"], DISCUSSION, "Robust insights can sound inflated.", "The study provides robust insights.", "The study provides useful insights.", "Moderate"],
  ["pivotal role", "AI-sounding phrase", ["important role", "central role", "possible role"], DISCUSSION, "Pivotal can overstate importance.", "L1 played a pivotal role.", "L1 appeared to play an important role.", "Moderate"],
  ["plays a crucial role", "AI-sounding phrase", ["plays an important role", "may play a role", "appears to play a role"], DISCUSSION, "Crucial role can overstate evidence.", "Language plays a crucial role.", "Language may play an important role.", "Moderate"],
  ["in today's rapidly changing world", "AI-sounding phrase", ["in contemporary contexts", "in current educational contexts", "in recent years"], LIT, "This phrase is broad and formulaic.", "In today's rapidly changing world, English is important.", "In contemporary educational contexts, English remains important.", "Moderate"],
  ["it is worth mentioning that", "AI-sounding phrase", ["it should be noted that", "notably", "the study also indicates that"], SECTIONS, "This phrase can be wordy.", "It is worth mentioning that the sample was small.", "It should be noted that the sample was small.", "Safe"],
  ["taken together", "AI-sounding phrase", ["overall", "considered together", "when considered together"], DISCUSSION, "Acceptable in moderation, but can sound formulaic if overused.", "Taken together, the findings are useful.", "Overall, the findings are useful.", "Safe"],
  ["this implies that", "unsupported implication", ["this may imply that", "this suggests that", "this could indicate that"], DISCUSSION, "Implication should be cautious unless directly supported.", "This implies that teachers reject English.", "This may imply that teachers were selective.", "Moderate"],
  ["this means that", "unsupported implication", ["this may mean that", "this suggests that", "this can be interpreted as"], DISCUSSION, "Means that can overstate interpretation.", "This means that students prefer Turkish.", "This may mean that students preferred Turkish in this context.", "Moderate"],
  ["the sample proves", "sample overreach", ["the sample suggests", "the sample may indicate", "the sample provides evidence that"], FINDINGS, "A sample rarely proves a general claim.", "The sample proves that teachers agree.", "The sample suggests that teachers in this study agreed.", "Review carefully"]
];

const entries = rows.map(([riskyExpression, problemType, safeReplacements, bestSections, explanation, before, after, risk], index) => ({
  id: `cw-${String(index + 1).padStart(3, "0")}-${slug(riskyExpression)}`,
  risky_expression: riskyExpression,
  problem_type: problemType,
  safe_replacements: safeReplacements,
  best_sections: bestSections,
  explanation,
  example_before: before,
  example_after: after,
  risk_level: risk
}));

writeFileSync(resolve("src/data/cautious-wording-bank.json"), `${JSON.stringify(entries, null, 2)}\n`);
console.log(JSON.stringify({ cautiousRules: entries.length }, null, 2));

function slug(value) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}
