<script setup lang="ts">
import { computed } from "vue";

const buildInfo = __APP_BUILD_INFO__;

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
      <h1 class="codex-section-title">About</h1>
      <p class="codex-section-intro">
        Hintergründe zur Aventuria-Toolbox und der aktuellen Build-Version.
      </p>
    </header>

    <article class="codex-card codex-card--table">
      <p>
        Aventuria Impromptu ist ein schlanker Werkzeugkasten für Spielleitungen
        in Aventurien. Die Tabellen basieren auf klassischen Zufallswürfen und
        liefern dir stimmige Ergebnisse für improvisierte Szenen.
      </p>
      <p>
        Die Anwendung ist bewusst leichtgewichtig gehalten: keine
        Server-Abhängigkeiten, nur Vue&nbsp;3, Vite und ein Hauch Bootstrap.
      </p>

      <div class="codex-build-meta">
        <h2 class="codex-card-title mb-3">Build-Informationen</h2>
        <div class="codex-meta-grid">
          <div class="codex-meta-item">
            <span class="codex-meta-label">Version</span>
            <span class="codex-meta-value">{{ buildInfo.version }}</span>
            <span class="codex-meta-muted">Commit {{ buildInfo.gitSha }}</span>
          </div>
          <div class="codex-meta-item">
            <span class="codex-meta-label">Erstellt am</span>
            <span class="codex-meta-value">{{ builtAtDisplay }}</span>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
