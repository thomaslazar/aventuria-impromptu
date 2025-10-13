<script setup lang="ts">
import type { RollOutcome } from "@/types/RandomRoll/RandomRolls";
import { NpcLootTable } from "@/types/tables/NpcLootTable";
import { ref } from "vue";

const npcLootTable = new NpcLootTable();

const results = ref<RollOutcome[]>(npcLootTable.roll());

const reroll = () => {
  results.value = npcLootTable.roll();
};
</script>

<template>
  <section class="codex-card codex-card--table">
    <div
      class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3"
    >
      <h3 class="codex-card-title mb-0">Aktuelle Fundstücke</h3>
      <button type="button" class="codex-button" @click="reroll">
        Neu auswürfeln
      </button>
    </div>

    <ul class="codex-table-results">
      <li
        v-for="(result, index) in results"
        :key="index"
        class="codex-table-result"
      >
        <span v-if="result.description" class="codex-table-label">
          {{ result.description }}
        </span>
        <span class="codex-table-value">{{ result.result }}</span>
      </li>
    </ul>
  </section>
</template>
