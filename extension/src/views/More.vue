<template>
  <section class="more-page">
    <button class="more-card page-block page-block-1" type="button" @click="goTo('pet')">
      <span class="more-copy">
        <span class="more-title">Питомец</span>
        <span class="more-text">Выбор и настройка</span>
      </span>
      <span class="more-arrow" aria-hidden="true">></span>
    </button>

    <button class="more-card page-block page-block-2" type="button" @click="goTo('shop')">
      <span class="more-copy">
        <span class="more-title">Магазин</span>
        <span class="more-text">Питомцы и аксессуары</span>
      </span>
      <span class="more-arrow" aria-hidden="true">></span>
    </button>

    <button class="more-card page-block page-block-3" type="button" @click="goTo('account')">
      <span class="more-copy">
        <span class="more-title">Аккаунт</span>
        <span class="more-text">Безопасность и данные</span>
      </span>
      <span class="more-arrow" aria-hidden="true">></span>
    </button>

    <button class="more-card page-block page-block-4" type="button" @click="goTo('about')">
      <span class="more-copy">
        <span class="more-title">О нас</span>
        <span class="more-text">О проекте</span>
      </span>
      <span class="more-arrow" aria-hidden="true">></span>
    </button>

    <button class="more-card page-block page-block-5" type="button" @click="goTo('help')">
      <span class="more-copy">
        <span class="more-title">Помощь</span>
        <span class="more-text">Подсказки и ответы</span>
      </span>
      <span class="more-arrow" aria-hidden="true">></span>
    </button>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(section) {
  router.push(`/more/${section}`)
}
</script>

<style scoped>
.more-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
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

.page-block-4 {
  animation-delay: 0.28s;
}

.page-block-5 {
  animation-delay: 0.36s;
}

.more-card {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #2d2d2d;
  border-radius: 11px;
  background: #111111;
  padding: 11px 12px 10px;
  text-align: left;
  transition: all 0.4s ease-in-out;
}

.more-card:hover {
  border-color: #ffffff;
  background: #ffffff;
}

.more-card:hover .more-title {
  color: #090909;
}

.more-card:hover .more-text,
.more-card:hover .more-arrow {
  color: #6a6a6a;
}

.more-copy {
  display: flex;
  flex-direction: column;
  gap: inherit;
}

.more-title {
  color: #fafafa;
  font-size: 10px;
  line-height: 1.3;
  transition: color 0.4s ease-in-out;
}

.more-text {
  color: #8f8f8f;
  font-size: 8px;
  line-height: 1.3;
  transition: color 0.4s ease-in-out;
}

.more-arrow {
  flex-shrink: 0;
  color: #8f8f8f;
  font-size: 10px;
  line-height: 1;
  transition: color 0.4s ease-in-out;
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
