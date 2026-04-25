<template>
  <div class="pet-frame" :class="frameClass">
    <img
      class="pet-stage"
      :src="currentFrame"
      alt="Питомец"
      draggable="false"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import petIdle1 from '../assets/pet/default-cat/idle/idle1.png'
import petIdle2 from '../assets/pet/default-cat/idle/idle2.png'
import petIdle3 from '../assets/pet/default-cat/idle/idle3.png'
import petIdle4 from '../assets/pet/default-cat/idle/idle4.png'
import petSleep1 from '../assets/pet/default-cat/sleep/sleep1.png'
import petSleep2 from '../assets/pet/default-cat/sleep/sleep2.png'
import petSleep3 from '../assets/pet/default-cat/sleep/sleep3.png'
import petSleep4 from '../assets/pet/default-cat/sleep/sleep4.png'
import petSleepy1 from '../assets/pet/default-cat/sleepy/sleepy1.png'
import petSleepy2 from '../assets/pet/default-cat/sleepy/sleepy2.png'
import petSleepy3 from '../assets/pet/default-cat/sleepy/sleepy3.png'

const IDLE_FRAMES = [petIdle1, petIdle2, petIdle3, petIdle4, petIdle3, petIdle2]
const SLEEP_FRAMES = [petSleep1, petSleep2, petSleep3, petSleep4, petSleep3, petSleep2]
const FALL_ASLEEP_FRAMES = [petIdle4, petSleepy1, petSleepy2, petSleepy3]
const WAKE_FRAMES = [petSleepy3, petSleepy2, petSleepy1, petIdle4, petIdle3, petIdle2, petIdle1]

const IDLE_FRAME_MS = 680
const SLEEP_FRAME_MS = 920
const TRANSITION_FRAME_MS = 360
const IDLE_LOOP_DELAY_MS = 760
const SLEEP_LOOP_DELAY_MS = 620

const props = defineProps({
  active: {
    type: Boolean,
    default: false
  }
})

const state = ref(props.active ? 'idle' : 'sleeping')
const currentFrame = ref(props.active ? IDLE_FRAMES[0] : SLEEP_FRAMES[0])

const frameClass = computed(() => ({
  'pet-frame-idle': state.value === 'idle',
  'pet-frame-sleeping': state.value === 'sleeping'
}))

let frameTimerId = null
let animationToken = 0

function clearFrameTimer() {
  if (frameTimerId !== null) {
    clearTimeout(frameTimerId)
    frameTimerId = null
  }
}

function warmupFrame(source) {
  const image = new Image()
  image.decoding = 'async'
  image.src = source

  if (typeof image.decode === 'function') {
    image.decode().catch(() => {})
  }
}

function appendStartFrame(sequence) {
  if (!currentFrame.value || currentFrame.value === sequence[0]) {
    return sequence
  }

  return [currentFrame.value, ...sequence]
}

function playSequence(frames, duration, options = {}) {
  const {
    loop = false,
    loopDelay = duration,
    onDone
  } = options

  animationToken += 1
  const token = animationToken

  clearFrameTimer()

  if (frames.length === 0) {
    onDone?.()
    return
  }

  let index = 0
  currentFrame.value = frames[0]

  const step = () => {
    if (token !== animationToken) {
      return
    }

    if (index >= frames.length - 1) {
      if (!loop) {
        frameTimerId = null
        onDone?.()
        return
      }

      index = 0
      currentFrame.value = frames[index]
      frameTimerId = window.setTimeout(step, loopDelay)
      return
    }

    index += 1
    currentFrame.value = frames[index]
    frameTimerId = window.setTimeout(step, duration)
  }

  frameTimerId = window.setTimeout(step, duration)
}

function startIdle() {
  state.value = 'idle'
  playSequence(IDLE_FRAMES, IDLE_FRAME_MS, {
    loop: true,
    loopDelay: IDLE_LOOP_DELAY_MS
  })
}

function startSleeping() {
  state.value = 'sleeping'
  playSequence(SLEEP_FRAMES, SLEEP_FRAME_MS, {
    loop: true,
    loopDelay: SLEEP_LOOP_DELAY_MS
  })
}

function wakeUp() {
  state.value = 'transition'
  playSequence(appendStartFrame(WAKE_FRAMES), TRANSITION_FRAME_MS, {
    onDone: () => {
      if (!props.active) {
        return
      }

      startIdle()
    }
  })
}

function fallAsleep() {
  state.value = 'transition'
  playSequence(appendStartFrame(FALL_ASLEEP_FRAMES), TRANSITION_FRAME_MS, {
    onDone: () => {
      if (props.active) {
        return
      }

      startSleeping()
    }
  })
}

watch(
  () => props.active,
  (isActive, wasActive) => {
    if (isActive === wasActive) {
      return
    }

    if (isActive) {
      wakeUp()
      return
    }

    fallAsleep()
  }
)

onMounted(() => {
  ;[
    ...IDLE_FRAMES,
    ...SLEEP_FRAMES,
    ...FALL_ASLEEP_FRAMES,
    ...WAKE_FRAMES
  ].forEach((frame) => warmupFrame(frame))

  if (props.active) {
    startIdle()
    return
  }

  startSleeping()
})

onBeforeUnmount(() => {
  animationToken += 1
  clearFrameTimer()
})
</script>

<style scoped>
.pet-frame {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: 50% 100%;
  will-change: transform;
  animation: pet-appear 0.4s ease-in-out both;
}

.pet-frame-idle {
  animation:
    pet-appear 0.4s ease-in-out both,
    pet-idle-float 4.6s ease-in-out infinite;
}

.pet-frame-sleeping {
  animation:
    pet-appear 0.4s ease-in-out both,
    pet-sleep-breathe 6.2s ease-in-out infinite;
}

.pet-stage {
  width: 200px;
  height: 200px;
  object-fit: contain;
  image-rendering: pixelated;
  user-select: none;
  display: block;
  filter: drop-shadow(0 10px 18px rgba(31, 31, 31, 0.08));
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

@keyframes pet-idle-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  25% {
    transform: translateY(-4px) scale(1.012);
  }

  50% {
    transform: translateY(-1px) scale(1.004);
  }

  75% {
    transform: translateY(-3px) scale(1.01);
  }
}

@keyframes pet-sleep-breathe {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(2px) scale(0.992);
  }
}
</style>
