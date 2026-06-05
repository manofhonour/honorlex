import { FOCUS_MODES } from "./constants.js";
import { countWords, escapeHtml } from "../utils/text.js";

export function render(app, state) {
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
            ${FOCUS_MODES.map((mode) => `<button class="${state.focus === mode ? "active" : ""}" data-focus="${mode}">${mode}</button>`).join("")}
          </div>
          ${state.protectedRanges.length ? `<div class="protected-warning">Protected academic content was detected and preserved.</div>` : ""}
          <textarea id="editor" spellcheck="false">${escapeHtml(state.text)}</textarea>
          <div class="editor-footer">
            <span>${countWords(state.text)} words</span>
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
          <div class="protected-preview">${highlightText(state.text, state.protectedRanges)}</div>
        </article>
        <article>
          <h3>Resource health</h3>
          ${renderResourceHealth(state.resourceHealth)}
        </article>
      </section>
    </section>
  `;
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

function highlightText(text, protectedRanges) {
  if (!protectedRanges.length) return escapeHtml(text);
  let cursor = 0;
  let html = "";
  for (const range of protectedRanges) {
    html += escapeHtml(text.slice(cursor, range.start));
    html += `<mark title="${escapeHtml(range.label)}">${escapeHtml(text.slice(range.start, range.end))}</mark>`;
    cursor = range.end;
  }
  html += escapeHtml(text.slice(cursor));
  return html;
}

function renderResourceHealth(health) {
  const counts = health?.counts || {};
  const warnings = health?.warnings || [];
  return `
    <ul>
      <li>${counts.synonyms || 0} synonym entries</li>
      <li>${counts.collocations || 0} collocations</li>
      <li>${counts.connectors || 0} connectors</li>
      <li>${counts.reportingVerbs || 0} reporting verbs</li>
      <li>${counts.protectedTerms || 0} protected terms</li>
      <li>${counts.rewriteRules || 0} rewrite rules</li>
      <li>${counts.cautiousWordingRules || 0} cautious wording rules</li>
    </ul>
    ${warnings.length ? `<div class="resource-warning">${warnings.map(escapeHtml).join("<br>")}</div>` : ""}
  `;
}
