<template>
  <section class="aventuria-section loot-view">
    <header class="aventuria-section-header">
      <h1 class="aventuria-section-title">
        {{ t("views.loot.title") }}
      </h1>
      <p class="aventuria-section-intro">
        {{ activeTab === 'npc' ? t("views.npcLoot.intro") : t("views.treasureLoot.intro") }}
      </p>
    </header>

    <nav class="loot-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        class="loot-tabs__button"
        :class="{ 'loot-tabs__button--active': activeTab === 'npc' }"
        :aria-selected="activeTab === 'npc'"
        @click="activeTab = 'npc'"
      >
        {{ t("views.loot.tabs.npc") }}
      </button>
      <button
        type="button"
        role="tab"
        class="loot-tabs__button"
        :class="{ 'loot-tabs__button--active': activeTab === 'treasure' }"
        :aria-selected="activeTab === 'treasure'"
        @click="activeTab = 'treasure'"
      >
        {{ t("views.loot.tabs.treasure") }}
      </button>
    </nav>

    <div v-if="activeTab === 'npc'" class="loot-panel">
      <NpcLootTable />
    </div>

    <div v-else class="loot-panel">
      <TreasureLootTable />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import NpcLootTable from "../components/NpcLootTable.vue";
import TreasureLootTable from "../components/TreasureLootTable.vue";

const { t } = useI18n();

const activeTab = ref<"npc" | "treasure">("npc");
</script>

<style scoped>
.loot-view {
  display: grid;
  gap: clamp(1.5rem, 2vw, 2.5rem);
}

.loot-tabs {
  display: inline-flex;
  gap: 0.5rem;
  margin-bottom: clamp(0.25rem, 0.6vw, 0.4rem);
}

.loot-tabs__button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1.3rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--aventuria-text-muted);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  transition: all 160ms ease;
  border: 1px solid transparent;
  cursor: pointer;
}

.loot-tabs__button:hover,
.loot-tabs__button:focus-visible {
  color: var(--aventuria-text);
  border-color: rgba(197, 143, 45, 0.5);
  background: rgba(197, 143, 45, 0.12);
}

.loot-tabs__button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(197, 143, 45, 0.18);
}

.loot-tabs__button--active {
  color: var(--aventuria-text);
  border-color: var(--aventuria-border-strong);
  background: linear-gradient(
    135deg,
    rgba(197, 143, 45, 0.35),
    rgba(197, 143, 45, 0.15)
  );
  box-shadow: 0 6px 18px rgba(197, 143, 45, 0.2);
}

.loot-panel {
  display: grid;
  gap: clamp(1.5rem, 2vw, 2rem);
}
</style>
