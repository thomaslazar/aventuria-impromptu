<template>
  <section class="codex-section optolith-view">
    <header class="codex-section-header">
      <h1 class="codex-section-title">
        {{ t("views.optolithConverter.title") }}
      </h1>
      <p class="codex-section-intro optolith-intro">
        {{ t("views.optolithConverter.intro") }}
      </p>
    </header>

    <article class="codex-card codex-card--table optolith-card">
      <div class="optolith-callout optolith-callout--accent" role="note">
        <span>
          {{ t("views.optolithConverter.roll20Note.prefix") }}
          <a
            class="optolith-roll20__link"
            href="https://roll20.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t("views.optolithConverter.roll20Note.linkText") }}
          </a>
          {{ t("views.optolithConverter.roll20Note.suffix") }}
        </span>
        <span>
          {{ t("views.optolithConverter.languageNote") }}
        </span>
      </div>

      <section class="optolith-usage">
        <h2 class="codex-card-title optolith-usage__title">
          {{ t("views.optolithConverter.usage.title") }}
        </h2>
        <ol class="optolith-usage__list">
          <li>{{ t("views.optolithConverter.usage.steps.paste") }}</li>
          <li>{{ t("views.optolithConverter.usage.steps.convert") }}</li>
          <li>{{ t("views.optolithConverter.usage.steps.review") }}</li>
          <li>{{ t("views.optolithConverter.usage.steps.download") }}</li>
        </ol>
      </section>

      <div class="optolith-field-group">
        <label for="stat-block-input" class="optolith-label">
          {{ t("views.optolithConverter.input.label") }}
        </label>
        <textarea
          id="stat-block-input"
          v-model="input"
          class="optolith-textarea"
          :class="{ 'is-invalid': inputTooLong }"
          rows="14"
          :placeholder="t('views.optolithConverter.input.placeholder')"
        ></textarea>
        <div class="optolith-helper">
          {{
            t("views.optolithConverter.input.help", {
              max: MAX_LENGTH,
              current: input.length,
            })
          }}
        </div>
        <p v-if="inputTooLong" class="optolith-inline-error">
          {{ t("views.optolithConverter.input.tooLong") }}
        </p>
      </div>

      <div class="optolith-actions">
        <button
          type="button"
          class="codex-button"
          :disabled="disableConvert"
          @click="convert"
        >
          {{ t("views.optolithConverter.buttons.convert") }}
        </button>
        <button
          type="button"
          class="codex-button codex-button--ghost"
          @click="reset"
          :disabled="status === 'loading'"
        >
          {{ t("views.optolithConverter.buttons.reset") }}
        </button>
        <button
          type="button"
          class="codex-button codex-button--ghost"
          @click="loadLastResult"
          :disabled="!hasStoredResult || status === 'loading'"
        >
          {{ t("views.optolithConverter.buttons.loadLast") }}
        </button>
      </div>

      <div
        v-if="status === 'loading'"
        class="optolith-callout optolith-callout--info"
        role="status"
      >
        {{ t("views.optolithConverter.loading") }}
      </div>
      <div
        v-if="error"
        class="optolith-callout optolith-callout--danger"
        role="alert"
      >
        {{ error }}
      </div>
    </article>

    <article v-if="result" class="codex-card codex-card--table optolith-result">
      <header class="optolith-result__header">
        <div>
          <h2 class="codex-card-title optolith-result__title">
            {{ result.exported.name }}
          </h2>
          <p class="optolith-result__meta">
            {{
              t("views.optolithConverter.datasetInfo", {
                schema: result.manifest.schemaVersion,
                checksum: result.manifest.sourceChecksum.slice(0, 12),
              })
            }}
          </p>
        </div>
        <div class="optolith-result__actions">
          <button type="button" class="codex-button" @click="downloadJson">
            {{ t("views.optolithConverter.buttons.download") }}
          </button>
          <button
            type="button"
            class="codex-button codex-button--ghost"
            @click="copyWarnings"
          >
            {{ t("views.optolithConverter.buttons.copyWarnings") }}
          </button>
        </div>
      </header>

      <div
        v-if="displayWarnings.length > 0"
        class="optolith-callout optolith-callout--warning"
        role="alert"
      >
        <h3 class="optolith-callout__title">
          {{ t("views.optolithConverter.warnings.title") }}
        </h3>
        <ul class="optolith-callout__list">
          <li v-for="warning in displayWarnings" :key="warning">
            {{ warning }}
          </li>
        </ul>
      </div>

      <details class="optolith-details">
        <summary>{{ t("views.optolithConverter.normalizedHeading") }}</summary>
        <pre>{{ result.normalizedSource }}</pre>
      </details>

      <details class="optolith-details" open>
        <summary>{{ t("views.optolithConverter.jsonHeading") }}</summary>
        <pre>{{ formattedJson }}</pre>
      </details>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import type {
  ConversionRequestMessage,
  ConversionResultPayload,
  ConverterWorkerMessage,
} from "@/types/optolith/converter";

