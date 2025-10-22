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
  <div class="aventuria-home">
    <section class="aventuria-card aventuria-hero">
      <div>
        <h1 class="aventuria-hero-title">
          {{ t("home.hero.title") }}
        </h1>
        <p class="aventuria-hero-text">
          {{ t("home.hero.intro") }}
        </p>
      </div>
      <div class="aventuria-hero-actions">
        <RouterLink to="/tavern" class="aventuria-button">
          {{ t("buttons.heroPrimary") }}
        </RouterLink>
        <RouterLink
          to="/about"
          class="aventuria-button aventuria-button--ghost"
        >
          {{ t("buttons.heroSecondary") }}
        </RouterLink>
      </div>
    </section>

    <section class="aventuria-grid">
      <article
        v-for="feature in features"
        :key="feature.to"
        class="aventuria-card aventuria-card--table"
      >
        <h2 class="aventuria-card-title">
          {{ t(`${feature.translationKey}.title`) }}
        </h2>
        <p>{{ t(`${feature.translationKey}.description`) }}</p>
        <RouterLink :to="feature.to" class="aventuria-link">
          {{ t(`${feature.translationKey}.cta`) }}
        </RouterLink>
      </article>
    </section>
  </div>
</template>
