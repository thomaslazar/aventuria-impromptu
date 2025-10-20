<template>
  <div class="container py-4">
    <h1 class="mb-3">{{ t("views.optolithConverter.title") }}</h1>
    <p class="text-muted mb-3">
      {{ t("views.optolithConverter.intro") }}
    </p>
    <div class="alert alert-info mb-4" role="note">
      {{ t("views.optolithConverter.languageNote") }}
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h2 class="h5">{{ t("views.optolithConverter.usage.title") }}</h2>
        <ol class="mb-0 ps-3">
          <li>{{ t("views.optolithConverter.usage.steps.paste") }}</li>
          <li>{{ t("views.optolithConverter.usage.steps.convert") }}</li>
          <li>{{ t("views.optolithConverter.usage.steps.review") }}</li>
          <li>{{ t("views.optolithConverter.usage.steps.download") }}</li>
        </ol>
      </div>
    </div>

    <div class="mb-3">
      <label for="stat-block-input" class="form-label">
        {{ t("views.optolithConverter.input.label") }}
      </label>
      <textarea
        id="stat-block-input"
        v-model="input"
        class="form-control"
        :class="{ 'is-invalid': inputTooLong }"
        rows="14"
        :placeholder="t('views.optolithConverter.input.placeholder')"
      ></textarea>
      <div class="form-text">
        {{
          t("views.optolithConverter.input.help", {
            max: MAX_LENGTH,
            current: input.length,
          })
        }}
      </div>
      <div v-if="inputTooLong" class="invalid-feedback">
        {{ t("views.optolithConverter.input.tooLong") }}
      </div>
    </div>

    <div class="d-flex flex-wrap gap-2 mb-4">
      <button
        type="button"
        class="btn btn-primary"
        :disabled="disableConvert"
        @click="convert"
      >
        {{ t("views.optolithConverter.buttons.convert") }}
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="reset"
        :disabled="status === 'loading'"
      >
        {{ t("views.optolithConverter.buttons.reset") }}
      </button>
      <button
        type="button"
        class="btn btn-outline-success"
        @click="loadLastResult"
        :disabled="!hasStoredResult || status === 'loading'"
      >
        {{ t("views.optolithConverter.buttons.loadLast") }}
      </button>
    </div>

    <div v-if="status === 'loading'" class="alert alert-info" role="status">
      {{ t("views.optolithConverter.loading") }}
    </div>
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <section v-if="result" class="mb-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <div
            class="d-flex flex-wrap justify-content-between gap-2 align-items-center mb-3"
          >
            <div>
              <h2 class="h5 mb-1">{{ result.exported.name }}</h2>
              <p class="mb-0 text-muted">
                {{
                  t("views.optolithConverter.datasetInfo", {
                    schema: result.manifest.schemaVersion,
                    checksum: result.manifest.sourceChecksum.slice(0, 12),
                  })
                }}
              </p>
            </div>
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-success"
                @click="downloadJson"
              >
                {{ t("views.optolithConverter.buttons.download") }}
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="copyWarnings"
              >
                {{ t("views.optolithConverter.buttons.copyWarnings") }}
              </button>
            </div>
          </div>

          <div
            v-if="displayWarnings.length > 0"
            class="alert alert-warning"
            role="alert"
          >
            <h3 class="h6 mb-2">
              {{ t("views.optolithConverter.warnings.title") }}
            </h3>
            <ul class="mb-0 ps-3">
              <li v-for="warning in displayWarnings" :key="warning">
                {{ warning }}
              </li>
            </ul>
          </div>

          <details class="mb-3">
            <summary class="fw-semibold">
              {{ t("views.optolithConverter.normalizedHeading") }}
            </summary>
            <pre class="bg-light border rounded p-3 small overflow-auto">{{
              result.normalizedSource
            }}</pre>
          </details>

          <details open>
            <summary class="fw-semibold">
              {{ t("views.optolithConverter.jsonHeading") }}
            </summary>
            <pre class="bg-light border rounded p-3 small overflow-auto">{{
              formattedJson
            }}</pre>
          </details>
        </div>
      </div>
    </section>
  </div>
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
  result.value.exportedWarnings.forEach((warning) =>
    warnings.add(localizeWarning(warning)),
  );
  result.value.parserWarnings.forEach((warning) =>
    warnings.add(
      localizeWarning(
        `[Parser] ${warning.section ?? "general"}: ${warning.message}`,
      ),
    ),
  );
  result.value.resolverWarnings.forEach((warning) =>
    warnings.add(
      localizeWarning(`[Resolver] ${warning.section}: ${warning.message}`),
    ),
  );
  Object.entries(result.value.unresolved).forEach(([section, entries]) => {
    entries.forEach((entry) =>
      warnings.add(localizeWarning(`[Resolver] ${section}: ${entry}`)),
    );
  });
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
    result.value = parsed.payload;
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
.container {
  max-width: 960px;
}
</style>
