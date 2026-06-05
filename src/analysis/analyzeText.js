import { findProtectedRanges } from "./protectedTerms.js";
import { analyzeCollocations } from "./collocations.js";
import { analyzeConnectors } from "./connectors.js";
import { analyzeReportingVerbs } from "./reportingVerbs.js";
import { analyzeSynonyms } from "./synonyms.js";
import { analyzeCautiousWording } from "./cautiousWording.js";
import { isSuggestionReplacementBlocked, rankSuggestions } from "./ranking.js";
import { isRangeProtected } from "../utils/offsets.js";

export function analyzeText({ text, focus, resources }) {
  const protectedRanges = findProtectedRanges(text, resources.protectedTerms);
  const items = [];
  const addSuggestion = (suggestion) => {
    if (isRangeProtected(protectedRanges, suggestion.start, suggestion.end - suggestion.start)) return;
    if (suggestion.original === suggestion.replacement) return;
    if (isSuggestionReplacementBlocked(suggestion.replacement, resources)) return;
    items.push({ id: `${suggestion.kind}-${suggestion.start}-${suggestion.replacement}`, ...suggestion });
  };
  const context = { text, focus, resources, protectedRanges, addSuggestion };

  analyzeCollocations(context);
  analyzeConnectors(context);
  analyzeReportingVerbs(context);
  analyzeSynonyms(context);
  analyzeCautiousWording(context);

  return {
    protectedRanges,
    suggestions: rankSuggestions(items)
  };
}
