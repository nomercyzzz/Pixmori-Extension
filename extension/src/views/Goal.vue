<template>
  <section class="goal-page">
    <div class="goal-actions page-block page-block-1">
      <button
        class="action-btn"
        :class="{ 'action-btn-active': activeTab === 'free' }"
        type="button"
        @click="selectFreeGoal"
      >
        Свободный режим
      </button>

      <button
        class="action-btn"
        :class="{ 'action-btn-active': activeTab === 'create' }"
        type="button"
        @click="openCreateForm"
      >
        Создать цель
      </button>
    </div>

    <section class="goal-list-card page-block page-block-2">
      <div class="filter-row">
        <button
          type="button"
          class="filter-btn"
          :class="{ 'filter-btn-active': filter === 'active' }"
          @click="filter = 'active'"
        >
          <span>Действующие</span>
          <span class="filter-count">{{ store.activeGoals.length }}</span>
        </button>

        <button
          type="button"
          class="filter-btn"
          :class="{ 'filter-btn-active': filter === 'closed' }"
          @click="filter = 'closed'"
        >
          <span>Закрытые</span>
          <span class="filter-count">{{ store.closedGoals.length }}</span>
        </button>
      </div>

      <ul v-if="visibleGoals.length > 0" class="goal-list">
        <li v-for="goal in visibleGoals" :key="goal.id">
          <div
            class="goal-card"
            :class="{
              'goal-card-active': store.selectedGoalId === goal.id,
              'goal-card-closed': goal.status === 'closed'
            }"
          >
            <button
              type="button"
              class="goal-card-main"
              :disabled="goal.status === 'closed'"
              @click="selectCustomGoal(goal.id)"
            >
              <span class="goal-title">{{ goal.title }}</span>
              <span v-if="goal.description" class="goal-desc">{{ goal.description }}</span>
            </button>

            <div class="goal-chips">
              <button
                type="button"
                class="chip"
                aria-label="Изменить"
                title="Изменить"
                @click="openEditForm(goal)"
                @mouseenter="setHoveredChip(goal.id, 'edit')"
                @mouseleave="clearHoveredChip(goal.id, 'edit')"
              >
                <img class="chip-icon" :src="getChipIcon(goal.id, 'edit')" alt="" draggable="false" />
              </button>

              <button
                v-if="goal.status === 'closed'"
                type="button"
                class="chip"
                aria-label="Восстановить"
                title="Восстановить"
                @click="restoreGoal(goal.id)"
                @mouseenter="setHoveredChip(goal.id, 'restore')"
                @mouseleave="clearHoveredChip(goal.id, 'restore')"
              >
                <img class="chip-icon" :src="getChipIcon(goal.id, 'restore')" alt="" draggable="false" />
              </button>

              <button
                v-else
                type="button"
                class="chip"
                aria-label="Закрыть"
                title="Закрыть"
                @click="closeGoal(goal.id)"
                @mouseenter="setHoveredChip(goal.id, 'complete')"
                @mouseleave="clearHoveredChip(goal.id, 'complete')"
              >
                <img class="chip-icon" :src="getChipIcon(goal.id, 'complete')" alt="" draggable="false" />
              </button>

              <button
                type="button"
                class="chip chip-danger"
                aria-label="Удалить"
                title="Удалить"
                @click="deleteGoal(goal.id)"
                @mouseenter="setHoveredChip(goal.id, 'delete')"
                @mouseleave="clearHoveredChip(goal.id, 'delete')"
              >
                <img class="chip-icon" :src="getChipIcon(goal.id, 'delete')" alt="" draggable="false" />
              </button>
            </div>
          </div>
        </li>
      </ul>

      <p v-else class="empty-text">{{ emptyText }}</p>
    </section>

    <GoalFormModal
      :is-open="isFormOpen"
      :title="formTitle"
      :form="form"
      :helper-text="helperText"
      :has-validation-error="hasValidationError"
      @close="closeGoalForm"
      @submit="submitGoal"
      @input="handleFormInput"
    />
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import GoalFormModal from '../components/GoalFormModal.vue'
import { useAppStore } from '../stores/appStore'
import { normalizeTitle } from '../utils/goalUtils.js'
import iconEditStatic from '../assets/icons/edit-pencil.svg'
import iconEditAnim from '../assets/icons/edit-pencil.apng.png'
import iconRestoreStatic from '../assets/icons/восстановить.svg'
import iconRestoreAnim from '../assets/icons/восстановить.apng.png'
import iconCompleteStatic from '../assets/icons/галочка.svg'
import iconCompleteAnim from '../assets/icons/галочка.apng.png'
import iconDeleteStatic from '../assets/icons/удалить.svg'
import iconDeleteAnim from '../assets/icons/удалить.apng.png'

