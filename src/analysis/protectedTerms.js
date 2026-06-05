import { escapeRegExp, safeRegExp } from "../utils/regex.js";
import { rangesOverlap } from "../utils/offsets.js";

export function findProtectedRanges(text, protectedTerms) {
  const ranges = [];
  const exact = protectedTerms?.exact || [];
  const patterns = protectedTerms?.patterns || [];

  for (const term of exact) {
    const re = safeRegExp(`(?<![\\p{L}\\p{N}_-])${escapeRegExp(term)}(?![\\p{L}\\p{N}_-])`);
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

export function getProtectedSnapshot(text, protectedTerms) {
  return findProtectedRanges(text, protectedTerms).map((range) => ({
    label: range.label,
    value: text.slice(range.start, range.end)
  }));
}

export function protectedContentUnchanged(beforeText, afterText, protectedTerms) {
  const before = getProtectedSnapshot(beforeText, protectedTerms);
  const afterValues = new Map();

  for (const item of getProtectedSnapshot(afterText, protectedTerms)) {
    const key = `${item.label}\u0000${item.value}`;
    afterValues.set(key, (afterValues.get(key) || 0) + 1);
  }

  for (const item of before) {
    const key = `${item.label}\u0000${item.value}`;
    const count = afterValues.get(key) || 0;
    if (count < 1) return false;
    afterValues.set(key, count - 1);
  }
  return true;
}

export function suggestionTouchesProtectedSpan(suggestion, protectedRanges) {
  return protectedRanges.some((range) => rangesOverlap(suggestion.start, suggestion.end, range));
}

export function applySuggestionSafely(text, suggestion, protectedTerms, protectedRanges) {
  if (!suggestion || suggestionTouchesProtectedSpan(suggestion, protectedRanges)) {
    return { blocked: true, text, reason: "Suggestion overlaps protected academic content." };
  }

  const nextText = `${text.slice(0, suggestion.start)}${suggestion.replacement}${text.slice(suggestion.end)}`;
  if (!protectedContentUnchanged(text, nextText, protectedTerms)) {
    return { blocked: true, text, reason: "Protected academic content would be changed." };
  }

  return { blocked: false, text: nextText, reason: "" };
}
