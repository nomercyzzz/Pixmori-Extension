<template>
  <section class="store-page">
    <header class="page-header page-block page-block-1">
      <h1 class="page-title">Магазин</h1>
      <CoinsBalance class="shop-balance" :amount="20" />
    </header>

    <label class="store-search page-block page-block-2" aria-label="Поиск товаров">
      <input
        v-model="searchQuery"
        class="store-search-input"
        type="text"
        placeholder="Поиск по товарам"
      />
    </label>

    <div class="store-filters page-block page-block-3" role="tablist" aria-label="Категории товаров">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        class="store-filter-chip"
        :class="{ 'store-filter-chip-active': activeCategory === category.id }"
        :aria-selected="activeCategory === category.id"
        @click="activeCategory = category.id"
      >
        {{ category.label }}
      </button>
    </div>

    <section class="store-catalog page-block page-block-4">
      <TransitionGroup
        name="catalog-motion"
        tag="div"
        class="product-grid"
        @before-leave="lockLeavingCardPosition"
        @after-leave="clearLeavingCardPosition"
        @leave-cancelled="clearLeavingCardPosition"
      >
        <article
          v-for="item in visibleItems"
          :key="item.id"
          class="product-card"
        >
          <div class="product-media">
            <img
              v-if="item.image"
              class="product-image"
              :class="{ 'product-image-pet': item.category === 'pets' }"
              :src="item.image"
              alt=""
              decoding="async"
              draggable="false"
            />
            <span v-else class="product-placeholder">скоро</span>
          </div>

          <div class="product-copy">
            <h2 class="product-name">{{ item.name }}</h2>
          </div>

          <div class="product-footer">
            <span class="product-price-button">{{ getPriceText(item.price) }}</span>
          </div>
        </article>
      </TransitionGroup>

      <Transition name="empty-fade">
        <div v-if="visibleItems.length === 0" class="catalog-empty">
          Ничего не найдено
        </div>
      </Transition>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CoinsBalance from '../components/CoinsBalance.vue'
import foodBurger from '../assets/food/15_burger.png'
import foodCookies from '../assets/food/28_cookies.png'
import petIdlePrimary from '../assets/pet/default-cat/idle/idle2.png'

const activeCategory = ref('all')
const searchQuery = ref('')

const categories = [
  { id: 'all', label: 'всё' },
  { id: 'pets', label: 'питомцы' },
  { id: 'food', label: 'еда' },
  { id: 'accessories', label: 'аксессуары' }
]

const storeItems = [
  {
    id: 'cat',
    category: 'pets',
    name: 'котик',
    price: 30,
    image: petIdlePrimary,
    comingSoon: false
  },
  {
    id: 'fox',
    category: 'pets',
    name: 'лис',
    price: 45,
    comingSoon: true
  },
  {
    id: 'owl',
    category: 'pets',
    name: 'сова',
    price: 52,
    comingSoon: true
  },
  {
    id: 'burger',
    category: 'food',
    name: 'бургер',
    price: 4,
    image: foodBurger,
    comingSoon: false
  },
  {
    id: 'cookies',
    category: 'food',
    name: 'печенье',
    price: 3,
    image: foodCookies,
    comingSoon: false
  },
  {
    id: 'milk',
    category: 'food',
    name: 'молоко',
    price: 5,
    comingSoon: true
  },
  {
    id: 'bow',
    category: 'accessories',
    name: 'бантик',
    price: 6,
    comingSoon: true
  },
  {
    id: 'glasses',
    category: 'accessories',
    name: 'очки',
    price: 8,
    comingSoon: true
  },
  {
    id: 'scarf',
    category: 'accessories',
    name: 'шарфик',
    price: 10,
    comingSoon: true
  }
]

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const visibleItems = computed(() => {
  return storeItems.filter((item) => {
    const matchesCategory =
      activeCategory.value === 'all' || item.category === activeCategory.value

    if (!matchesCategory) {
      return false
    }

    if (!normalizedQuery.value) {
      return true
    }

    return item.name.toLowerCase().includes(normalizedQuery.value)
  })
})

function getCoinWord(amount) {
  const lastTwoDigits = amount % 100
  const lastDigit = amount % 10

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'монет'
  }

  if (lastDigit === 1) {
    return 'монета'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'монеты'
  }

  return 'монет'
}

function getPriceText(price) {
  return `${price} ${getCoinWord(price)}`
}

