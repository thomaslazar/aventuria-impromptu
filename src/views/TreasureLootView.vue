<script setup lang="ts">
import { useI18n } from "vue-i18n";
import TreasureLootTable from "../components/TreasureLootTable.vue";

const { t } = useI18n();
</script>

<template>
  <section class="aventuria-section">
    <header class="aventuria-section-header">
      <h1 class="aventuria-section-title">
        {{ t("views.treasureLoot.title") }}
      </h1>
      <p class="aventuria-section-intro">
        {{ t("views.treasureLoot.intro") }}
      </p>
    </header>

    <TreasureLootTable />
  </section>
</template>
