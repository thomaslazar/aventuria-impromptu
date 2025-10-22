<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import releaseNotesSource from "../../docs/release-notes.md?raw";

const buildInfo = __APP_BUILD_INFO__;
const { t } = useI18n();

const builtAtDisplay = computed(() => {
  const builtAt = new Date(buildInfo.builtAt);
  return Number.isNaN(builtAt.getTime())
    ? buildInfo.builtAt
    : builtAt.toLocaleString();
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInline(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(/`([^`]+)`/g, (_match, code: string) => {
    return `<code>${code}</code>`;
  });
}

function renderReleaseNotes(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) {
      closeList();
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      html.push(`<h3>${formatInline(line.slice(3).trim())}</h3>`);
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      html.push(`<h2>${formatInline(line.slice(2).trim())}</h2>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${formatInline(line.slice(2).trim())}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${formatInline(line)}</p>`);
  }

  closeList();
  return html.join("");
}

const releaseNotesHtml = computed(() => renderReleaseNotes(releaseNotesSource));
</script>

<template>
  <section class="codex-section">
    <header class="codex-section-header">
      <h1 class="codex-section-title">{{ t("views.about.title") }}</h1>
      <p class="codex-section-intro">{{ t("views.about.intro") }}</p>
    </header>

    <article class="codex-card codex-card--table">
      <p>{{ t("views.about.body.paragraph1") }}</p>
      <p>{{ t("views.about.body.paragraph2") }}</p>

      <div class="codex-build-meta">
        <h2 class="codex-card-title mb-3">
          {{ t("build.informationTitle") }}
        </h2>
        <div class="codex-meta-grid">
          <div class="codex-meta-item">
            <span class="codex-meta-label">
              {{ t("build.versionLabel") }}
            </span>
            <span class="codex-meta-value">{{ buildInfo.version }}</span>
            <span class="codex-meta-muted">
              {{ t("build.commitLabel", { sha: buildInfo.gitSha }) }}
            </span>
          </div>
          <div class="codex-meta-item">
            <span class="codex-meta-label">
              {{ t("build.builtAtLabel") }}
            </span>
            <span class="codex-meta-value">{{ builtAtDisplay }}</span>
          </div>
        </div>
      </div>
    </article>

    <article class="codex-card codex-card--table">
      <h2 class="codex-card-title mb-3">
        {{ t("views.about.releaseNotesTitle") }}
      </h2>
      <div
        class="codex-release-notes"
        v-html="releaseNotesHtml"
        aria-live="polite"
      ></div>
    </article>
  </section>
</template>
