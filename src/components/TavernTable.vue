<script setup lang="ts">
import { TavernTable } from "@/types/tables/TavernTable";
import { computed, ref } from "vue";

const tavernTable = new TavernTable();

const results = ref(tavernTable.roll());

const reroll = () => {
  results.value = tavernTable.roll();
};

const tavernName = computed(() =>
  results.value
    .filter(
      (entry) =>
        entry.result &&
        (entry.description === "Name" || entry.description === null),
    )
    .map((entry) => entry.result)
    .join(" "),
);

const additionalDetails = computed(() =>
  results.value.filter(
    (entry) =>
      entry.result &&
      entry.description &&
      entry.description !== "Gaststube/Taverne" &&
      entry.description !== "Name",
  ),
);
</script>

<template>
  <section class="codex-card codex-card--table">
    <div
      class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3"
    >
      <h3 class="codex-card-title mb-0">Aktuelle Auslage</h3>
      <button type="button" class="codex-button" @click="reroll">
        Neu auswürfeln
      </button>
    </div>

    <div class="codex-scroll mb-3">
      <span class="codex-table-label d-inline-block mb-1">
        Name der Gaststube
      </span>
      <span class="codex-table-value">{{ tavernName }}</span>
    </div>

    <ul v-if="additionalDetails.length" class="codex-table-results">
      <li
        v-for="(result, index) in additionalDetails"
        :key="index"
        class="codex-table-result"
      >
        <span class="codex-table-label">
          {{ result.description }}
        </span>
        <span class="codex-table-value">{{ result.result }}</span>
      </li>
    </ul>
  </section>
</template>
