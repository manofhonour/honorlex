export function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function preserveCase(source, replacement) {
  if (source === source.toUpperCase()) return replacement.toUpperCase();
  if (source[0] === source[0].toUpperCase()) return titleCase(replacement);
  return replacement;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