const DEFAULT_HELPER_TEXT = 'Опиши цель конкретно, чтобы анализ понимал, какие сайты и действия полезны.'
const CHIP_ICONS = {
  edit: { static: iconEditStatic, anim: iconEditAnim },
  restore: { static: iconRestoreStatic, anim: iconRestoreAnim },
  complete: { static: iconCompleteStatic, anim: iconCompleteAnim },
  delete: { static: iconDeleteStatic, anim: iconDeleteAnim }
}

const store = useAppStore()
const isFormOpen = ref(false)
const isSubmitAttempted = ref(false)
const filter = ref('active')
const hoveredChipKey = ref('')

const activeTab = computed(() => {
  return isFormOpen.value || !store.isFreeGoalSelected ? 'create' : 'free'
})

const form = reactive({
  id: null,
  title: '',
  description: '',
  blacklistSites: [],
  blacklistSiteDraft: '',
  blacklistSearch: ''
})

const formTitle = computed(() => {
  return form.id ? 'Редактировать цель' : 'Новая цель'
})

const visibleGoals = computed(() => {
  return filter.value === 'closed' ? store.closedGoals : store.activeGoals
})

const emptyText = computed(() => {
  return filter.value === 'closed' ? 'закрытых целей пока что нет' : 'целей пока что нет :('
})

function getChipKey(goalId, action) {
  return `${goalId}:${action}`
}

function setHoveredChip(goalId, action) {
  hoveredChipKey.value = getChipKey(goalId, action)
}

function clearHoveredChip(goalId, action) {
  if (hoveredChipKey.value === getChipKey(goalId, action)) {
    hoveredChipKey.value = ''
  }
}

function getChipIcon(goalId, action) {
  const icon = CHIP_ICONS[action]
  if (!icon) return ''
  return hoveredChipKey.value === getChipKey(goalId, action) ? icon.anim : icon.static
}

function getHelperMessage() {
  const title = form.title.trim()
  const description = form.description.trim()

  if (isSubmitAttempted.value && !title) {
    return 'Заполни название цели'
  }

  if (form.title && title.length < 3) {
    return `В названии нужно еще ${3 - title.length} симв.`
  }

  if (form.description && description.length < 8) {
    return `В описании нужно еще ${8 - description.length} симв.`
  }

  if (isSubmitAttempted.value && !description) {
    return 'Заполни описание цели'
  }

  if (title.length >= 3) {
    const normalizedTitle = normalizeTitle(title)
    const hasDuplicate = store.goals.some((goal) => goal.id !== form.id && normalizeTitle(goal.title) === normalizedTitle)

    if (hasDuplicate) {
      return 'Такая цель уже есть'
    }
  }

  return DEFAULT_HELPER_TEXT
}

const helperText = computed(() => {
  return getHelperMessage()
})

const hasValidationError = computed(() => {
  return isFormOpen.value && helperText.value !== DEFAULT_HELPER_TEXT
})

function handleFormInput() {
  if (!form.title && !form.description && !form.blacklistSiteDraft && !form.blacklistSearch && form.blacklistSites.length === 0) {
    isSubmitAttempted.value = false
  }
}

function resetForm() {
  form.id = null
  form.title = ''
  form.description = ''
  form.blacklistSites = []
  form.blacklistSiteDraft = ''
  form.blacklistSearch = ''
  isSubmitAttempted.value = false
}

async function selectFreeGoal() {
  await store.setFreeGoal()
  closeGoalForm()
}

function openCreateForm() {
  isFormOpen.value = true
  resetForm()
}

function openEditForm(goal) {
  isFormOpen.value = true
  form.id = goal.id
  form.title = goal.title
  form.description = goal.description
  form.blacklistSites = Array.isArray(goal.blacklistSites) ? [...goal.blacklistSites] : []
  form.blacklistSiteDraft = ''
  form.blacklistSearch = ''
  isSubmitAttempted.value = false
}

async function selectCustomGoal(goalId) {
  await store.selectGoal(goalId)
}

async function closeGoal(goalId) {
  await store.setGoalStatus(goalId, 'closed')
}