const { t } = useI18n();

const MAX_LENGTH = 6000;
const STORAGE_KEY = "optolith-converter:last";

type Status = "idle" | "loading" | "success" | "error";

const input = ref("");
const status = ref<Status>("idle");
const error = ref<string | null>(null);
const result = ref<ConversionResultPayload | null>(null);
const worker = ref<Worker | null>(null);
const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;

const inputTooLong = computed(() => input.value.length > MAX_LENGTH);
const disableConvert = computed(
  () =>
    status.value === "loading" ||
    input.value.trim().length === 0 ||
    inputTooLong.value,
);
const hasStoredResult = computed(() =>
  Boolean(localStorage.getItem(STORAGE_KEY)),
);
const formattedJson = computed(() =>
  result.value ? JSON.stringify(result.value.exported, null, 2) : "",
);
const displayWarnings = computed(() => {
  if (!result.value) {
    return [] as string[];
  }
  const warnings = new Set<string>();
  const localizeWarning = (message: string): string => {
    if (message.startsWith("[Parser] ")) {
      return `${t("views.optolithConverter.warnings.prefixes.parser")} ${message.slice(9)}`;
    }
    if (message.startsWith("[Resolver] ")) {
      return `${t("views.optolithConverter.warnings.prefixes.resolver")} ${message.slice(10)}`;
    }
    if (message.startsWith("[Exporter] ")) {
      return `${t("views.optolithConverter.warnings.prefixes.exporter")} ${message.slice(10)}`;
    }
    return message;
  };
  const exportedWarnings = result.value.exportedWarnings ?? [];
  exportedWarnings.forEach((warning) => warnings.add(localizeWarning(warning)));
  (result.value.parserWarnings ?? []).forEach((warning) =>
    warnings.add(
      localizeWarning(
        `[Parser] ${warning.section ?? "general"}: ${warning.message}`,
      ),
    ),
  );
  (result.value.resolverWarnings ?? []).forEach((warning) =>
    warnings.add(
      localizeWarning(`[Resolver] ${warning.section}: ${warning.message}`),
    ),
  );
  Object.entries(result.value.unresolved ?? {}).forEach(
    ([section, entries]) => {
      entries.forEach((entry) =>
        warnings.add(localizeWarning(`[Resolver] ${section}: ${entry}`)),
      );
    },
  );
  return Array.from(warnings);
});

function ensureWorker(): Worker {
  if (worker.value) {
    return worker.value;
  }
  const instance = new Worker(
    new URL("../workers/optolithConverter.worker.ts", import.meta.url),
    {
      type: "module",
    },
  );
  instance.addEventListener("message", handleWorkerMessage as EventListener);
  worker.value = instance;
  return instance;
}

function handleWorkerMessage(event: MessageEvent<ConverterWorkerMessage>) {
  const message = event.data;
  if (!message) {
    return;
  }
  if (message.type === "error") {
    status.value = "error";
    error.value = message.error;
    return;
  }
  status.value = "success";
  error.value = null;
  result.value = message.payload;
  persistLastResult();
}

function convert() {
  if (disableConvert.value) {
    return;
  }
  status.value = "loading";
  error.value = null;
  result.value = null;

  const instance = ensureWorker();
  instance.postMessage({
    type: "convert",
    payload: {
      source: input.value,
      baseUrl,
    },
  } satisfies ConversionRequestMessage);
}

function loadLastResult() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return;
  }
  try {
    const parsed = JSON.parse(stored) as {
      input: string;
      payload: ConversionResultPayload;
    };
    input.value = parsed.input;
    result.value = {
      ...parsed.payload,
      exportedWarnings: parsed.payload.exportedWarnings ?? [],
    };
    status.value = "success";
    error.value = null;
  } catch (err) {
    console.error("Failed to restore cached result", err);
    localStorage.removeItem(STORAGE_KEY);
  }
}

