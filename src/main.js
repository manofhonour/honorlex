import "./styles.css";

const DEFAULT_TEXT = `This current study utilized an explanatory sequential mixed-methods design to examine Turkish secondary and high school EFL teachers' beliefs about translanguaging. The findings show that teachers reported important classroom participation outcomes. Although the small sample, the results prove that translanguaging is effective.`;

const state = {
  text: DEFAULT_TEXT,
  focus: "General",
  resources: null,
  suggestions: [],
  protectedRanges: []
};

const app = document.querySelector("#app");
const focusModes = ["General", "Literature", "Method", "Findings", "Discussion", "TR Dizin", "APA/Style"];

async function loadJson(path) {
  const response = await fetch(new URL(path, import.meta.url));
  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }
  return response.json();
}

async function loadResources() {
  const [protectedTerms, synonyms, collocations, connectors, reportingVerbs] = await Promise.all([
    loadJson("./data/protected-terms.json"),
    loadJson("./data/academic-synonyms.json"),
    loadJson("./data/collocations.json"),
    loadJson("./data/connectors.json"),
    loadJson("./data/reporting-verbs.json")
  ]);
  return { protectedTerms, synonyms, collocations, connectors, reportingVerbs };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getLemma(word) {
  const lower = word.toLowerCase();
  if (lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("ing")) return lower.slice(0, -3);
  if (lower.endsWith("ed")) return lower.slice(0, -2);
  if (lower.endsWith("s") && lower.length > 3) return lower.slice(0, -1);
  return lower;
}

function inflectVerb(source, lemma) {
  const lower = source.toLowerCase();
  const past = {
    indicate: "indicated",
    suggest: "suggested",
    demonstrate: "demonstrated",
    employ: "employed",
    apply: "applied",
    state: "stated"
  };
  const ing = {
    indicate: "indicating",
    suggest: "suggesting",
    demonstrate: "demonstrating",
    employ: "employing",
    apply: "applying",
    state: "stating"
  };
  const third = {
    indicate: "indicates",
    suggest: "suggests",
    demonstrate: "demonstrates",
    employ: "employs",
    apply: "applies",
    state: "states"
  };
  if (lower.endsWith("ing")) return ing[lemma] || `${lemma}ing`;
  if (lower.endsWith("ed")) return past[lemma] || `${lemma}ed`;
  if (lower.endsWith("s") && !lower.endsWith("ss")) return third[lemma] || `${lemma}s`;
  return lemma;
}

function preserveCase(source, replacement) {
  if (source === source.toUpperCase()) return replacement.toUpperCase();
  if (source[0] === source[0].toUpperCase()) return titleCase(replacement);
  return replacement;
}

function isProtected(index, length) {
  const end = index + length;
  return state.protectedRanges.some((range) => index < range.end && end > range.start);
}

function findProtectedRanges(text) {
  const ranges = [];
  const { exact, patterns } = state.resources.protectedTerms;

  for (const term of exact) {
    const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, "giu");
    for (const match of text.matchAll(re)) {
      ranges.push({ start: match.index, end: match.index + match[0].length, label: "Protected term", value: match[0] });
    }
  }

  for (const item of patterns) {
    const re = new RegExp(item.source, "giu");
    for (const match of text.matchAll(re)) {
      ranges.push({ start: match.index, end: match.index + match[0].length, label: item.label, value: match[0] });
    }
  }

  return ranges
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .filter((range, index, all) => !all.slice(0, index).some((prev) => range.start >= prev.start && range.end <= prev.end));
}

function addSuggestion(items, suggestion) {
  if (isProtected(suggestion.start, suggestion.end - suggestion.start)) return;
  if (suggestion.original === suggestion.replacement) return;
  items.push({ id: `${suggestion.kind}-${suggestion.start}-${suggestion.replacement}`, ...suggestion });
}

