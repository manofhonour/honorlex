import { findProtectedRanges } from "../analysis/protectedTerms.js";
import { assert, getTestResources } from "./testUtils.js";

export function testProtectedTerms() {
  const resources = getTestResources();
  const ranges = findProtectedRanges("The value was p < .05 in 2024 for P12 and CDA.", resources.protectedTerms);
  assert.ok(ranges.some((range) => range.value === "p < .05"));
  assert.ok(ranges.some((range) => range.value === "2024"));
  assert.ok(ranges.some((range) => range.value === "P12"));
  assert.ok(ranges.some((range) => range.value === "CDA"));
}
