<template>
  <div class="health-bar" :aria-label="ariaLabel">
    <div class="health-meta">
      <span class="health-heart" aria-hidden="true">
        <img :src="iconHeart" alt="" draggable="false" />
      </span>
      <span class="health-label">{{ label }}</span>
      <span class="health-value">{{ normalizedValue }}%</span>
    </div>

    <div class="health-track">
      <div class="health-fill" :style="{ width: `${normalizedValue}%` }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import iconHeart from '../assets/icons/лайк-с-заливкой.svg'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: 'Здоровье'
  }
})

const normalizedValue = computed(() => {
  const rawValue = Number.isFinite(props.value) ? props.value : 0
  return Math.max(0, Math.min(100, Math.round(rawValue)))
})

const ariaLabel = computed(() => `${props.label} ${normalizedValue.value}%`)
</script>

<style scoped>
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
</style>
