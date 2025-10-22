<script setup lang="ts">
import { useI18n } from "vue-i18n";
import NpcLootTable from "../components/NpcLootTable.vue";

const { t } = useI18n();
</script>

<template>
  <section class="aventuria-section">
    <header class="aventuria-section-header">
      <h1 class="aventuria-section-title">{{ t("views.npcLoot.title") }}</h1>
      <p class="aventuria-section-intro">{{ t("views.npcLoot.intro") }}</p>
    </header>

    <NpcLootTable />
  </section>
</template>
