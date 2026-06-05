export function loadLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`[HonorLex] Could not load local storage key "${key}".`, error);
    return fallback;
  }
}

export function saveLocalJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[HonorLex] Could not save local storage key "${key}".`, error);
  }
}