function lockLeavingCardPosition(element) {
  const parentElement = element.parentElement

  if (!parentElement) {
    return
  }

  const parentRect = parentElement.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()

  element.style.width = `${elementRect.width}px`
  element.style.height = `${elementRect.height}px`
  element.style.left = `${elementRect.left - parentRect.left}px`
  element.style.top = `${elementRect.top - parentRect.top}px`
}

function clearLeavingCardPosition(element) {
  element.style.width = ''
  element.style.height = ''
  element.style.left = ''
  element.style.top = ''
}

function warmupImageAsset(source) {
  if (!source) {
    return
  }

  const image = new Image()
  image.decoding = 'async'
  image.src = source

  if (typeof image.decode === 'function') {
    image.decode().catch(() => {})
  }
}

onMounted(() => {
  const imageSources = [...new Set(storeItems.map((item) => item.image).filter(Boolean))]
  imageSources.forEach((source) => warmupImageAsset(source))
})
</script>

<style scoped>
.store-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.page-block {
  opacity: 0;
  transform: translateY(14px);
  animation: block-drop 0.42s ease-in-out forwards;
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

.store-search {
  width: 100%;
}

.store-search-input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  background: var(--bg-card);
  color: var(--text-main);
  outline: none;
  transition: border-color var(--ease), transform var(--ease);
}

.store-search-input::placeholder {
  color: var(--text-muted);
}

.store-search-input:focus {
  border-color: var(--accent);
}

.shop-balance {
  flex-shrink: 0;
}

.store-filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 0 4px;
}

.store-filters::-webkit-scrollbar {
  display: none;
}

.store-filter-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-main);
  white-space: nowrap;
  transition: transform var(--ease), border-color var(--ease), background var(--ease), color var(--ease);
}

.store-filter-chip:hover {
  transform: translateY(-1px);
  border-color: var(--text-muted);
}

.store-filter-chip-active {
  border-color: var(--accent);
  background: var(--accent);
  color: #fbfaf7;
}

.store-filter-chip-active:hover {
  border-color: var(--accent-deep);
  background: var(--accent-deep);
}

.store-catalog {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow-y: auto;
  padding-right: 4px;
}

.store-catalog::-webkit-scrollbar {
  width: 6px;
}

.store-catalog::-webkit-scrollbar-track {
  background: transparent;
}

.store-catalog::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(79, 84, 110, 0.22);
}

.store-catalog::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 84, 110, 0.34);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  align-content: start;
  position: relative;
}

.product-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(121, 130, 176, 0.18);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 246, 255, 0.94) 100%),
    var(--bg-main);
  transition: transform var(--ease), border-color var(--ease), box-shadow var(--ease);
  transform-origin: center top;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.product-card:hover {
  transform: translateY(-2px);
  border-color: rgba(79, 84, 110, 0.26);
  box-shadow: 0 10px 20px rgba(24, 27, 43, 0.08);
}

.product-media {
  min-height: 112px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 94px;
  height: 94px;
  object-fit: contain;
  image-rendering: pixelated;
  user-select: none;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.product-image-pet {
  width: 116px;
  height: 116px;
}

.product-placeholder {
  color: rgba(33, 37, 65, 0.74);
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.product-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 36px;
}

.product-name {
  margin: 0;
  color: var(--text-main);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-price-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--accent);
  border-radius: 999px;
  background: var(--accent);
  color: #fbfaf7;
  font-size: 12px;
  font-weight: 700;
  transition: transform var(--ease), border-color var(--ease), background var(--ease);
}

.product-card:hover .product-price-button {
  background: var(--accent-deep);
  border-color: var(--accent-deep);
}

.catalog-empty {
  position: absolute;
  inset: 0 4px 0 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 20px 12px;
  pointer-events: none;
}

.catalog-motion-enter-active,
.catalog-motion-leave-active {
  transition: opacity var(--ease), transform var(--ease);
}

.catalog-motion-leave-active {
  position: absolute;
  z-index: 0;
  pointer-events: none;
}

.catalog-motion-move {
  transition: transform var(--ease);
}

.catalog-motion-enter-from,
.catalog-motion-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.985);
}

.empty-fade-enter-active,
.empty-fade-leave-active {
  transition: opacity var(--ease), transform var(--ease);
}

.empty-fade-enter-from,
.empty-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 380px) {
  .shop-balance {
    margin-left: auto;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }
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
