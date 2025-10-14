<script setup lang="ts">
import { useI18n } from "vue-i18n";
import TavernTable from "../components/TavernTable.vue";

const { t } = useI18n();
</script>

<template>
  <section class="codex-section">
    <header class="codex-section-header">
      <h1 class="codex-section-title">{{ t("views.tavern.title") }}</h1>
      <p class="codex-section-intro">{{ t("views.tavern.intro") }}</p>
    </header>

    <TavernTable />
  </section>
</template>
