<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "@/components/HelloWorld.vue";
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/" class="btn btn-primary">Home</RouterLink>
        <RouterLink to="/about" class="btn btn-secondary">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style></style>
