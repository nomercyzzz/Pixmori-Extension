<template>
  <div
    class="coins-balance"
    :class="{ 'coins-balance-interactive': interactive }"
    :aria-label="coinsLabel"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
    @mouseenter="playCoinsHoverAnimation"
    @mouseleave="stopCoinsHoverAnimation"
  >
    <span class="coins-balance-icon" aria-hidden="true">
      <img
        class="coins-balance-image"
        :src="coinsAnimationPlaying ? iconCoinsAnim : iconCoinsStatic"
        alt=""
        draggable="false"
      />
    </span>

    <span class="coins-balance-value">{{ amount }}</span>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import iconCoinsStatic from '../assets/icons/стопка-монет.svg'
import iconCoinsAnim from '../assets/icons/стопка-монет-96.apng.png'

const props = defineProps({
  amount: {
    type: [Number, String],
    default: 0
  },
  label: {
    type: String,
    default: 'монет'
  },
  interactive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const COINS_ANIMATION_MS = 1148
const coinsAnimationPlaying = ref(false)
let coinsAnimationTimerId = null

const coinsLabel = computed(() => `${props.amount} ${props.label}`.trim())

function handleClick() {
  if (!props.interactive) {
    return
  }

  emit('click')
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
.coins-balance {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-soft);
  border-radius: 9999999px;
  background: var(--bg-card);
  padding: 8px 18px 8px 14px;
  transition: transform var(--ease), border-color var(--ease);
}

.coins-balance-interactive {
  cursor: pointer;
}

.coins-balance:hover {
  transform: translateY(-1px);
  border-color: var(--text-muted);
}

.coins-balance-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.coins-balance-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.coins-balance-value {
  font-size: 15px;
  color: var(--text-main);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
