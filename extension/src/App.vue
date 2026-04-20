<template>
  <div class="panel-shell">
    <main class="panel-main">
      <RouterView v-slot="{ Component }">
        <Transition name="view-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
</script>

<style scoped>
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out;
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
