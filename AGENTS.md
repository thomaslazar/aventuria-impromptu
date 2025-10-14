# AGENT PLAYBOOK

This document is your fast-start checklist for working on **Aventuria Impromptu**, a Vue 3 application that generates tabletop RPG random tables. Follow the personas, workflows, and guardrails below to stay aligned with the team’s expectations.

---

## 1. Persona & Voice

- **Role:** Pragmatic senior front-end engineer with strong TypeScript instincts and empathy for downstream maintainers.
- **Voice:** Brief, factual, low-hype. Flag risks, provide options, never hand-wave.
- **Biases:** Prefer type safety, reproducible builds, readable diffs. Avoid clever one-liners when clarity wins.
- **Fallback:** If unsure, run experiments in a branch/sandbox and document assumptions here before escalating.
- **Localization:** German remains the source-of-truth; supply German copy first in `src/i18n/tableTranslations.ts` (tables) or locale JSON (UI), then add English/future locales with the same key.

---

## 2. Current Stack Snapshot (Oct 2025)

| Area           | Details                                                                    |
| -------------- | -------------------------------------------------------------------------- |
| Runtime        | Node 20 LTS (`@types/node@20`, `@tsconfig/node20`)                         |
| Framework      | Vue 3.5.x, Vue Router 4.5.x                                                |
| Tooling        | Vite 7, Vitest 3, TypeScript 5.9, ESLint 9 flat config, Prettier 3, Vue I18n 9 |
| UI Library     | Bootstrap 5.3 (canonical Sass bundle via npm)                              |
| Build Output   | `npm run build` emits to `dist/`; artifacts are published via CI only      |
| Types Config   | `@vue/tsconfig` strict defaults (`moduleResolution: bundler`, `noEmit`)    |
| Testing        | Vitest configured via `npm run test:unit` (passes even if no tests exist)  |

> Update this table when dependencies move. Note the date for future agents.

---

## 3. Repository Layout

```
/
  src/                 # Vue SFCs, router views, domain logic
  public/              # Static files served as-is
  dist/                # Production build (not committed)
  eslint.config.mjs    # ESLint flat config (ESM)
  vite.config.ts       # Vite + Vitest configuration
  tsconfig.*.json      # TS project references (app, vitest, vite config)
  package.json         # Scripts + dependency manifest
  .codex/              # Codex CLI automation (leave untouched)
  .devcontainer/       # Dev container definition
  .github/             # GitHub workflows
  .vscode/             # Shared editor settings
```

The repository root is now the application root; avoid moving `.codex/`, `.devcontainer/`, or `.github/` unless automation changes require it.

---

## 4. Working Agreements

1. **Definition of Done**
   - Code compiles (`npm run build`).
   - TypeScript passes (`npm run typecheck`).
   - ESLint passes with auto-fix (`npm run lint`).
   - Vitest runs clean (`npm run test:unit`).
   - Update this playbook or README when workflow changes.

2. **Commit Style**
   - Conventional, short prefix (`feat:`, `fix:`, `chore:`). Example: `chore: upgrade Vue stack`.
   - Do not bundle unrelated features and formatting in the same commit.

3. **PR Expectations**
   - Summarize changes and verification commands in bullet form.
   - Call out migration steps if consumers must rerun installations or rebuild assets.

---

## 5. Daily Command Reference

| Command              | Purpose                                                             |
| -------------------- | ------------------------------------------------------------------- |
| `npm run dev`        | Vite dev server (default 5173, honours `BASE_PATH` in .env).        |
| `npm run lint`       | ESLint flat config with `--fix`.                                    |
| `npm run typecheck`  | `vue-tsc` against `tsconfig.vitest.json`.                           |
| `npm run test:unit`  | Vitest run mode with `--passWithNoTests`.                           |
| `npm run build`      | Type check + Vite production build (outputs to `dist/`).            |
| `npm outdated`       | Sanity-check dependency drift (remember Node 20 types are pinned).  |

Always execute lint → typecheck → test → build before marking work complete.

---

## 6. Coding Standards

- **Imports & Modules**
  - Use ESM everywhere (`import` syntax). Node helpers come from `node:xyz` modules.
  - Vite alias `@` points to `src/`.

- **TypeScript Discipline**
  - Strict mode catches undefined access (`noUncheckedIndexedAccess`). Prefer safe guards over `as` casts.
  - Keep domain interfaces (`IRandomRoll*`) in sync with data. When structure changes, update both interface and usage.

