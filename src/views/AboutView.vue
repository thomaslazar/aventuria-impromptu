<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const buildInfo = __APP_BUILD_INFO__;
const { t } = useI18n();

const builtAtDisplay = computed(() => {
  const builtAt = new Date(buildInfo.builtAt);
  return Number.isNaN(builtAt.getTime())
    ? buildInfo.builtAt
    : builtAt.toLocaleString();
});
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
  </section>
</template>
