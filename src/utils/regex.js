export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function safeRegExp(source, flags = "giu") {
  try {
    return new RegExp(source, flags);
  } catch (error) {
    console.warn("[HonorLex] Invalid regex skipped:", source, error);
    return null;
  }
}
