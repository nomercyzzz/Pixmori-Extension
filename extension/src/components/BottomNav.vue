<template>
  <nav class="bottom-nav" aria-label="Навигация">
    <span class="nav-indicator" :style="indicatorStyle" aria-hidden="true"></span>

    <button
      v-for="(item, index) in items"
      :key="item.path"
      type="button"
      class="nav-btn"
      :class="{ 'nav-btn-active': activeIndex === index }"
      :aria-label="item.label"
      :title="item.label"
      @click="goTo(item.path)"
    >
      <span class="nav-icon" aria-hidden="true">
        <span class="nav-icon-shape" :style="getIconStyle(item, index)"></span>
      </span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import iconGoal from '../assets/icons/goal.svg'
import iconHome from '../assets/icons/home.svg'
import iconPet from '../assets/icons/pet.svg'
import iconSettings from '../assets/icons/setting.svg'
import iconShop from '../assets/icons/shop.svg'

const INACTIVE_ICON_COLOR = 'var(--text-muted)'
const ACTIVE_ICON_COLOR = 'var(--accent-deep)'

const items = [
  { path: '/', label: 'Главная', icon: iconHome },
  { path: '/goal', label: 'Цели', icon: iconGoal },
  { path: '/pet', label: 'Питомец', icon: iconPet },
  { path: '/shop', label: 'Магазин', icon: iconShop },
  { path: '/settings', label: 'Настройки', icon: iconSettings }
]

const route = useRoute()
const router = useRouter()

const activeIndex = computed(() => {
  const idx = items.findIndex((item) => {
    if (item.path === '/') return route.path === '/'
    return route.path === item.path || route.path.startsWith(`${item.path}/`)
  })

  return idx === -1 ? 0 : idx
})

const indicatorStyle = computed(() => ({
  transform: `translateX(calc(${activeIndex.value} * 100%))`,
  background: 'var(--accent-soft)'
}))

function getIconStyle(item, index) {
  return {
    '--icon-url': `url("${item.icon}")`,
    backgroundColor: activeIndex.value === index ? ACTIVE_ICON_COLOR : INACTIVE_ICON_COLOR
  }
}

function goTo(path) {
  if (route.path === path) return
  router.push(path)
}
</script>

<style scoped>
.bottom-nav {
  position: relative;
  flex-shrink: 0;
  width: 100%;
  height: 64px;
  padding: 8px;
  display: flex;
  gap: 0;
  background: var(--bg-card);
  border-top: 1px solid var(--border-soft);
}

.nav-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  width: calc((100% - 16px) / 5);
  height: 48px;
  border-radius: 14px;
  transition: transform var(--ease), background-color var(--ease), background var(--ease);
  pointer-events: none;
}

.nav-btn {
  position: relative;
  z-index: 1;
  flex: 1;
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform var(--ease);
}

.nav-btn:hover {
  opacity: 1;
}

.nav-btn:active {
  transform: scale(0.94);
}

.nav-icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  transition: transform var(--ease);
}

.nav-btn:hover .nav-icon {
  transform: scale(1.12) translateY(-1px);
}

.nav-btn-active .nav-icon {
  transform: scale(1.05);
}

.nav-icon-shape {
  width: 28px;
  height: 28px;
  display: block;
  background-color: var(--text-muted);
  -webkit-mask-image: var(--icon-url);
  mask-image: var(--icon-url);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
  opacity: 0.96;
  transition: background-color var(--ease), opacity var(--ease), transform var(--ease);
}

.nav-btn:hover .nav-icon-shape,
.nav-btn-active .nav-icon-shape {
  opacity: 1;
}
</style>
