<template>
  <div class="pet-wrap" :class="`mood-${mood}`">
    <div class="cat-box">
      <img class="cat-sprite" :src="catSprite" alt="Белый пиксельный котик" />

      <div v-if="mood === 'default' || mood === 'sleeping'" class="eyes-layer" aria-hidden="true">
        <span class="eye eye-left"></span>
        <span class="eye eye-right"></span>
      </div>

      <div v-if="mood === 'sleeping'" class="sleep-z" aria-hidden="true">
        <span class="z z-1">Z</span>
        <span class="z z-2">Z</span>
        <span class="z z-3">Z</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import catSprite from '../assets/pet-cat.svg'

defineProps({
  mood: {
    type: String,
    default: 'default'
  }
})
</script>

<style scoped>
.pet-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cat-box {
  position: relative;
  width: 224px;
  height: 124px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pet-appear 0.4s ease-in-out;
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
}

.cat-sprite {
  width: 100%;
  height: auto;
  image-rendering: pixelated;
  filter: drop-shadow(0 8px 10px rgba(255, 255, 255, 0.08));
}

.eyes-layer {
  position: absolute;
  inset: 0;
}

.eye {
  position: absolute;
  width: 18px;
  height: 10px;
  background: #101010;
  transform: translateX(-50%);
  transform-origin: center center;
  animation: eye-blink 3.6s steps(1, end) infinite;
}

.eye-left {
  left: 64%;
  top: 74px;
}

.eye-right {
  left: 82%;
  top: 74px;
}

.sleep-z {
  position: absolute;
  right: 14px;
  top: -8px;
  display: flex;
  gap: 2px;
  pointer-events: none;
}

.z {
  color: #ffffff;
  font-size: 17px;
  font-weight: 700;
  line-height: 1;
  opacity: 0;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.45);
  animation: z-float 1.8s ease-in-out infinite;
}

.z-2 {
  animation-delay: 0.2s;
}

.z-3 {
  animation-delay: 0.4s;
}

.mood-sleeping .cat-box {
  opacity: 0.92;
  animation: pet-breathe-sleep 2.8s ease-in-out infinite;
}

.mood-sleeping .eye {
  height: 4px;
  animation: none;
}

.mood-default .cat-box {
  opacity: 1;
  animation: pet-breathe-awake 2.4s ease-in-out infinite;
}

@keyframes pet-appear {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pet-breathe-sleep {
  0%,
  100% {
    transform: translateY(2px) scale(0.985);
  }

  50% {
    transform: translateY(0) scale(0.99);
  }
}

@keyframes pet-breathe-awake {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-2px) scale(1.01);
  }
}

@keyframes eye-blink {
  0%,
  90%,
  100% {
    transform: translateX(-50%) scaleY(1);
  }

  93% {
    transform: translateX(-50%) scaleY(0.2);
  }
}

@keyframes z-float {
  0% {
    opacity: 0;
    transform: translate(0, 5px);
  }

  35% {
    opacity: 0.92;
  }

  100% {
    opacity: 0;
    transform: translate(10px, -7px);
  }
}
</style>
