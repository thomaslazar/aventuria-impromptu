<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { SUPPORTED_LOCALES } from "@/i18n/localizedText";

const route = useRoute();
const currentYear = new Date().getFullYear();
const { t, locale } = useI18n();

const navigationItems = [
  { to: "/", labelKey: "nav.home", exact: true },
  { to: "/tavern", labelKey: "nav.tavern" },
  { to: "/npcloot", labelKey: "nav.npcLoot" },
  { to: "/treasureloot", labelKey: "nav.treasureLoot" },
  { to: "/tools/optolith-converter", labelKey: "nav.optolithConverter" },
  { to: "/about", labelKey: "nav.about" },
];

const languageOptions = SUPPORTED_LOCALES.map((code) => ({
  code,
  labelKey: `language.${code}`,
}));

const currentLocale = computed({
  get: () => locale.value,
  set: (value: string) => {
    locale.value = value;
  },
});

const isActive = (to: string, exact?: boolean) => {
  if (exact) {
    return route.path === to;
  }
  return route.path.startsWith(to);
};
</script>

<template>
  <div class="aventuria-app">
    <header class="aventuria-header container-xl">
      <RouterLink :to="{ path: '/' }" class="aventuria-brand">
        {{ t("app.title") }}
      </RouterLink>
      <p class="aventuria-tagline">
        {{ t("app.tagline") }}
      </p>
      <div class="aventuria-language-switch">
        <label class="visually-hidden" for="aventuria-language-select">
          {{ t("language.label") }}
        </label>
        <select
          id="aventuria-language-select"
          v-model="currentLocale"
          class="form-select form-select-sm aventuria-language-select"
        >
          <option
            v-for="option in languageOptions"
            :key="option.code"
            :value="option.code"
          >
            {{ t(option.labelKey) }}
          </option>
        </select>
      </div>
    </header>

    <nav class="aventuria-nav container-xl" :aria-label="t('nav.ariaLabel')">
      <RouterLink
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        class="aventuria-nav-link"
        :class="{ 'is-active': isActive(item.to, item.exact) }"
      >
        {{ t(item.labelKey) }}
      </RouterLink>
    </nav>

    <main class="aventuria-main">
      <div class="container-xl">
        <RouterView />
      </div>
    </main>

    <footer class="aventuria-footer">
      {{
        t("app.footer.copy", {
          year: currentYear,
          world: t("app.footer.world"),
        })
      }}
    </footer>
  </div>
</template>
