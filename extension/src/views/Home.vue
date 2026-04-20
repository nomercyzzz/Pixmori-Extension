<template>
  <section class="home-page">
    <header class="top-row page-block page-block-1">
      <p class="brand">Pixmore</p>
      <div
        class="coins-box"
        aria-label="20 монет"
        @mouseenter="playCoinsHoverAnimation"
        @mouseleave="stopCoinsHoverAnimation"
      >
        <span class="coins-icon" aria-hidden="true">
          <img
            class="coins-icon-img"
            :src="coinsAnimationPlaying ? iconCoinsAnim : iconCoinsStatic"
            alt=""
            draggable="false"
          />
        </span>
        <span class="coins-value">20</span>
        <span class="coins-label">монет</span>
      </div>
    </header>

    <div class="pet-zone page-block page-block-2">
      <PetDisplay :active="store.petActive" />

      <div class="health-bar" :aria-label="`Здоровье ${store.petHealth}%`">
        <div class="health-meta">
          <span class="health-heart" aria-hidden="true">
            <img :src="iconHeart" alt="" draggable="false" />
          </span>
          <span class="health-label">Здоровье</span>
          <span class="health-value">{{ store.petHealth }}%</span>
        </div>
        <div class="health-track">
          <div class="health-fill" :style="{ width: `${store.petHealth}%` }"></div>
        </div>
      </div>
    </div>

    <div class="action-zone page-block page-block-3">
      <button class="toggle-btn" :class="buttonModeClass" type="button" @click="togglePet">
        <span class="toggle-btn-text">{{ toggleButtonText }}</span>
      </button>

      <article class="goal-mini">
        <p class="goal-mini-label">Текущая цель</p>
        <p class="goal-mini-title">{{ store.selectedGoal.title }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import PetDisplay from '../components/PetDisplay.vue'
import { useAppStore } from '../stores/appStore'
import iconCoinsStatic from '../assets/icons/стопка-монет.svg'
import iconCoinsAnim from '../assets/icons/стопка-монет-96.apng.png'
import iconHeart from '../assets/icons/лайк-с-заливкой.svg'

const store = useAppStore()
const COINS_ANIMATION_MS = 1148
const coinsAnimationPlaying = ref(false)
let coinsAnimationTimerId = null

const toggleButtonText = computed(() => (store.petActive ? 'Стоп' : 'Старт'))

const buttonModeClass = computed(() =>
  store.petActive ? 'toggle-btn-stop' : 'toggle-btn-start'
)

async function togglePet() {
  if (store.petActive) {
    await store.stopPet()
    return
  }

  await store.startPet()
}

function playCoinsHoverAnimation() {
  if (coinsAnimationTimerId !== null) {
    clearTimeout(coinsAnimationTimerId)
  }

  coinsAnimationPlaying.value = true
  coinsAnimationTimerId = window.setTimeout(() => {
    coinsAnimationPlaying.value = false
    coinsAnimationTimerId = null
  }, COINS_ANIMATION_MS)
}

function stopCoinsHoverAnimation() {
  if (coinsAnimationTimerId !== null) {
    clearTimeout(coinsAnimationTimerId)
    coinsAnimationTimerId = null
  }

  coinsAnimationPlaying.value = false
}

onBeforeUnmount(() => {
  if (coinsAnimationTimerId !== null) {
    clearTimeout(coinsAnimationTimerId)
  }
})
</script>

<style scoped>
.home-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

.page-block {
  opacity: 0;
  transform: translateY(14px);
  animation: block-drop 0.42s ease-in-out forwards;
}

.page-block-1 {
  animation-delay: 0.04s;
}

.page-block-2 {
  animation-delay: 0.12s;
}

.page-block-3 {
  animation-delay: 0.2s;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 2px 0;
}

.brand {
  margin: 0;
  font-family: var(--font-pixel);
  font-size: 16px;
  letter-spacing: 0.04em;
  color: var(--text-main);
}

.coins-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  background: var(--bg-card);
  padding: 8px 18px 8px 14px;
  transition: transform var(--ease), border-color var(--ease);
}

