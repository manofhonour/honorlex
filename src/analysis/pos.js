export function getLemma(word) {
  const lower = word.toLowerCase();
  if (lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("ing")) return lower.slice(0, -3);
  if (lower.endsWith("ed")) return lower.slice(0, -2);
  if (lower.endsWith("s") && lower.length > 3) return lower.slice(0, -1);
  return lower;
}
