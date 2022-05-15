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
import { TreasureLootTable } from "@/types/tables/TreasureLootTable";
import { ref } from "vue";

const treasureLootTable = new TreasureLootTable();

const table = ref({ value: treasureLootTable.roll() });

const reroll = () => {
  table.value = ref(treasureLootTable.roll());
};
</script>

<style scoped></style>
