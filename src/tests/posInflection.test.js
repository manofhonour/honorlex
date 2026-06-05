import { inflectVerb } from "../analysis/inflection.js";
import { getLemma } from "../analysis/pos.js";
import { assert } from "./testUtils.js";

export function testPosInflection() {
  assert.equal(getLemma("showed"), "show");
  assert.equal(getLemma("shows"), "show");
  assert.equal(inflectVerb("showed", "indicate"), "indicated");
  assert.equal(inflectVerb("shows", "indicate"), "indicates");
}
