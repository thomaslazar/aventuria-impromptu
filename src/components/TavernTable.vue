<script setup lang="ts">
import type { LocalizedText } from "@/i18n/localizedText";
import { resolveLocalizedText } from "@/i18n/localizedText";
import type { RollOutcome } from "@/types/interfaces/IRandomRolls";
import { TavernTable } from "@/types/tables/TavernTable";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const tavernTable = new TavernTable();
const { t, locale } = useI18n();

const results = ref<RollOutcome[]>(tavernTable.roll());

const reroll = () => {
  results.value = tavernTable.roll();
};

const translate = (value: LocalizedText | null | undefined): string => {
  return (
    resolveLocalizedText(value ?? null, {
      t,
      locale: locale.value,
    }) ?? ""
  );
};

const tavernName = computed(() => {
  const nameEntries = results.value.filter(
    (entry) =>
      entry.result &&
      (entry.meta?.category === "name-prefix" ||
        entry.meta?.category === "name-noun"),
  );

  if (!nameEntries.length) {
    return "";
  }

  const parts: string[] = [];

  nameEntries.forEach((entry, index) => {
    let text = translate(entry.result ?? null);
    if (!text) {
      return;
    }

    if (entry.meta?.articleStrategy === "zum-zur" && locale.value === "de") {
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
      entry.meta?.category !== "name-prefix" &&
      entry.meta?.category !== "name-noun" &&
      entry.meta?.tableKey !== "tavern",
  ),
);
</script>

<template>
  <section class="codex-card codex-card--table">
    <div
      class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3"
    >
      <h3 class="codex-card-title mb-0">
        {{ t("tables.tavern.currentSpread") }}
      </h3>
      <button type="button" class="codex-button" @click="reroll">
        {{ t("buttons.reroll") }}
      </button>
    </div>

    <ul class="codex-table-results mb-3">
      <li class="codex-table-result">
        <span class="codex-table-label">
          {{ t("tables.tavern.nameLabel") }}
        </span>
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
          {{ translate(result.description ?? null) }}
        </span>
        <span class="codex-table-value">
          {{ translate(result.result ?? null) }}
        </span>
      </li>
    </ul>
  </section>
</template>
