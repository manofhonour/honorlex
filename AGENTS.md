# HonorLex Development Rules

HonorLex is a standalone Vite web app. It must not be changed back into a Microsoft Word add-in.

## Product Direction

HonorLex should develop into a Grammarly-like academic writing assistant for:

- academic writing
- thesis writing
- article writing
- ELT and applied linguistics
- CDA
- translanguaging
- qualitative research
- mixed methods
- general academic English

## Local-Only Rule

Keep all core functionality local-only. Do not send user text to any external provider.

Do not call:

- OpenAI
- Gemini
- Grammarly
- QuillBot
- Google Translate
- Datamuse
- LanguageTool cloud
- any external rewrite, grammar, translation, thesaurus, or paraphrase provider

Use deterministic local rules, local code, and JSON resources.

## Suggestion Safety

- Prefer clear academic English over ornate vocabulary.
- Do not invent citations.
- Do not invent findings.
- Do not strengthen claims unless the suggestion is clearly marked `Review carefully`.
- Do not replace domain terms incorrectly.
- Do not alter numbers, p values, participant codes, quotations, references, institution names, or protected terms.
- Protected terms must override grammar, rewrite, synonym, connector, collocation, and paraphrase suggestions.
- Preserve grammar, tense, number, capitalization, punctuation, and spacing when applying suggestions.

## Implementation

- Keep lexical and rule resources in JSON where practical.
- Add tests whenever possible for new behavior.
- Run `npm run check` after each implementation.
- Report changed files, what was fixed, remaining limitations, and whether `npm run check` passed.
