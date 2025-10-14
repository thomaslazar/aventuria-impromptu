<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

const { t } = useI18n();

interface FeatureConfig {
  translationKey: string;
  to: string;
}

const features: FeatureConfig[] = [
  { translationKey: "home.features.tavern", to: "/tavern" },
  { translationKey: "home.features.npcLoot", to: "/npcloot" },
  { translationKey: "home.features.treasureLoot", to: "/treasureloot" },
];
</script>

<template>
  <div class="codex-home">
    <section class="codex-card codex-hero">
      <div>
        <h1 class="codex-hero-title">
          {{ t("home.hero.title") }}
        </h1>
        <p class="codex-hero-text">
          {{ t("home.hero.intro") }}
        </p>
      </div>
      <div class="codex-hero-actions">
        <RouterLink to="/tavern" class="codex-button">
          {{ t("buttons.heroPrimary") }}
        </RouterLink>
        <RouterLink to="/about" class="codex-button codex-button--ghost">
          {{ t("buttons.heroSecondary") }}
        </RouterLink>
      </div>
    </section>

    <section class="codex-grid">
      <article
        v-for="feature in features"
        :key="feature.to"
        class="codex-card codex-card--table"
      >
        <h2 class="codex-card-title">
          {{ t(`${feature.translationKey}.title`) }}
        </h2>
        <p>{{ t(`${feature.translationKey}.description`) }}</p>
        <RouterLink :to="feature.to" class="codex-link">
          {{ t(`${feature.translationKey}.cta`) }}
        </RouterLink>
      </article>
    </section>
  </div>
</template>