async function restoreGoal(goalId) {
  await store.setGoalStatus(goalId, 'active')
}

async function deleteGoal(goalId) {
  await store.deleteGoal(goalId)
}

function closeGoalForm() {
  isFormOpen.value = false
  resetForm()
}

async function submitGoal() {
  isSubmitAttempted.value = true

  if (helperText.value !== DEFAULT_HELPER_TEXT) {
    return
  }

  const saved = await store.saveGoal({
    id: form.id,
    title: form.title,
    description: form.description,
    blacklistSites: form.blacklistSites
  })

  if (!saved) return

  closeGoalForm()
}
</script>

<style scoped>
.goal-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
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

.goal-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 11px 12px;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border-soft);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--ease);
}

.action-btn-active {
  background: var(--accent);
  border-color: var(--accent);
  color: #FBFAF7;
  box-shadow: 0 2px 8px rgba(124, 140, 255, 0.25);
}

.action-btn:not(.action-btn-active):hover {
  border-color: var(--text-muted);
  transform: translateY(-1px);
}

.action-btn-active:hover {
  background: var(--accent-deep);
  border-color: var(--accent-deep);
  opacity: 1;
}

.goal-list-card {
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  background: var(--bg-card);
  padding: 12px;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  gap: 10px;
  overflow: hidden;
}

.filter-row {
  display: flex;
  gap: 6px;
  background: var(--bg-main);
  padding: 4px;
  border-radius: 10px;
}

.filter-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  min-height: 30px;
  border-radius: 8px;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--ease);
}

.filter-btn:not(.filter-btn-active):hover {
  color: var(--text-main);
}

.filter-btn-active {
  background: var(--bg-card);
  color: var(--text-main);
  box-shadow: 0 1px 3px rgba(31, 31, 31, 0.06);
}

.filter-btn-active:hover {
  opacity: 1;
}

.filter-count {
  padding: 1px 7px;
  min-width: 20px;
  border-radius: 999px;
  background: var(--border-soft);
  color: var(--text-main);
  font-size: 12px;
  line-height: 1.4;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  transition: background-color var(--ease), color var(--ease);
}

.filter-btn-active .filter-count {
  background: var(--accent-soft);
  color: var(--accent-deep);
}

.goal-list {
  margin: 0;
  padding: 0 4px 0 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border-soft) transparent;
}

.goal-list::-webkit-scrollbar {
  width: 8px;
}

.goal-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 999px;
}

.goal-list::-webkit-scrollbar-thumb {
  background: var(--border-soft);
  border-radius: 999px;
}

.goal-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.goal-card {
  width: 100%;
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  background: var(--bg-main);
  color: var(--text-main);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all var(--ease);
}

.goal-card:hover {
  border-color: var(--text-muted);
}

.goal-card-active {
  border-color: var(--accent);
  background: var(--accent);
  color: #FBFAF7;
  box-shadow: 0 4px 12px rgba(124, 140, 255, 0.2);
}

.goal-card-active:hover {
  border-color: var(--accent);
  background: var(--accent);
}

.goal-card-closed {
  opacity: 0.65;
}

.goal-card-closed .goal-title {
  text-decoration: line-through;
  text-decoration-thickness: 1px;
}

.goal-card-main {
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: inherit;
  min-width: 0;
  width: 100%;
  transition: color var(--ease);
}

.goal-card-main:disabled {
  cursor: default;
}

.goal-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  word-break: break-word;
  transition: color var(--ease);
}

.goal-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  word-break: break-word;
  transition: color var(--ease);
}

.goal-card-active .goal-desc {
  color: rgba(251, 250, 247, 0.85);
}

.goal-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-top: 4px;
  border-top: 1px solid var(--border-soft);
  transition: border-top-color var(--ease);
}

.goal-card-active .goal-chips {
  border-top-color: rgba(251, 250, 247, 0.25);
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-soft);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 14px;
  line-height: 1;
  transition: all var(--ease);
}

.chip:hover {
  transform: translateY(-1px);
  border-color: var(--text-muted);
}

.chip-danger:hover {
  border-color: var(--danger);
  background: rgba(209, 73, 91, 0.08);
}

.goal-card-active .chip {
  border-color: transparent;
  background: rgba(251, 250, 247, 0.95);
}

.goal-card-active .chip:hover {
  background: #FBFAF7;
}

.chip-icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
  user-select: none;
}

.empty-text {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
  transition: color var(--ease);
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
