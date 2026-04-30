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
        :class="{ 'goal-mini-empty': !store.hasSelectedGoal }"
        role="button"
        tabindex="0"
        @click="goToGoal"
        @keydown.enter.prevent="goToGoal"
        @keydown.space.prevent="goToGoal"
      >
        <p class="goal-mini-label">текущая цель</p>
        <p class="goal-mini-title">{{ currentGoalTitle }}</p>
      </article>
    </div>

    <Transition name="alert-fade">
      <div v-if="isGoalAlertOpen" class="alert-overlay" @click.self="closeGoalAlert">
        <div class="alert-card">
          <h2 class="alert-title">сначала создайте цель</h2>
          <p class="alert-text">
            Создайте цель, чтобы начать пользоваться расширением.
          </p>

          <div class="alert-actions">
            <button type="button" class="alert-primary-btn" @click="goToGoalFromAlert">
              создать цель
            </button>
            <button type="button" class="alert-secondary-btn" @click="closeGoalAlert">
              позже
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import CoinsBalance from '../components/CoinsBalance.vue'
import HealthBar from '../components/HealthBar.vue'
import PetDisplay from '../components/PetDisplay.vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()
const router = useRouter()
const isGoalAlertOpen = ref(false)

const toggleButtonText = computed(() => (store.petActive ? 'стоп' : 'старт'))
const currentGoalTitle = computed(() => (store.selectedGoal ? store.selectedGoal.title : 'нет цели'))

const buttonModeClass = computed(() =>
  store.petActive ? 'toggle-btn-stop' : 'toggle-btn-start'
)

async function togglePet() {
  if (store.petActive) {
    await store.stopPet()
    return
  }

  if (!store.hasSelectedGoal) {
    isGoalAlertOpen.value = true
    return
  }

  await store.startPet()
}

function closeGoalAlert() {
  isGoalAlertOpen.value = false
}

function goToShop() {
  router.push({ name: 'shop' })
}

function goToGoal() {
  router.push({ name: 'goal' })
}

function goToGoalFromAlert() {
  closeGoalAlert()
  goToGoal()
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
  transition:
    transform var(--ease),
    box-shadow var(--ease),
    border-color var(--ease),
    background var(--ease),
    color var(--ease);
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
  color: #fbfaf7;
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
  transition:
    transform var(--ease),
    box-shadow var(--ease),
    border-color var(--ease),
    background var(--ease);
}

.goal-mini:hover {
  transform: translateY(-3px);
  border-color: var(--text-muted);
  box-shadow: 0 10px 20px rgba(31, 31, 31, 0.06);
}

.goal-mini-empty {
  border-style: dashed;
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

.alert-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(31, 31, 31, 0.48);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.alert-card {
  width: 100%;
  max-width: 320px;
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  background: var(--bg-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-title {
  margin: 0;
  color: var(--text-main);
  font-size: 16px;
  font-weight: 700;
}

.alert-text {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.alert-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.alert-primary-btn,
.alert-secondary-btn {
  flex: 1;
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border-soft);
  font-size: 14px;
  font-weight: 600;
  transition: all var(--ease);
}

.alert-primary-btn {
  background: var(--accent);
  border-color: var(--accent);
  color: #fbfaf7;
}

.alert-primary-btn:hover {
  background: var(--accent-deep);
  border-color: var(--accent-deep);
}

.alert-secondary-btn {
  background: var(--bg-card);
  color: var(--text-main);
}

.alert-secondary-btn:hover {
  border-color: var(--text-muted);
  transform: translateY(-1px);
}

.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.25s ease;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
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
