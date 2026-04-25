<template>
  <section class="pet-view">
    <header class="page-header page-block page-block-1">
      <h1 class="page-title">Питомец</h1>
    </header>

    <section class="hero-shell page-block page-block-2">
      <div class="hero-stage">
        <img
          class="hero-pet-image"
          :src="petIdlePrimary"
          alt="Питомец"
          draggable="false"
        />
      </div>
    </section>

    <div class="pet-health-shell page-block page-block-3">
      <HealthBar :value="store.petHealth" />
    </div>

    <div class="section-tabs page-block page-block-4" role="tablist" aria-label="Разделы питомца">
      <button
        v-for="section in sections"
        :key="section.id"
        type="button"
        class="section-tab"
        :class="{ 'section-tab-active': activeSection === section.id }"
        :aria-selected="activeSection === section.id"
        @click="activeSection = section.id"
      >
        {{ section.label }}
      </button>
    </div>

    <section class="catalog-panel page-block page-block-5">
      <TransitionGroup
        name="section-catalog-motion"
        tag="div"
        class="catalog-grid"
        @before-leave="lockLeavingCardPosition"
        @after-leave="clearLeavingCardPosition"
        @leave-cancelled="clearLeavingCardPosition"
      >
        <button
          v-for="item in sectionItems"
          :key="`${activeSection}-${item.id}`"
          type="button"
          class="catalog-card catalog-card-clickable"
          :class="{
            'catalog-card-pet': isPetsSection,
            'catalog-card-selected': !isFoodSection && isItemSelected(item.id)
          }"
          :aria-label="getItemAriaLabel(item)"
          :aria-pressed="isFoodSection ? undefined : isItemSelected(item.id)"
          @click="handleItemClick(item)"
        >
          <span
            v-if="!isFoodSection"
            class="selection-dot"
            :class="{ 'selection-dot-visible': isItemSelected(item.id) }"
            aria-hidden="true"
          ></span>

          <div class="card-media" :class="isPetsSection ? 'card-media-pet' : 'card-media-item'">
            <img
              v-if="getItemVisual(item)"
              class="card-image"
              :class="isPetsSection ? 'card-image-pet' : 'card-image-food'"
              :src="getItemVisual(item)"
              alt=""
              decoding="async"
              draggable="false"
            />
            <span v-else class="card-placeholder">скоро...</span>
          </div>

          <div class="card-caption">
            <div class="card-title-row" :class="{ 'card-title-row-food': isFoodSection }">
              <p class="card-title">{{ item.name }}</p>
              <span v-if="isFoodSection" class="count-badge">{{ item.count }}</span>
            </div>
          </div>
        </button>
      </TransitionGroup>

      <Transition name="empty-fade">
        <div v-if="isFoodSection && sectionItems.length === 0" class="empty-message">
          Еда закончилась. Загляните в магазин за новыми угощениями.
        </div>
      </Transition>

      <div class="shop-panel">
        <div class="shop-copy">
          <p class="shop-title">Новые питомцы, еда и аксессуары</p>
          <p class="shop-description">Можно перейти в магазин и купить что-то полезное для питомца.</p>
        </div>
        <button type="button" class="shop-button" @click="goToShop">Открыть магазин</button>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import foodBurger from '../assets/food/15_burger.png'
import foodCookies from '../assets/food/28_cookies.png'
import petIdlePrimary from '../assets/pet/default-cat/idle/idle2.png'
import HealthBar from '../components/HealthBar.vue'
import { useAppStore } from '../stores/appStore'

const router = useRouter()
const store = useAppStore()

const petItems = [
  { id: 'cat', name: 'котик', avatar: petIdlePrimary },
  { id: 'fox', name: 'лис', comingSoon: true },
  { id: 'rabbit', name: 'кролик', comingSoon: true },
  { id: 'panda', name: 'панда', comingSoon: true },
  { id: 'hamster', name: 'хомяк', comingSoon: true },
  { id: 'puppy', name: 'щенок', comingSoon: true },
  { id: 'owl', name: 'сова', comingSoon: true },
  { id: 'raccoon', name: 'енот', comingSoon: true },
  { id: 'bear', name: 'мишка', comingSoon: true }
]

const accessoryItems = [
  { id: 'bow', name: 'бантик', comingSoon: true },
  { id: 'glasses', name: 'очки', comingSoon: true }
]

const foodItems = reactive([
  { id: 'burger', name: 'бургер', count: 3, image: foodBurger },
  { id: 'cookies', name: 'печенье', count: 8, image: foodCookies }
])

const activeSection = ref('pets')
const selectedPetId = ref('cat')
const selectedAccessoryId = ref(null)

const sections = [
  { id: 'pets', label: 'питомцы' },
  { id: 'accessories', label: 'аксессуары' },
  { id: 'food', label: 'еда' }
]

const isPetsSection = computed(() => activeSection.value === 'pets')
const isFoodSection = computed(() => activeSection.value === 'food')

const activeItems = computed(() => {
  return activeSection.value === 'food' ? foodItems : accessoryItems
})

const sectionItems = computed(() => {
  return isPetsSection.value ? petItems : activeItems.value
})

function isItemSelected(itemId) {
  if (activeSection.value === 'pets') {
    return selectedPetId.value === itemId
  }

  if (activeSection.value === 'food') {
    return false
  }

  return selectedAccessoryId.value === itemId
}

function handleItemClick(item) {
  if (activeSection.value === 'food') {
    useFood(item.id)
    return
  }

  if (activeSection.value === 'pets') {
    selectedPetId.value = item.id
    return
  }

  selectedAccessoryId.value = selectedAccessoryId.value === item.id ? null : item.id
}