function persistLastResult() {
  if (!result.value) {
    return;
  }
  const payload = {
    input: input.value,
    payload: result.value,
    storedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function downloadJson() {
  if (!result.value) {
    return;
  }
  const blob = new Blob([JSON.stringify(result.value.exported, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = result.value.exported.name
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  anchor.href = url;
  anchor.download = `${safeName || "npc"}-optolith.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function copyWarnings() {
  if (displayWarnings.value.length === 0) {
    return;
  }
  try {
    if (!navigator?.clipboard?.writeText) {
      throw new Error("Clipboard API not available");
    }
    await navigator.clipboard.writeText(displayWarnings.value.join("\n"));
  } catch (err) {
    console.error("Failed to copy warnings", err);
  }
}

function reset() {
  input.value = "";
  status.value = "idle";
  error.value = null;
  result.value = null;
}

onMounted(() => {
  if (hasStoredResult.value) {
    loadLastResult();
  }
});

onBeforeUnmount(() => {
  if (worker.value) {
    worker.value.terminate();
    worker.value = null;
  }
});
</script>

<style scoped>
.optolith-view {
  display: grid;
  gap: clamp(1.5rem, 2vw, 2.5rem);
}

.optolith-roll20 {
  margin: 0;
  color: rgba(47, 36, 18, 0.9);
  max-width: 52ch;
  font-size: 1rem;
  line-height: 1.6;
}

.optolith-intro {
  color: var(--codex-text);
}

.optolith-roll20__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-transform: none;
  color: rgba(173, 116, 28, 0.95);
  font-weight: 600;
}

.optolith-roll20__link:hover,
.optolith-roll20__link:focus-visible {
  color: var(--codex-accent-dark);
}

.optolith-card {
  display: grid;
  gap: 1.75rem;
}

.optolith-callout {
  border-left: 4px solid var(--codex-accent);
  padding: 1rem 1.25rem;
  border-radius: calc(var(--codex-radius) - 2px);
  background: rgba(197, 143, 45, 0.14);
  color: #4a3614;
  font-weight: 500;
  line-height: 1.4;
}

.optolith-callout--accent {
  background: rgba(197, 143, 45, 0.18);
  border-left-color: rgba(197, 143, 45, 0.9);
  color: rgba(47, 36, 18, 0.9);
  font-weight: 500;
  display: grid;
  gap: 0.35rem;
}

.optolith-callout--warning {
  border-left-color: #ce7f1d;
  background: rgba(206, 127, 29, 0.16);
  color: #4a2a07;
}

.optolith-callout--danger {
  border-left-color: #b3473e;
  background: rgba(179, 71, 62, 0.16);
  color: #5a1d18;
}

.optolith-usage {
  display: grid;
  gap: 0.75rem;
}

.optolith-usage__title {
  margin-bottom: 0;
}

.optolith-usage__list {
  margin: 0;
  padding-left: 1.25rem;
  display: grid;
  gap: 0.5rem;
  font-weight: 500;
}

.optolith-field-group {
  display: grid;
  gap: 0.75rem;
}

.optolith-label {
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(47, 36, 18, 0.68);
}

.optolith-textarea {
  width: 100%;
  min-height: 18rem;
  padding: 1rem 1.1rem;
  border-radius: var(--codex-radius);
  border: 1px solid rgba(47, 36, 18, 0.18);
  background: rgba(255, 255, 255, 0.86);
  font-family:
    ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", "Courier New",
    monospace;
  font-size: 0.95rem;
  color: #2f2412;
  line-height: 1.5;
  resize: vertical;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.optolith-textarea:focus {
  outline: none;
  border-color: rgba(197, 143, 45, 0.65);
  box-shadow: 0 0 0 3px rgba(197, 143, 45, 0.18);
}

.optolith-textarea.is-invalid {
  border-color: rgba(179, 71, 62, 0.75);
  box-shadow: 0 0 0 3px rgba(179, 71, 62, 0.2);
}

.optolith-helper {
  font-size: 0.85rem;
  color: rgba(47, 36, 18, 0.65);
}

.optolith-inline-error {
  margin: 0;
  font-size: 0.85rem;
  color: #7a1d18;
  font-weight: 600;
}

.optolith-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.optolith-result {
  display: grid;
  gap: 1.5rem;
}

.optolith-result__header {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  justify-content: space-between;
  align-items: flex-start;
}

.optolith-result__title {
  margin-bottom: 0.25rem;
}

.optolith-result__meta {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(47, 36, 18, 0.7);
}

.optolith-result__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.optolith-callout__title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.optolith-callout__list {
  margin: 0;
  padding-left: 1.25rem;
  display: grid;
  gap: 0.45rem;
}

.optolith-details {
  border: 1px solid rgba(47, 36, 18, 0.16);
  border-radius: var(--codex-radius);
  background: rgba(255, 255, 255, 0.78);
  padding: 1rem 1.25rem;
}

.optolith-details + .optolith-details {
  margin-top: 0.75rem;
}

.optolith-details summary {
  cursor: pointer;
  font-weight: 700;
  color: rgba(47, 36, 18, 0.85);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.optolith-details summary:focus-visible {
  outline: 2px solid var(--codex-accent);
  outline-offset: 4px;
}

.optolith-details pre {
  margin: 0.85rem 0 0;
  padding: 1rem;
  border-radius: var(--codex-radius);
  background: rgba(47, 36, 18, 0.08);
  color: #251b0b;
  max-height: 20rem;
  overflow: auto;
  font-family:
    ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", "Courier New",
    monospace;
  font-size: 0.85rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .optolith-result__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .optolith-result__actions {
    width: 100%;
  }

  .optolith-result__actions .codex-button {
    flex: 1 0 auto;
    justify-content: center;
  }
}
</style>
