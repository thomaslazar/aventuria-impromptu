<script setup lang="ts">
import { useI18n } from "vue-i18n";
import NpcLootTable from "../components/NpcLootTable.vue";

const { t } = useI18n();
</script>

<template>
  <section class="codex-section">
    <header class="codex-section-header">
      <h1 class="codex-section-title">{{ t("views.npcLoot.title") }}</h1>
      <p class="codex-section-intro">{{ t("views.npcLoot.intro") }}</p>
    </header>

    <NpcLootTable />
  </section>
</template>
