<template>
  <div class="popup-shell">
    <main class="popup-main">
      <RouterView />
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
</script>
