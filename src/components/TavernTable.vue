<script setup lang="ts">
import type { RollOutcome } from "@/types/RandomRoll/RandomRolls";
import { TavernTable } from "@/types/tables/TavernTable";
import { computed, ref } from "vue";

const tavernTable = new TavernTable();

const results = ref<RollOutcome[]>(tavernTable.roll());

const reroll = () => {
  results.value = tavernTable.roll();
};

const tavernName = computed(() => {
  const nameEntries = results.value.filter(
    (entry) =>
      entry.result &&
      (entry.description === "Name" || entry.description === null),
  );

  if (!nameEntries.length) {
    return "";
  }

  const parts: string[] = [];

  nameEntries.forEach((entry, index) => {
    let text = entry.result ?? "";
    if (!text) {
      return;
    }

    if (entry.meta?.articleStrategy === "zum-zur") {
      const nextWithGender = nameEntries
        .slice(index + 1)
        .find((candidate) => candidate.meta?.gender);

      const gender = nextWithGender?.meta?.gender;
      let article = "Zum";

      if (gender === "feminine") {
        article = "Zur";
      } else if (gender === "plural") {
        article = "Zu den";
      }

      text = text.replace("Zum/ Zur", article);
    }

    parts.push(text.trim());
  });

  return parts.join(" ").replace(/\s+/g, " ").trim();
});

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

    <ul class="codex-table-results mb-3">
      <li class="codex-table-result">
        <span class="codex-table-label">Name der Gaststube</span>
        <span class="codex-table-value">{{ tavernName }}</span>
      </li>
    </ul>

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
