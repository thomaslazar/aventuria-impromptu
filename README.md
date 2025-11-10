# Aventuria Impromptu

Werkzeugkasten für Spielleitungen in Aventurien. Erzeugt Zufallsinhalte für
Das Schwarze Auge mit Vue 3 und Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Regenerate Optolith Dataset

```sh
npm run optolith:extract
```

See `docs/optolith/extraction.md` for details on the required Optolith archive and output format (outputs land in `public/data/optolith/`).

The extractor automatically walks every `Data/<locale>/*.yaml` inside the Optolith archive (except `UI.yaml`, which only contains Optolith application strings), emitting derived sections (ID-based entities) and raw payloads (localization/metadata dictionaries). Inspect `public/data/optolith/manifest.json` for the authoritative section list; each entry advertises a `type` flag (`derived` or `raw`) so downstream tooling can decide how to load it.

Spellcasting data from `AnimistForces`, `Curses`, `DominationRituals`, `ElvenMagicalSongs`, `GeodeRituals`, `MagicalDances`, `MagicalMelodies`, `RogueSpells`, `Spells`, and `ZibiljaRituals` is folded into `spells.json` during extraction so the parser only needs to read a single lookup table.

### Parse Stat Blocks (CLI Harness)

```sh
npm run optolith:parse -- --sample notia-botero-montez
```

The harness emits structured JSON including parser warnings; see `docs/optolith/extraction.md` for usage.

### Generate Optolith Character JSON

```sh
npm run optolith:convert -- --sample notia-botero-montez --out npc.json
```

Runs the full parser → resolver → exporter pipeline and writes an Optolith-compatible JSON payload. Additional options are documented in `docs/optolith/extraction.md`.