function useFood(itemId) {
  const itemIndex = foodItems.findIndex((food) => food.id === itemId)

  if (itemIndex === -1) {
    return
  }

  if (foodItems[itemIndex].count <= 1) {
    foodItems.splice(itemIndex, 1)
    return
  }

  foodItems[itemIndex].count -= 1
}

function getItemAriaLabel(item) {
  if (activeSection.value === 'food') {
    return `${item.name}, ${item.count} штук`
  }

  return item.comingSoon ? `${item.name}, скоро` : item.name
}

function getItemVisual(item) {
  return isPetsSection.value ? item.avatar : item.image
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

function goToShop() {
  router.push({ name: 'shop' })
}

onMounted(() => {
  const imageSources = [
    ...new Set(
      [
        ...petItems.map((item) => item.avatar),
        ...foodItems.map((item) => item.image)
      ].filter(Boolean)
    )
  ]

  imageSources.forEach((source) => warmupImageAsset(source))
})
</script>

<style scoped>
.pet-view {
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

.page-block-5 {
  animation-delay: 0.36s;
}

.hero-shell {
  display: flex;
  justify-content: center;
  padding: 4px 0 0;
}

.hero-stage {
  position: relative;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.hero-pet-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  image-rendering: pixelated;
  user-select: none;
  display: block;
  filter: drop-shadow(0 10px 18px rgba(31, 31, 31, 0.08));
}

.pet-health-shell {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.pet-health-shell :deep(.health-bar) {
  padding: 0 2px;
}

.section-tabs {
  display: flex;
  gap: 8px;
}

.section-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 14px;
  font-weight: 500;
  transition: transform var(--ease), border-color var(--ease), background var(--ease), box-shadow var(--ease), color var(--ease);
}

.section-tab:hover {
  transform: translateY(-1px);
  border-color: var(--text-muted);
}

.section-tab-active {
  border-color: var(--accent);
  background: var(--accent);
  color: #fbfaf7;
}

.section-tab-active:hover {
  border-color: var(--accent-deep);
  background: var(--accent-deep);
}

.catalog-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  position: relative;
  gap: 12px;
  min-height: 0;
  padding: 14px;
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  background: var(--bg-card);
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  align-content: start;
  position: relative;
}

.catalog-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 10px;
  border: 1px solid rgba(121, 130, 176, 0.18);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 246, 255, 0.92) 100%),
    var(--bg-main);
  transition: transform var(--ease), border-color var(--ease), box-shadow var(--ease);
  transform-origin: center top;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.catalog-card-clickable {
  cursor: pointer;
}

.catalog-card-clickable:hover {
  transform: translateY(-2px);
  border-color: rgba(79, 84, 110, 0.28);
  box-shadow: 0 10px 20px rgba(24, 27, 43, 0.08);
}

.catalog-card-selected {
  border-color: rgba(79, 84, 110, 0.24);
}

.card-media {
  min-height: 106px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.card-media-pet {
  min-height: 108px;
}

.card-media-item {
  min-height: 104px;
}

.card-image {
  width: 96px;
  height: 96px;
  object-fit: contain;
  image-rendering: pixelated;
  user-select: none;
}

.card-image-pet {
  width: 112px;
  height: 112px;
}

.card-image-food {
  width: 92px;
  height: 92px;
}

.card-placeholder {
  color: rgba(33, 37, 65, 0.74);
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.card-caption {
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: center;
  text-align: center;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 20px;
  width: 100%;
}

.card-title-row-food {
  position: relative;
  justify-content: center;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}

.selection-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4e73ff;
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transform: scale(0.65);
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.selection-dot-visible {
  opacity: 1;
  transform: scale(1);
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 22px;
  padding: 1px 7px;
  border: 0;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-deep);
  box-shadow: 0 1px 3px rgba(31, 31, 31, 0.06);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
}

.card-title-row-food .count-badge {
  position: absolute;
  right: 0;
  top: -16px;
}

.empty-message {
  padding: 16px 14px;
  border: 1px dashed rgba(121, 130, 176, 0.28);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.45;
  text-align: center;
}

.section-catalog-motion-enter-active,
.section-catalog-motion-leave-active {
  transition: opacity var(--ease), transform var(--ease);
}

.section-catalog-motion-leave-active {
  position: absolute;
  z-index: 0;
  pointer-events: none;
}

.section-catalog-motion-move {
  transition: transform var(--ease);
}

.section-catalog-motion-enter-from,
.section-catalog-motion-leave-to {
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

.shop-panel {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 14px;
  border: 1px solid rgba(121, 130, 176, 0.22);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(249, 248, 252, 0.96) 0%, rgba(255, 255, 255, 0.98) 72%),
    var(--bg-main);
}

.shop-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shop-title {
  margin: 0;
  color: var(--text-main);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
}

.shop-description {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.4;
}

.shop-button {
  align-self: flex-end;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--accent);
  border-radius: 999px;
  background: var(--accent);
  color: #fbfaf7;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 0 rgba(31, 31, 31, 0.04);
  transition: transform var(--ease), box-shadow var(--ease), border-color var(--ease), background var(--ease), color var(--ease);
}

.shop-button:hover {
  transform: translateY(-3px);
  background: var(--accent-deep);
  border-color: var(--accent-deep);
  box-shadow: 0 10px 20px rgba(31, 31, 31, 0.08);
  opacity: 1;
}

.catalog-panel::-webkit-scrollbar {
  width: 6px;
}

.catalog-panel::-webkit-scrollbar-track {
  background: transparent;
}

.catalog-panel::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(79, 84, 110, 0.22);
}

.catalog-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 84, 110, 0.34);
}

@media (max-width: 380px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }

  .shop-panel {
    gap: 10px;
  }

  .shop-button {
    align-self: stretch;
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
