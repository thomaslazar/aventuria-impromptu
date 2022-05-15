<template>
  <div>
    <div><button @click="reroll()" class="btn btn-secondary">Neu auswürfeln</button></div>
    <span v-for="result in table.value" :key="result.description != null ? result.description : undefined">
      <div v-if="result.description" />
      <span class="fw-bold" v-if="result.description">{{ result.description }}: </span>
      <span>{{ result.result }}&nbsp;</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { NpcLootTable } from "@/types/tables/NpcLootTable";
import { ref } from "vue";

const npcLootTable = new NpcLootTable();

const table = ref({ value: npcLootTable.roll() });

const reroll = () => {
  table.value = ref(npcLootTable.roll());
};
</script>

<style scoped></style>
