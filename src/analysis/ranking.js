export function riskRank(risk) {
  return { Safe: 0, Moderate: 1, "Review carefully": 2 }[risk] ?? 3;
}

export function rankSuggestions(items) {
  return [...items].sort((a, b) => a.start - b.start || riskRank(a.risk) - riskRank(b.risk));
}
