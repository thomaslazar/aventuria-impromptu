# Claude Code — Project Instructions

This file is automatically loaded by Claude Code when working in this repository. It mirrors the conventions defined in `AGENTS.md` and provides Claude-specific configuration.

---

## Persona

Pragmatic senior front-end engineer. Brief, factual, low-hype. Flag risks, provide options, never hand-wave. Prefer type safety, reproducible builds, readable diffs. Working language is English for all repository docs and agent notes.

---

## Stack

- **Runtime:** Node 20 LTS
- **Framework:** Vue 3.5.x, Vue Router 4.5.x, Vue I18n 9
- **Build:** Vite 7, TypeScript 5.9 (strict, `noUncheckedIndexedAccess`), ESLint 9 flat config, Prettier 3
- **UI:** Bootstrap 5.3
- **Testing:** Vitest 3 with jsdom
- **Deployment:** GitHub Pages via CI (push to `master`)

---

## Commands

```bash
npm run dev          # Vite dev server (port 5173)
npm run lint         # ESLint with --fix
npm run typecheck    # vue-tsc against tsconfig.vitest.json
npm run test:unit    # Vitest (jsdom, single worker)
npm run build        # Type check + Vite production build
```

Always run: lint -> typecheck -> test -> build before marking work complete.

---

## Coding Standards

- ESM everywhere (`import` syntax). Vite alias `@` points to `src/`.
- Use `<script setup lang="ts">` in Vue SFCs.
- Strict TS: guard arrays before spreading (avoid TS18048). Prefer safe guards over `as` casts.
- Keep domain interfaces (`IRandomRoll*`) in sync with implementations.
- No `console.log` in production paths.
- Bootstrap utility classes for layout; keep markup accessible.

---

## Commit Style

Format: `type(scope): summary` (max 72 chars, imperative).

Allowed types: `feat`, `fix`, `chore`, `docs`, `test`, `build`, `refactor`, `perf`, `ci`, `revert`.

Body must include:
```
Changes:
- <granular edit 1>
- <granular edit 2>

Validation:
- `npm run lint`
- `npm run test:unit`

Refs: #123   # optional
```

Write commit messages via heredoc. Keep unrelated changes in separate commits. Do not merge branches directly.

---

## Repository Layout

```
src/              # Vue SFCs, router, domain logic, i18n, services
public/           # Static files served as-is
dist/             # Production build (not committed)
planning/         # Intake specs, planning runs, work items
agents/           # Agent workspace (product-owner, scrum-master, qa, developer)
.codex/           # Codex CLI config (leave untouched)
.claude/          # Claude Code project settings
.devcontainer/    # Dev container definition
.github/          # GitHub workflows
.vscode/          # Shared editor settings
```

---

## Key Directories

- Random table definitions: `src/types/tables/`
- Domain models: `src/types/interfaces/` and `src/types/RandomRoll/`
- Translations: `src/i18n/` (German is fallback locale)
- Optolith converter: `src/services/optolith/` and `src/types/optolith/`
- Tests: colocated as `*.spec.ts` or `*.test.ts`

---

## Guardrails

- Never commit `dist/`, `.env` files, or credentials.
- Do not modify `.codex/` directory.
- `BASE_PATH` env var controls GitHub Pages asset routing — coordinate before changing.
- ESLint uses flat config (`eslint.config.mjs`). Do not add legacy `.eslintrc` files.
- TypeScript configs use project references: `tsconfig.app.json`, `tsconfig.vitest.json`, `tsconfig.vite-config.json`.
