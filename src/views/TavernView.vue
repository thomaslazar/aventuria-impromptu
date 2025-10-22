<script setup lang="ts">
import { useI18n } from "vue-i18n";
import TavernTable from "../components/TavernTable.vue";

const { t } = useI18n();
</script>

<template>
  <section class="aventuria-section">
    <header class="aventuria-section-header">
      <h1 class="aventuria-section-title">{{ t("views.tavern.title") }}</h1>
      <p class="aventuria-section-intro">{{ t("views.tavern.intro") }}</p>
    </header>

    <TavernTable />
  </section>
</template>
