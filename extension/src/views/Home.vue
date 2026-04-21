<template>
  <section class="home-page">
    <header class="top-row page-block page-block-1">
      <p class="brand">Pixmore</p>
      <CoinsBalance :amount="20" interactive @click="goToShop" />
    </header>

    <div class="pet-zone page-block page-block-2">
      <div class="pet-stage">
        <PetDisplay :active="store.petActive" />
      </div>

      <HealthBar :value="store.petHealth" />
    </div>

    <div class="action-zone page-block page-block-3">
      <button class="toggle-btn" :class="buttonModeClass" type="button" @click="togglePet">
        <span class="toggle-btn-text">{{ toggleButtonText }}</span>
      </button>

      <article
        class="goal-mini"
        role="button"
        tabindex="0"
        @click="goToGoal"
        @keydown.enter.prevent="goToGoal"
        @keydown.space.prevent="goToGoal"
      >
        <p class="goal-mini-label">Текущая цель</p>
        <p class="goal-mini-title">{{ store.selectedGoal.title }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import CoinsBalance from '../components/CoinsBalance.vue'
import HealthBar from '../components/HealthBar.vue'
import PetDisplay from '../components/PetDisplay.vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()
const router = useRouter()

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

function goToShop() {
  router.push({ name: 'shop' })
}

function goToGoal() {
  router.push({ name: 'goal' })
}
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

.pet-stage {
  position: relative;
  width: 100%;
  min-height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.pet-stage :deep(.pet-frame) {
  position: relative;
  z-index: 1;
}

.action-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 36px;
  margin-top: 36px;
  padding-bottom: 4px;
  flex-shrink: 0;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 80px;
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
  cursor: pointer;
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
