import { escapeRegExp, safeRegExp } from "../utils/regex.js";

export function findProtectedRanges(text, protectedTerms) {
  const ranges = [];
  const exact = protectedTerms?.exact || [];
  const patterns = protectedTerms?.patterns || [];

  for (const term of exact) {
    const re = safeRegExp(`\\b${escapeRegExp(term)}\\b`);
    if (!re) continue;
    for (const match of text.matchAll(re)) {
      ranges.push({ start: match.index, end: match.index + match[0].length, label: "Protected term", value: match[0] });
    }
  }

  for (const item of patterns) {
    const re = safeRegExp(item.source);
    if (!re) continue;
    for (const match of text.matchAll(re)) {
      ranges.push({ start: match.index, end: match.index + match[0].length, label: item.label, value: match[0] });
    }
  }

  return ranges
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .filter((range, index, all) => !all.slice(0, index).some((prev) => range.start >= prev.start && range.end <= prev.end));
}
