<template>
  <section class="home-page">
    <header class="top-row page-block page-block-1">
      <p class="brand">Pixmore</p>
      <div class="coins-box">
        <span class="coins-label">Мори</span>
        <span class="coins-value">20</span>
      </div>
    </header>

    <div class="pet-zone page-block page-block-2">
      <PetDisplay :mood="store.petMood" />
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
import { computed } from 'vue'
import PetDisplay from '../components/PetDisplay.vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()

const isSleeping = computed(() => store.petMood === 'sleeping')

const toggleButtonText = computed(() => (isSleeping.value ? 'Старт' : 'Стоп'))

const buttonModeClass = computed(() =>
  isSleeping.value ? 'toggle-btn-start' : 'toggle-btn-stop'
)

async function togglePet() {
  if (isSleeping.value) {
    await store.startPet()
    return
  }

  await store.stopPet()
}
</script>

<style scoped>
.home-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-block {
  opacity: 0;
  transform: translateY(14px);
  animation: block-drop 0.42s ease-out forwards;
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
}

.brand {
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.015em;
}

.coins-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px solid #353535;
  border-radius: 9px;
  background: #111111;
  padding: 8px 8px 4px 10px;
}

.coins-label {
  font-size: 10px;
  color: #9d9d9d;
  text-transform: none;
  letter-spacing: 0;
}

.coins-value {
  font-size: 10px;
  color: #f3f3f3;
  font-weight: 600;
}

.pet-zone {
  margin-top: 64px;
}

.action-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 14px;
  margin-top: 36px;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 160px;
  padding: 8px 8px 0 18px;
  margin-top: 0;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #3a3a3a;
  transition: all 0.4s ease-in-out;
}

.toggle-btn-text {
  display: block;
  transform: translateY(-1px);
}

.toggle-btn-start {
  background: #ffffff;
  color: #090909;
}

.toggle-btn-start:hover {
  opacity: 0.9;
}

.toggle-btn-stop {
  color: #f6f6f6;
}

.toggle-btn-stop:hover {
  border-color: #f6f6f6;
  background: #181818;
}

.goal-mini {
  width: fit-content;
  min-width: 200px;
  margin-top: 0;
  border: 1px solid #2b2b2b;
  border-radius: 11px;
  background: #101010;
  padding: 8px 12px;
  text-align: center;
  overflow: hidden;
}

.goal-mini-label {
  margin-bottom: 4px;
  color: #a6a6a6;
  font-size: 8px;
}

.goal-mini-title {
  color: #fafafa;
  font-size: 10px;
  font-weight: 600;
  line-height: 2;
  padding: 1px 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 3.5em;
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