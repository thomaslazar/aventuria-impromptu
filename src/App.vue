<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();
const title = "Aventuria Impromptu";
const currentYear = new Date().getFullYear();

const navigationItems = [
  { to: "/", label: "Start", exact: true },
  { to: "/tavern", label: "Taverne" },
  { to: "/npcloot", label: "Beute: NSC" },
  { to: "/treasureloot", label: "Beute: Schatz" },
  { to: "/about", label: "About" },
];

const isActive = (to: string, exact?: boolean) => {
  if (exact) {
    return route.path === to;
  }
  return route.path.startsWith(to);
};
</script>

<template>
  <div class="codex-app">
    <header class="codex-header container-xl">
      <RouterLink :to="{ path: '/' }" class="codex-brand">
        {{ title }}
      </RouterLink>
      <p class="codex-tagline">
        Werkzeuge, Tabellen und Inspirationen für Aventuriens Spielleitung.
      </p>
    </header>

    <nav class="codex-nav container-xl" aria-label="Hauptnavigation">
      <RouterLink
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        class="codex-nav-link"
        :class="{ 'is-active': isActive(item.to, item.exact) }"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <main class="codex-main">
      <div class="container-xl">
        <RouterView />
      </div>
    </main>

    <footer class="codex-footer">
      © {{ currentYear }} Aventuria Impromptu. Inspiriert von
      <span class="fw-semibold">Das Schwarze Auge</span>.
    </footer>
  </div>
</template>
