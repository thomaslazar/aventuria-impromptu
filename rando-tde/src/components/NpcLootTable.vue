<template>
  <div>{{ NpcLootTableResult }}</div>
</template>

<script setup lang="ts">
import { NpcLootTable } from "@/types/NpcLootTable";

const NpcLootTableResult = new NpcLootTable().roll();
</script>

<style scoped></style>
