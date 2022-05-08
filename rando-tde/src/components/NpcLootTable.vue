<template>
  <div>
  <button @click="reroll()">Neu auswürfeln</button>
    <div v-for="result in table.value" :key="result.description">
      <p>
        <div class="fw-bold">{{ result.description }}</div>
        <div>{{ result.result }}</div>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NpcLootTable } from "@/types/NpcLootTable";
import { ref } from "vue";

const npcLootTable = new NpcLootTable();

const table = ref({value: npcLootTable.roll()})

const reroll = () => {
  table.value = ref(npcLootTable.roll());
};

</script>

<style scoped></style>
