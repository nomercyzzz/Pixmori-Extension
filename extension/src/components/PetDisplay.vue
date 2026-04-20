<template>
  <div class="pet-frame">
    <div class="pet-bounce" :class="{ 'pet-bounce-rest': phase === 'resting' || phase === 'idling' }">
      <img
        class="pet-stage"
        :src="currentFrame"
        alt="Питомец"
        draggable="false"
      />
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import petIdlePrimary from '../assets/pet/idle111.png'
import petIdleSecondary from '../assets/pet/idle222.png'
import petSleepy1 from '../assets/pet/sleepy1.png'
import petSleepy2 from '../assets/pet/sleepy2.png'
import petSleepy3 from '../assets/pet/sleepy3.png'

const FALL_FRAMES = [petSleepy1, petSleepy2, petSleepy3]
const WAKE_FRAMES = [petSleepy3, petSleepy2, petSleepy1, petIdlePrimary]
const IDLE_FRAMES = [petIdlePrimary, petIdleSecondary, petIdlePrimary]

const TRANSITION_FRAME_MS = 280
const IDLE_FRAME_MS = 420
const REST_MIN_MS = 2600
const REST_MAX_MS = 4200

const props = defineProps({
  active: {
    type: Boolean,
    default: false
  }
})

const phase = ref(props.active ? 'resting' : 'sleeping')
const currentFrame = ref(props.active ? petIdlePrimary : petSleepy3)

let frameTimer = null
let restTimer = null

function clearTimers() {
  if (frameTimer) {
    clearInterval(frameTimer)
    frameTimer = null
  }
  if (restTimer) {
    clearTimeout(restTimer)
    restTimer = null
  }
}

function playSequence(frames, duration, onDone) {
  if (frameTimer) {
    clearInterval(frameTimer)
    frameTimer = null
  }
  let i = 0
  currentFrame.value = frames[0]
  frameTimer = setInterval(() => {
    i += 1
    if (i >= frames.length) {
      clearInterval(frameTimer)
      frameTimer = null
      onDone?.()
      return
    }
    currentFrame.value = frames[i]
  }, duration)
}

function getNextRestPause() {
  return Math.round(REST_MIN_MS + Math.random() * (REST_MAX_MS - REST_MIN_MS))
}

function scheduleNextIdle() {
  if (restTimer) clearTimeout(restTimer)
  restTimer = setTimeout(() => {
    restTimer = null
    if (phase.value !== 'resting') return
    playIdleOnce()
  }, getNextRestPause())
}

function playIdleOnce() {
  phase.value = 'idling'
  playSequence(IDLE_FRAMES, IDLE_FRAME_MS, () => {
    if (!props.active) return
    phase.value = 'resting'
    currentFrame.value = petIdlePrimary
    scheduleNextIdle()
  })
}

function wakeUp() {
  phase.value = 'waking'
  playSequence(WAKE_FRAMES, TRANSITION_FRAME_MS, () => {
    if (!props.active) return
    phase.value = 'resting'
    currentFrame.value = petIdlePrimary
    scheduleNextIdle()
  })
}

function fallAsleep() {
  phase.value = 'falling'
  playSequence(FALL_FRAMES, TRANSITION_FRAME_MS, () => {
    if (props.active) return
    phase.value = 'sleeping'
    currentFrame.value = petSleepy3
  })
}

watch(
  () => props.active,
  (isActive, wasActive) => {
    if (isActive === wasActive) return
    clearTimers()
    if (isActive) wakeUp()
    else fallAsleep()
  }
)

onMounted(() => {
  if (props.active) {
    phase.value = 'resting'
    currentFrame.value = petIdlePrimary
    scheduleNextIdle()
  } else {
    phase.value = 'sleeping'
    currentFrame.value = petSleepy3
  }
})

onBeforeUnmount(clearTimers)
</script>

<style scoped>
.pet-frame {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pet-appear 0.4s ease-in-out both;
}

.pet-bounce {
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: 50% 100%;
}

.pet-bounce-rest {
  animation: pet-breathe 3s ease-in-out infinite;
}

.pet-stage {
  width: 200px;
  height: 200px;
  object-fit: contain;
  image-rendering: pixelated;
  user-select: none;
  display: block;
}

@keyframes pet-breathe {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.02);
  }
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
</style>
