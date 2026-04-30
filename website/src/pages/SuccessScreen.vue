<template>
  <main class="success-page">
    <section class="success-panel">
      <h1 class="success-heading">Авторизация прошла успешно!</h1>
      <p class="success-hint">Можете закрыть эту вкладку и вернуться в расширение</p>
    </section>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import confetti from 'canvas-confetti'

onMounted(() => {
  setTimeout(() => {
    confetti({
      particleCount: 350,
      spread: 120,
      startVelocity: 50,
      origin: { y: 0.6 },
      zIndex: 100,
      disableForReducedMotion: true
    });
  }, 500);
})
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.success-panel {
  width: 100%;
  max-width: 430px;
  padding: 48px 32px;
  border: 1px solid var(--px-border);
  border-radius: 20px;
  background: var(--px-bg-card);
  box-shadow: var(--px-shadow-card);
  text-align: center;
  opacity: 0;
  animation: panel-fade-in 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  will-change: transform, opacity;
}

.success-heading {
  margin: 0;
  color: var(--px-text);
  font-family: var(--px-font-body);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
}

.success-hint {
  margin: 14px 0 0;
  font-size: 13px;
  color: var(--px-muted);
  line-height: 1.5;
}

@keyframes panel-fade-in {
  0% {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