function analyzeSynonyms(text, items) {
  const wordRe = /\b[A-Za-z][A-Za-z'-]*\b/g;
  for (const match of text.matchAll(wordRe)) {
    const surface = match[0];
    const lemma = getLemma(surface);
    const entry = state.resources.synonyms[lemma];
    if (!entry) continue;

    for (const candidate of entry.replacements) {
      if (!candidate.focus.includes(state.focus) && !candidate.focus.includes("General")) continue;
      const replacement = entry.pos === "verb" ? inflectVerb(surface, candidate.lemma) : candidate.lemma;
      addSuggestion(items, {
        kind: "Synonym",
        start: match.index,
        end: match.index + surface.length,
        original: surface,
        replacement: preserveCase(surface, replacement),
        risk: candidate.risk,
        explanation: candidate.explanation,
        meta: `${entry.pos} preserved`
      });
    }
  }
}

function analyzeReportingVerbs(text, items) {
  const wordRe = /\b(?:show|shows|showed|showing|report|reports|reported|prove|proves|proved|proving)\b/gi;
  for (const match of text.matchAll(wordRe)) {
    const surface = match[0];
    const lemma = getLemma(surface);
    const bank = state.resources.reportingVerbs[lemma];
    if (!bank) continue;

    for (const candidate of bank) {
      if (!candidate.sections.includes(state.focus) && state.focus !== "General") continue;
      const replacement = preserveCase(surface, inflectVerb(surface, candidate.lemma));
      addSuggestion(items, {
        kind: "Reporting verb",
        start: match.index,
        end: match.index + surface.length,
        original: surface,
        replacement,
        risk: candidate.risk,
        explanation: candidate.explanation,
        meta: candidate.sections.join(", ")
      });
    }
  }
}

function analyzeCollocations(text, items) {
  for (const item of state.resources.collocations.blocked) {
    const re = new RegExp(item.pattern, "giu");
    for (const match of text.matchAll(re)) {
      addSuggestion(items, {
        kind: "Collocation",
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        replacement: item.replacement,
        risk: item.risk,
        explanation: item.explanation,
        meta: item.category
      });
    }
  }
}

function analyzeConnectors(text, items) {
  for (const item of state.resources.connectors.warnings) {
    const re = new RegExp(item.pattern, "giu");
    for (const match of text.matchAll(re)) {
      const original = match[0];
      const replacement = original.toLowerCase().startsWith("although")
        ? original.replace(/^although/i, "Despite").replace(/,\s*$/, ",")
        : original.toLowerCase().startsWith("despite")
          ? original.replace(/^despite/i, "Although")
          : original.replace(/\b(however|therefore|moreover|nevertheless)\s+/i, "$1, ");
      addSuggestion(items, {
        kind: "Connector",
        start: match.index,
        end: match.index + original.length,
        original,
        replacement,
        risk: item.risk,
        explanation: item.explanation,
        meta: "grammar fit"
      });
    }
  }

  for (const connector of state.resources.connectors.overuse) {
    const matches = [...text.matchAll(new RegExp(`\\b${connector}\\b`, "giu"))];
    if (matches.length > 2) {
      const match = matches[2];
      addSuggestion(items, {
        kind: "Connector overuse",
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        replacement: "consider varying this connector",
        risk: "Moderate",
        explanation: `${connector} appears repeatedly. Review whether each transition is needed.`,
        meta: "style"
      });
    }
  }
}

function analyzeCautiousWording(text, items) {
  const patterns = [
    { source: "\\bprove(?:s|d|n|ing)?\\b", replacement: "suggests", risk: "Review carefully", explanation: "Proof is rarely appropriate in thesis discussion unless the design establishes it." },
    { source: "\\bclearly shows\\b", replacement: "suggests", risk: "Moderate", explanation: "Clearly shows may overstate the strength of evidence." },
    { source: "\\bvery important\\b", replacement: "important", risk: "Safe", explanation: "Remove intensifier for a more controlled academic tone." }
  ];
  for (const item of patterns) {
    const re = new RegExp(item.source, "giu");
    for (const match of text.matchAll(re)) {
      addSuggestion(items, {
        kind: "Cautious wording",
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        replacement: preserveCase(match[0], item.replacement),
        risk: item.risk,
        explanation: item.explanation,
        meta: state.focus
      });
    }
  }
}

function analyzeText() {
  state.protectedRanges = findProtectedRanges(state.text);
  const items = [];
  analyzeCollocations(state.text, items);
  analyzeConnectors(state.text, items);
  analyzeReportingVerbs(state.text, items);
  analyzeSynonyms(state.text, items);
  analyzeCautiousWording(state.text, items);
  state.suggestions = items.sort((a, b) => a.start - b.start || riskRank(a.risk) - riskRank(b.risk));
  render();
}

function riskRank(risk) {
  return { Safe: 0, Moderate: 1, "Review carefully": 2 }[risk] ?? 3;
}

function applySuggestion(id) {
  const suggestion = state.suggestions.find((item) => item.id === id);
  if (!suggestion || isProtected(suggestion.start, suggestion.end - suggestion.start)) return;
  state.text = `${state.text.slice(0, suggestion.start)}${suggestion.replacement}${state.text.slice(suggestion.end)}`;
  analyzeText();
}

function highlightText(text) {
  if (!state.protectedRanges.length) return escapeHtml(text);
  let cursor = 0;
  let html = "";
  for (const range of state.protectedRanges) {
    html += escapeHtml(text.slice(cursor, range.start));
    html += `<mark title="${escapeHtml(range.label)}">${escapeHtml(text.slice(range.start, range.end))}</mark>`;
    cursor = range.end;
  }
  html += escapeHtml(text.slice(cursor));
  return html;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSuggestion(item) {
  return `
    <article class="suggestion risk-${item.risk.toLowerCase().replace(/\s+/g, "-")}">
      <div class="suggestion-top">
        <span>${item.kind}</span>
        <strong>${item.risk}</strong>
      </div>
      <p class="swap"><span>${escapeHtml(item.original)}</span><b></b><span>${escapeHtml(item.replacement)}</span></p>
      <p>${escapeHtml(item.explanation)}</p>
      <div class="suggestion-actions">
        <small>${escapeHtml(item.meta)}</small>
        <button data-apply="${item.id}">Apply</button>
      </div>
    </article>
  `;
}

function render() {
  app.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Local academic writing assistant</p>
          <h1>HonorLex</h1>
        </div>
        <div class="status">
          <span></span>
          Local only
        </div>
      </header>

      <section class="workspace">
        <aside class="left-panel">
          <div class="mode-row">
            ${focusModes.map((mode) => `<button class="${state.focus === mode ? "active" : ""}" data-focus="${mode}">${mode}</button>`).join("")}
          </div>
          <textarea id="editor" spellcheck="false">${escapeHtml(state.text)}</textarea>
          <div class="editor-footer">
            <span>${state.text.trim().split(/\s+/).filter(Boolean).length} words</span>
            <button class="primary" id="analyze">Analyze text</button>
          </div>
        </aside>

        <section class="right-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Suggestions</p>
              <h2>${state.suggestions.length} items found</h2>
            </div>
            <span>${state.focus}</span>
          </div>
          <div class="suggestions">
            ${state.suggestions.length ? state.suggestions.map(renderSuggestion).join("") : `<div class="empty">Paste thesis text and run analysis. HonorLex will protect citations, numbers, quotations, participant codes, statistics, and institution names.</div>`}
          </div>
        </section>
      </section>

      <section class="bottom-grid">
        <article>
          <h3>Protected text</h3>
          <div class="protected-preview">${highlightText(state.text)}</div>
        </article>
        <article>
          <h3>Local resources</h3>
          <ul>
            <li>${state.resources.protectedTerms.exact.length + state.resources.protectedTerms.patterns.length} protected term rules</li>
            <li>${Object.keys(state.resources.synonyms).length} academic synonym entries</li>
            <li>${state.resources.collocations.good.length + state.resources.collocations.blocked.length} collocation rules</li>
            <li>${Object.keys(state.resources.connectors.types).length} connector categories</li>
          </ul>
        </article>
      </section>
    </section>
  `;

  document.querySelector("#editor").addEventListener("input", (event) => {
    state.text = event.target.value;
    state.protectedRanges = findProtectedRanges(state.text);
  });

  document.querySelector("#analyze").addEventListener("click", analyzeText);
  document.querySelectorAll("[data-focus]").forEach((button) => {
    button.addEventListener("click", () => {
      state.focus = button.dataset.focus;
      analyzeText();
    });
  });
  document.querySelectorAll("[data-apply]").forEach((button) => {
    button.addEventListener("click", () => applySuggestion(button.dataset.apply));
  });
}

loadResources()
  .then((resources) => {
    state.resources = resources;
    analyzeText();
  })
  .catch((error) => {
    app.innerHTML = `<pre>${escapeHtml(error.message)}</pre>`;
  });
