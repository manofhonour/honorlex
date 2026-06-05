export function inflectVerb(source, lemma) {
  const lower = source.toLowerCase();
  const past = {
    indicate: "indicated",
    suggest: "suggested",
    demonstrate: "demonstrated",
    employ: "employed",
    apply: "applied",
    state: "stated"
  };
  const ing = {
    indicate: "indicating",
    suggest: "suggesting",
    demonstrate: "demonstrating",
    employ: "employing",
    apply: "applying",
    state: "stating"
  };
  const third = {
    indicate: "indicates",
    suggest: "suggests",
    demonstrate: "demonstrates",
    employ: "employs",
    apply: "applies",
    state: "states"
  };
  if (lower.endsWith("ing")) return ing[lemma] || `${lemma}ing`;
  if (lower.endsWith("ed")) return past[lemma] || `${lemma}ed`;
  if (lower.endsWith("s") && !lower.endsWith("ss")) return third[lemma] || `${lemma}s`;
  return lemma;
}
