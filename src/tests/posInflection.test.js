import { inflectNounByContext, inflectReplacement, inflectVerb } from "../analysis/inflection.js";
import { describeSurface, getLemma } from "../analysis/pos.js";
import { assert } from "./testUtils.js";

export function testPosInflection() {
  assert.equal(getLemma("showed"), "show");
  assert.equal(getLemma("shows"), "show");
  assert.equal(getLemma("analyzed"), "analyze");
  assert.equal(getLemma("analysed"), "analyse");
  assert.equal(getLemma("findings"), "finding");
  assert.equal(inflectVerb("showed", "indicate"), "indicated");
  assert.equal(inflectVerb("shows", "indicate"), "indicates");
  assert.equal(inflectVerb("showing", "illustrate"), "illustrating");
  assert.equal(inflectVerb("analyzed", "examine"), "examined");
  assert.equal(inflectVerb("analyzing", "interpret"), "interpreting");
  assert.equal(inflectVerb("completed", "carry out"), "carried out");

  assert.equal(inflectNounByContext(describeSurface("findings"), "result"), "results");
  assert.equal(inflectNounByContext(describeSurface("study"), "result"), "result");
  assert.equal(inflectNounByContext(describeSurface("studies"), "result"), "results");
  assert.equal(inflectNounByContext(describeSurface("criteria"), "phenomenon"), "phenomena");
  assert.equal(inflectNounByContext(describeSurface("analysis"), "examination"), "examination");

  assert.equal(inflectReplacement(describeSurface("significantly"), "substantial", "adverb").replacement, "substantially");
  assert.equal(inflectReplacement(describeSurface("significantly"), "meaningful", "adverb").replacement, "meaningfully");
  assert.equal(inflectReplacement(describeSurface("significant"), "important", "adjective").replacement, "important");
  assert.equal(inflectReplacement(describeSurface("Showed"), "indicate", "verb").replacement, "Indicated");

  const phraseRewrite = inflectReplacement(describeSurface("analysis"), "analyze", "verb");
  assert.equal(phraseRewrite.phraseRewrite, true);
}
