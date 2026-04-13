<template>
  <nav class="bottom-nav" aria-label="Навигация">
    <button
      class="nav-btn"
      :class="{ 'nav-btn-active': !settingsSelected && route.path === '/' }"
      type="button"
      @click="goTo('/')"
    >
      Главная
    </button>

    <button
      class="nav-btn"
      :class="{ 'nav-btn-active': !settingsSelected && route.path === '/goal' }"
      type="button"
      @click="goTo('/goal')"
    >
      Цель
    </button>

    <button
      class="nav-btn"
      :class="{ 'nav-btn-active': settingsSelected }"
      type="button"
      @click="activateSettings"
    >
      Настройки
    </button>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const settingsSelected = ref(false)

function goTo(path) {
  settingsSelected.value = false

  if (route.path === path) {
    return
  }

  router.push(path)
}

function activateSettings() {
  settingsSelected.value = true
}
</script>

<style scoped>
.bottom-nav {
  margin: 0 6px 6px;
  border: 1px solid #2a2a2a;
  border-radius: 11px;
  background: #101010;
  padding: 4px;
  display: flex;
  gap: 4px;
}

.nav-btn {
  flex: 1;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #a9a9a9;
  font-size: 10px;
  min-height: 36px;
  transition: all 0.4s ease-in-out;
}

.nav-btn-active {
  background: #ffffff;
  border-color: #ffffff;
  color: #090909;
}
</style>
