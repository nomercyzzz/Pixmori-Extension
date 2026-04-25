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
  >
    <span class="coins-balance-icon" aria-hidden="true">
      <img class="coins-balance-icon-image" :src="iconCoin" alt="" draggable="false" />
    </span>
    <span class="coins-balance-value">{{ amount }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import iconCoin from '../assets/icons/coin.svg'

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

const coinsLabel = computed(() => `${props.amount} ${props.label}`.trim())

function handleClick() {
  if (!props.interactive) {
    return
  }

  emit('click')
}
</script>

<style scoped>
.coins-balance {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  background: var(--bg-card);
  padding: 9px 14px 9px 12px;
  box-shadow: none;
  transition:
    transform var(--ease),
    border-color var(--ease),
    box-shadow var(--ease),
    background var(--ease),
    color var(--ease);
}

.coins-balance-interactive {
  cursor: pointer;
}

.coins-balance:hover {
  transform: translateY(-3px);
  background: var(--accent-soft);
  border-color: var(--accent-soft);
  box-shadow: 0 10px 20px rgba(31, 31, 31, 0.08);
  opacity: 1;
}

.coins-balance-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.coins-balance-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.coins-balance-value {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-main);
  font-weight: 600;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
</style>
