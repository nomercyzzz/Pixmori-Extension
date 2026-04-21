<template>
  <section class="pet-view">
    <section class="hero-shell page-block page-block-1">
      <div class="hero-stage">
        <PetDisplay :active="true" />
      </div>
    </section>

    <div class="section-tabs page-block page-block-2" role="tablist" aria-label="разделы питомца">
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

    <section class="catalog-panel page-block page-block-3">
      <div v-if="activeSection === 'pets'" class="catalog-grid">
        <button
          v-for="item in petItems"
          :key="item.id"
          type="button"
          class="catalog-card catalog-card-pet catalog-card-clickable"
          :class="{ 'catalog-card-selected': isItemSelected(item.id) }"
          :aria-label="getItemAriaLabel(item)"
          :aria-pressed="isItemSelected(item.id)"
          @click="handleItemClick(item)"
        >
          <span
            class="selection-dot"
            :class="{ 'selection-dot-visible': isItemSelected(item.id) }"
            aria-hidden="true"
          ></span>

          <div class="card-media card-media-pet">
            <img
              v-if="item.avatar"
              class="card-image card-image-pet"
              :src="item.avatar"
              alt=""
              draggable="false"
            />
            <span v-else class="card-placeholder">скоро...</span>
          </div>

          <div class="card-caption">
            <p class="card-title">{{ item.name }}</p>
          </div>
        </button>
      </div>

      <div v-else class="catalog-grid">
        <button
          v-for="item in activeItems"
          :key="item.id"
          type="button"
          class="catalog-card catalog-card-clickable"
          :class="{ 'catalog-card-selected': activeSection !== 'food' && isItemSelected(item.id) }"
          :aria-label="getItemAriaLabel(item)"
          :aria-pressed="activeSection === 'food' ? undefined : isItemSelected(item.id)"
          @click="handleItemClick(item)"
        >
          <span
            v-if="activeSection === 'accessories'"
            class="selection-dot"
            :class="{ 'selection-dot-visible': isItemSelected(item.id) }"
            aria-hidden="true"
          ></span>

          <div class="card-media card-media-item">
            <img
              v-if="item.image"
              class="card-image card-image-food"
              :src="item.image"
              alt=""
              draggable="false"
            />
            <span v-else class="card-placeholder">скоро...</span>
          </div>

          <div class="card-caption">
            <div class="card-title-row" :class="{ 'card-title-row-food': activeSection === 'food' }">
              <p class="card-title">{{ item.name }}</p>
              <span v-if="activeSection === 'food'" class="count-badge">{{ item.count }}</span>
            </div>
          </div>
        </button>
      </div>

      <div v-if="activeSection === 'food' && activeItems.length === 0" class="empty-message">
        Еда закончилась. Загляните в магазин за новыми угощениями.
      </div>

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
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PetDisplay from '../components/PetDisplay.vue'
import foodBurger from '../assets/food/15_burger.png'
import foodCookies from '../assets/food/28_cookies.png'
import petIdlePrimary from '../assets/pet/idle111.png'

const router = useRouter()

const petItems = [
  { id: 'fox', name: 'лис', comingSoon: true },
  { id: 'rabbit', name: 'кролик', comingSoon: true },
  { id: 'panda', name: 'панда', comingSoon: true },
  { id: 'hamster', name: 'хомяк', comingSoon: true },
  { id: 'puppy', name: 'щенок', comingSoon: true },
  { id: 'owl', name: 'сова', comingSoon: true },
  { id: 'raccoon', name: 'енот', comingSoon: true },
  { id: 'bear', name: 'мишка', comingSoon: true },
  { id: 'cat', name: 'котик', avatar: petIdlePrimary, comingSoon: false }
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

const activeItems = computed(() => {
  return activeSection.value === 'food' ? foodItems : accessoryItems
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

function goToShop() {
  router.push({ name: 'shop' })
}
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

.hero-shell {
  display: flex;
  justify-content: center;
  padding: 4px 0 0;
}

.hero-stage {
  position: relative;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.hero-stage :deep(.pet-frame) {
  position: relative;
  z-index: 1;
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
  gap: 12px;
  min-height: 0;
  padding: 14px;
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  background: var(--bg-card);
  overflow-x: hidden;
  overflow-y: auto;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  align-content: start;
}

.catalog-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 10px;
  border: 1px solid rgba(121, 130, 176, 0.18);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 246, 255, 0.92) 100%),
    var(--bg-main);
  transition: transform var(--ease), border-color var(--ease), box-shadow var(--ease);
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
