<template>
  <div>
    <div>
      <button @click="reroll()" class="btn btn-secondary">
        Neu auswürfeln
      </button>
    </div>
    <span
      v-for="result in table.value"
      :key="result.description != null ? result.description : undefined"
    >
      <div v-if="result.description" />
      <span class="fw-bold" v-if="result.description"
        >{{ result.description }}:
      </span>
      <span v-if="result.result">{{ result.result }}&nbsp;</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { TavernTable } from "@/types/tables/TavernTable";
import { ref } from "vue";

const tavernTable = new TavernTable();

const table = ref({ value: tavernTable.roll() });

const reroll = () => {
  table.value = ref(tavernTable.roll());
};
</script>

<style scoped></style>
