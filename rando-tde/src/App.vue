<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/" class="btn btn-primary">Home</RouterLink>
        <RouterLink to="/npcloot" class="btn btn-primary">Beute: NSC</RouterLink>
        <RouterLink to="/treasureloot" class="btn btn-primary">Beute: Schatz</RouterLink>
        <RouterLink to="/about" class="btn btn-primary">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style></style>
