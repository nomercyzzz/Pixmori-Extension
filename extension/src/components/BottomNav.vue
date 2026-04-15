<template>
  <nav class="bottom-nav" :style="{ '--nav-index': activeIndex }" aria-label="Навигация">
    <span class="nav-indicator" aria-hidden="true"></span>

    <button
      class="nav-btn"
      :class="{ 'nav-btn-active': activeIndex === 0 }"
      type="button"
      @click="goTo('/')"
    >
      Главная
    </button>

    <button
      class="nav-btn"
      :class="{ 'nav-btn-active': activeIndex === 1 }"
      type="button"
      @click="goTo('/goal')"
    >
      Цель
    </button>

    <button
      class="nav-btn"
      :class="{ 'nav-btn-active': activeIndex === 2 }"
      type="button"
      @click="goTo('/more')"
    >
      Еще
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeIndex = computed(() => {
  if (route.path === '/goal') {
    return 1
  }

  if (route.path.startsWith('/more')) {
    return 2
  }

  return 0
})

function goTo(path) {
  if (route.path === path) {
    return
  }

  router.push(path)
}
</script>

<style scoped>
.bottom-nav {
  position: relative;
  margin: 0 6px 6px;
  border: 1px solid #2a2a2a;
  border-radius: 11px;
  background: #101010;
  padding: 4px;
  display: flex;
  gap: 4px;
  overflow: hidden;
}

.nav-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 16px) / 3);
  border-radius: 8px;
  background: #ffffff;
  transition: transform 0.34s ease-in-out;
  transform: translateX(calc(var(--nav-index) * (100% + 4px)));
}

.nav-btn {
  position: relative;
  z-index: 1;
  flex: 1;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #a9a9a9;
  font-size: 10px;
  min-height: 36px;
  transition: color 0.34s ease-in-out, opacity 0.34s ease-in-out;
}

.nav-btn-active {
  color: #090909;
}
</style>
