# HonorLex

HonorLex is a local academic writing assistant inspired by grammar and paraphrase tools, but designed for thesis-safe academic editing.

It does not call Grammarly, QuillBot, OpenAI, Gemini, Google Translate, or any external provider. All current suggestions are generated from local JSON resources and local rules.

HonorLex is a standalone Vite web app, not a Word add-in. It is intended for academic writing, thesis writing, article writing, ELT, applied linguistics, CDA, translanguaging, qualitative research, mixed methods, and general academic English.

## Safety Principles

- Keep core writing support local-only.
- Do not invent citations, evidence, or findings.
- Do not alter protected academic content such as numbers, p values, participant codes, quotations, references, institution names, and protected terms.
- Preserve grammar, tense, number, capitalization, punctuation, and spacing when applying suggestions.
- Mark claim-strengthening or higher-risk wording as `Review carefully`.
- Prefer clear academic English over ornate vocabulary.

## Run

```powershell
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:4173
```

## Check

```powershell
npm run check
```