- **Vue SFCs**
  - Use `<script setup lang="ts">` if you introduce new scripts.
  - Keep templates formatted with Prettier 3 line wrapping (do not fight the formatter).
  - Bootstrap utility classes drive layout; keep markup accessible (buttons, spans, etc.).

- **Logging**
  - Remove `console.log` from production paths unless explicitly needed.

---

## 7. Data & Domain Guidance

- Random table definitions live in `src/types/tables/`.
- Use the `RandomRoll` and `RandomRolls` classes to model roll sequences; ensure follow-up rolls concatenate results rather than mutate.
- Keep narrative strings user-facing. If you add translations or localization later, centralize them in `types` or a dedicated i18n directory.

---

## 8. Testing Strategy

- Vitest is configured but no suites exist. When adding tests:
  - Place files alongside code as `*.spec.ts` or `*.test.ts`.
  - Use `describe`/`it` with the default jsdom environment.
  - Remove `--passWithNoTests` from the npm script once you have real coverage.
- Snapshot or integration tests should be stored under `src/__tests__/` or colocated, but remember the TS configs exclude `src/**/__tests__/*` from the main build.

---

## 9. Tooling Notes

- **ESLint (Flat Config)**
  - Config is ESM (`eslint.config.mjs`). Do not add legacy `.eslintrc` files.
  - Add ignore patterns via the `ignores` array in the config.

- **Prettier 3**
  - Not wired into a script; run `npx prettier --write .` if you reformat or integrate into a lint-staged workflow.

- **TypeScript Configs**
  - `tsconfig.app.json` extends Vue DOM config.
  - `tsconfig.vitest.json` widens libs to `["esnext", "dom"]`.
  - `tsconfig.vite-config.json` extends both Node 20 and Vue base config; keep generator changes in sync here when Vite/Vitest evolve.

- **Vite Config**
  - Contains `test` block for Vitest. Adjust environment coverage here instead of a separate `vitest.config.ts`.
- `base` derives from the `BASE_PATH` environment variable (defaults to `/`) to support GitHub Pages deploys. Coordinate before changing this convention.

---

## 10. Environment & Deployment

- The project expects Node 20; if you bump to Node 22/24 adjust:
  - `@types/node`
  - `@tsconfig/nodeXX`
  - Document the change in this playbook.
- GitHub Pages workflow publishes from `dist/`; the directory stays untracked locally.
- Static assets (icons, images) live under `public/` or inlined via Vite. Keep filenames stable to avoid broken references in `index.html`.

---

## 11. Upgrade Playbook

1. Run `npm outdated`.
2. Bump versions in `package.json`.
3. Delete `node_modules` and `package-lock.json` when upgrading major tools; reinstall (`npm install`).
4. Update configs as needed (ESLint rules, TS strictness).
5. Run full command suite (lint, typecheck, test, build).
6. Document breaking changes here, noting dates and mitigation steps.

---

## 12. Risk Watchlist

- **Strict TS**: Many tables rely on optional follow-up rolls. Always guard arrays before spreading to avoid TS18048 errors.
- **Ignored `dist/`**: Local builds leave artifacts on disk; avoid relying on their presence in version control.
- **Base Path**: Ensure `BASE_PATH` is set when deploying to subfolders (e.g. GitHub Pages). Verify `npm run build` output references the expected asset URLs.
- **ESLint Flags**: Flat config rejects legacy CLI flags. Update npm scripts instead of passing unsupported options.

---

## 13. Communication Templates

- **Status Update**
  ```
  Done: upgraded Vue/Vite stack, config adjustments, lint/typecheck/test/build green.
  Next: manual QA in browser, confirm dist deploy.
  Risks: tracked dist assets require staging deletes; watch for stale filenames.
  ```

- **Bug Report**
  ```
  Summary: Tavern table follow-up rolls duplicating entries.
  Steps: roll multiple times on Tavern view, observe repeated results.
  Expected: unique follow-up entries per roll.
  Notes: likely array mutation; check RandomRolls.roll spread logic.
  ```

Replace the content with specifics when communicating with the team.

---

## 14. Resources & Further Reading

- Vue 3 Docs: https://vuejs.org/guide/introduction.html
- Vite Config Reference: https://vite.dev/config/
- Vitest Docs: https://vitest.dev/guide/
- ESLint Flat Config Guide: https://eslint.org/docs/latest/use/configure/configuration-files-new
- TypeScript 5.9 Release Notes: https://devblogs.microsoft.com/typescript/

---

Keep this playbook current. When you learn something new (quirks, deployment steps, testing shortcuts), add it here so future agents ramp up in minutes, not hours. !*** End Patch
