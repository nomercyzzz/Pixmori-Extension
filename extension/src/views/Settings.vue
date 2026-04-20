<template>
  <section class="soon-page">
    <div class="soon-icon" aria-hidden="true">
      <img :src="iconSettings" alt="" draggable="false" />
    </div>
    <h1 class="soon-title">Настройки</h1>
    <p class="soon-text">Скоро здесь появятся параметры расширения</p>
  </section>
</template>

<script setup>
import iconSettings from '../assets/icons/setting.svg'
</script>

<style scoped>
.soon-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  text-align: center;
}

.soon-icon {
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
}

.soon-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.soon-title {
  margin: 0;
  font-family: var(--font-pixel);
  font-size: 22px;
  letter-spacing: 0.04em;
  color: var(--text-main);
}

.soon-text {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.4;
  max-width: 240px;
}
</style>
