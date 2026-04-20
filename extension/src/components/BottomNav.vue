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
      @mouseenter="playHoverAnimation(index)"
      @mouseleave="stopHoverAnimation(index)"
    >
      <span class="nav-icon" aria-hidden="true">
        <img class="nav-icon-img" :src="animatedIndex === index ? item.iconAnim : item.iconStatic" alt="" draggable="false" />
      </span>
    </button>
  </nav>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import iconHomeStatic from '../assets/icons/главная.svg'
import iconGoalStatic from '../assets/icons/goal.svg'
import iconCatStatic from '../assets/icons/кошка.svg'
import iconShopStatic from '../assets/icons/магазин.svg'
import iconSettingsStatic from '../assets/icons/setting.svg'

import iconHomeAnim from '../assets/icons/главная-96.apng.png'
import iconGoalAnim from '../assets/icons/goal-96.apng.png'
import iconCatAnim from '../assets/icons/кошка-80.apng.png'
import iconShopAnim from '../assets/icons/магазин.apng.png'
import iconSettingsAnim from '../assets/icons/setting-96.apng.png'

const items = [
  { path: '/', label: 'Главная', iconStatic: iconHomeStatic, iconAnim: iconHomeAnim },
  { path: '/goal', label: 'Цель', iconStatic: iconGoalStatic, iconAnim: iconGoalAnim },
  { path: '/pet', label: 'Питомец', iconStatic: iconCatStatic, iconAnim: iconCatAnim },
  { path: '/shop', label: 'Магазин', iconStatic: iconShopStatic, iconAnim: iconShopAnim },
  { path: '/settings', label: 'Настройки', iconStatic: iconSettingsStatic, iconAnim: iconSettingsAnim }
]

const route = useRoute()
const router = useRouter()
const NAV_ICON_ANIMATION_MS = 1148
const animatedIndex = ref(-1)
let animationTimerId = null

const activeIndex = computed(() => {
  const idx = items.findIndex((item) => {
    if (item.path === '/') return route.path === '/'
    return route.path === item.path || route.path.startsWith(`${item.path}/`)
  })
  return idx === -1 ? 0 : idx
})

const indicatorStyle = computed(() => ({
  transform: `translateX(calc(${activeIndex.value} * 100%))`
}))

function playHoverAnimation(index) {
  if (animationTimerId !== null) {
    clearTimeout(animationTimerId)
  }

  animatedIndex.value = index
  animationTimerId = window.setTimeout(() => {
    if (animatedIndex.value === index) {
      animatedIndex.value = -1
    }
    animationTimerId = null
  }, NAV_ICON_ANIMATION_MS)
}

function stopHoverAnimation(index) {
  if (animatedIndex.value !== index) return

  if (animationTimerId !== null) {
    clearTimeout(animationTimerId)
    animationTimerId = null
  }

  animatedIndex.value = -1
}

function goTo(path) {
  if (route.path === path) return
  router.push(path)
}

onBeforeUnmount(() => {
  if (animationTimerId !== null) {
    clearTimeout(animationTimerId)
  }
})
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
  background: var(--accent-soft);
  transition: transform var(--ease);
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
  transition: transform 0.25s ease;
}

.nav-btn:hover .nav-icon {
  transform: scale(1.12) translateY(-1px);
}

.nav-btn-active .nav-icon {
  transform: scale(1.05);
}

.nav-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
}
</style>