.coins-box:hover {
  transform: translateY(-1px);
  border-color: var(--text-muted);
}

.coins-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.coins-icon-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.coins-value {
  font-size: 15px;
  color: var(--text-main);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.coins-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.pet-zone {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 80px;
  min-height: 0;
}

.health-bar {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  cursor: default;
}

.health-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.health-heart {
  display: inline-flex;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  transition: transform 0.4s ease;
  transform-origin: center;
}

.health-heart img {
  width: 100%;
  height: 100%;
  display: block;
}

.health-bar:hover .health-heart {
  animation: heart-pulse 0.8s ease-in-out;
}

.health-label {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
  flex: 1;
}

.health-value {
  font-size: 14px;
  color: var(--text-main);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.health-track {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: var(--border-soft);
  overflow: hidden;
}

.health-fill {
  height: 100%;
  background-image:
    linear-gradient(90deg, rgba(111, 126, 242, 0.84) 0%, rgba(132, 145, 248, 0.92) 28%, rgba(98, 113, 229, 0.86) 52%, rgba(141, 153, 249, 0.9) 76%, rgba(111, 126, 242, 0.84) 100%),
    radial-gradient(circle at 18% 50%, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.05) 16%, transparent 36%),
    radial-gradient(circle at 82% 50%, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.04) 14%, transparent 34%);
  background-size: 220% 100%, 170% 100%, 190% 100%;
  background-position: 0% 50%, 0% 50%, 100% 50%;
  border-radius: inherit;
  transition: width 0.4s ease-in-out;
  animation: health-flow 5.6s ease-in-out infinite alternate;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.action-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 36px;
  margin-top: 16px;
  padding-bottom: 4px;
  flex-shrink: 0;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 300px;
  min-height: 60px;
  padding: 22px 18px 12px 20px;
  border-radius: 14px;
  font-family: var(--font-pixel);
  font-size: 18px;
  letter-spacing: 0.04em;
  border: 1px solid transparent;
  transition: transform var(--ease), box-shadow var(--ease), border-color var(--ease), background var(--ease), color var(--ease);
  box-shadow: 0 2px 0 rgba(31, 31, 31, 0.04);
}

.toggle-btn-text {
  display: block;
  transform: translateY(-1px);
}

.toggle-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(31, 31, 31, 0.08);
  opacity: 1;
}

.toggle-btn-start {
  background: var(--accent);
  color: #FBFAF7;
  border-color: var(--accent);
}

.toggle-btn-start:hover {
  background: var(--accent-deep);
  border-color: var(--accent-deep);
}

.toggle-btn-stop {
  background: var(--bg-card);
  color: var(--text-main);
  border-color: var(--border-soft);
}

.toggle-btn-stop:hover {
  background: var(--accent-soft);
  border-color: var(--accent-soft);
}

.goal-mini {
  width: 100%;
  max-width: 300px;
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  background: var(--bg-card);
  padding: 10px 14px;
  text-align: center;
  overflow: hidden;
  transition: transform var(--ease), box-shadow var(--ease), border-color var(--ease), background var(--ease);
}

.goal-mini:hover {
  transform: translateY(-3px);
  border-color: var(--text-muted);
  box-shadow: 0 10px 20px rgba(31, 31, 31, 0.06);
}

.goal-mini-label {
  margin: 0 0 3px;
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
}

.goal-mini-title {
  margin: 0;
  color: var(--text-main);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
}

@keyframes heart-pulse {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  20% {
    transform: scale(1.25) rotate(-10deg);
  }
  45% {
    transform: scale(1.1) rotate(8deg);
  }
  70% {
    transform: scale(1.18) rotate(-4deg);
  }
}

@keyframes health-flow {
  from {
    background-position: 0% 50%, 0% 50%, 100% 50%;
  }
  to {
    background-position: 100% 50%, 100% 50%, 0% 50%;
  }
}

@keyframes block-drop {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
