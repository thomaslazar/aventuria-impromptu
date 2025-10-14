<script setup lang="ts">
import type { LocalizedText } from "@/i18n/localizedText";
import { resolveLocalizedText } from "@/i18n/localizedText";
import type { RollOutcome } from "@/types/interfaces/IRandomRolls";
import { NpcLootTable } from "@/types/tables/NpcLootTable";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const npcLootTable = new NpcLootTable();
const { t, locale } = useI18n();

const results = ref<RollOutcome[]>(npcLootTable.roll());

const reroll = () => {
  results.value = npcLootTable.roll();
};

const translate = (value: LocalizedText | null | undefined): string => {
  return (
    resolveLocalizedText(value ?? null, {
      t,
      locale: locale.value,
    }) ?? ""
  );
};
</script>

<template>
  <section class="codex-card codex-card--table">
    <div
      class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3"
    >
      <h3 class="codex-card-title mb-0">
        {{ t("tables.npcLoot.currentSpread") }}
      </h3>
      <button type="button" class="codex-button" @click="reroll">
        {{ t("buttons.reroll") }}
      </button>
    </div>

    <ul class="codex-table-results">
      <li
        v-for="(result, index) in results"
        :key="index"
        class="codex-table-result"
      >
        <span v-if="result.description" class="codex-table-label">
          {{ translate(result.description ?? null) }}
        </span>
        <span class="codex-table-value">
          {{ translate(result.result ?? null) }}
        </span>
      </li>
    </ul>
  </section>
</template>
