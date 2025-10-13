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
  <section class="container py-4">
    <h1 class="mb-3">About</h1>
    <p class="text-body-secondary">
      Diese Anwendung erzeugt Zufallstabellen für Das Schwarze Auge.
    </p>

    <div class="border rounded-3 p-3 bg-body-tertiary">
      <h2 class="h5 mb-2">Build-Informationen</h2>
      <dl class="row mb-0 small">
        <dt class="col-sm-4">Version</dt>
        <dd class="col-sm-8 mb-0">
          <span class="fw-semibold">{{ buildInfo.version }}</span>
          <span class="text-body-secondary">({{ buildInfo.gitSha }})</span>
        </dd>
        <dt class="col-sm-4 mt-2">Erstellt am</dt>
        <dd class="col-sm-8 mt-2 mb-0 text-body-secondary">
          {{ builtAtDisplay }}
        </dd>
      </dl>
    </div>
  </section>
</template>
