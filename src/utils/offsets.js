export function rangesOverlap(start, end, range) {
  return start < range.end && end > range.start;
}

export function isRangeProtected(protectedRanges, start, length) {
  const end = start + length;
  return protectedRanges.some((range) => rangesOverlap(start, end, range));
}
