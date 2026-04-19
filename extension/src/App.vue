<template>
  <div class="panel-shell">
    <main class="panel-main">
      <RouterView />
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
</script>
