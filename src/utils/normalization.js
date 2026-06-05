export function normalizeKey(value) {
  return String(value || "").trim().toLowerCase();
}

export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}
