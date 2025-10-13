<script setup lang="ts">
import { RouterLink } from "vue-router";

const features = [
  {
    title: "Gaststuben auf Zuruf",
    description:
      "Fülle jede Taverne mit Leben: improvisierte Barkeeper, raue Gäste und Gerüchte für spontane Spielabende.",
    to: "/tavern",
    cta: "Zu den Tavernenwürfen",
  },
  {
    title: "Beute für NSC",
    description:
      "Schnelles Loot für gefasste Räuber, besiegte Schergen oder neugierige Streuner – jederzeit Aventurien-konform.",
    to: "/npcloot",
    cta: "NSC-Beute generieren",
  },
  {
    title: "Schatzkisten & Verstecke",
    description:
      "Geheime Lagerhäuser, Drachenhorte oder verfallene Tempel – würfle passende Schätze samt Flair.",
    to: "/treasureloot",
    cta: "Schätze entdecken",
  },
];
</script>

<template>
  <div class="codex-home">
    <section class="codex-card codex-hero">
      <div>
        <h1 class="codex-hero-title">Dein Aventurischer Werkstattkoffer</h1>
        <p class="codex-hero-text">
          Rando TDE hilft dir, Begegnungen, Fundstücke und Tavernen aus dem
          Ärmel zu schütteln. Bleib im Spielfluss – ganz ohne Tabellen wälzen.
        </p>
      </div>
      <div class="codex-hero-actions">
        <RouterLink to="/tavern" class="codex-button">
          Jetzt würfeln
        </RouterLink>
        <RouterLink to="/about" class="codex-button codex-button--ghost">
          Projektinfos
        </RouterLink>
      </div>
    </section>

    <section class="codex-grid">
      <article
        v-for="feature in features"
        :key="feature.to"
        class="codex-card codex-card--surface"
      >
        <h2 class="codex-card-title">{{ feature.title }}</h2>
        <p>{{ feature.description }}</p>
        <RouterLink :to="feature.to" class="codex-link">
          {{ feature.cta }}
        </RouterLink>
      </article>
    </section>
  </div>
</template>
