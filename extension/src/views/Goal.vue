<template>
  <section class="goal-page">
    <header class="page-header page-block page-block-1">
      <h1 class="page-title">Цели</h1>

      <button
        type="button"
        class="goal-create-btn"
        aria-label="Создать цель"
        title="Создать цель"
        @click="openCreateForm"
      >
        <img :src="iconPlus" alt="" draggable="false" />
      </button>
    </header>

    <section class="goal-list-card page-block page-block-2">
      <div class="filter-row">
        <button
          type="button"
          class="filter-btn"
          :class="{ 'filter-btn-active': filter === 'active' }"
          @click="filter = 'active'"
        >
          <span>активные</span>
          <span class="filter-count">{{ store.activeGoals.length }}</span>
        </button>

        <button
          type="button"
          class="filter-btn"
          :class="{ 'filter-btn-active': filter === 'closed' }"
          @click="filter = 'closed'"
        >
          <span>закрытые</span>
          <span class="filter-count">{{ store.closedGoals.length }}</span>
        </button>
      </div>

      <Transition name="goal-pane" mode="out-in">
        <div :key="filter" class="goal-list-shell">
          <TransitionGroup
            v-if="visibleGoals.length > 0"
            appear
            tag="ul"
            class="goal-list"
            name="goal-cards"
          >
            <li
              v-for="(goal, index) in visibleGoals"
              :key="`${filter}-${goal.id}`"
              class="goal-list-item"
              :style="{ '--goal-delay': `${index * 48}ms` }"
            >
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
                  >
                    <img class="chip-icon" :src="iconPencil" alt="" draggable="false" />
                  </button>

                  <button
                    v-if="goal.status === 'closed'"
                    type="button"
                    class="chip"
                    aria-label="Восстановить"
                    title="Восстановить"
                    @click="restoreGoal(goal.id)"
                  >
                    <img class="chip-icon" :src="iconReload" alt="" draggable="false" />
                  </button>

                  <button
                    v-else
                    type="button"
                    class="chip"
                    aria-label="Закрыть"
                    title="Закрыть"
                    @click="closeGoal(goal.id)"
                  >
                    <img class="chip-icon" :src="iconApprove" alt="" draggable="false" />
                  </button>

                  <button
                    type="button"
                    class="chip chip-danger"
                    aria-label="Удалить"
                    title="Удалить"
                    @click="deleteGoal(goal.id)"
                  >
                    <img class="chip-icon" :src="iconCancel" alt="" draggable="false" />
                  </button>
                </div>
              </div>
            </li>
          </TransitionGroup>

          <p v-else class="empty-text">{{ emptyText }}</p>
        </div>
      </Transition>
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
import iconApprove from '../assets/icons/approve.svg'
import iconCancel from '../assets/icons/cancel.svg'
import iconPencil from '../assets/icons/pencil.svg'
import iconPlus from '../assets/icons/plus.svg'
import iconReload from '../assets/icons/reload.svg'
import { useAppStore } from '../stores/appStore'
import { normalizeTitle } from '../utils/goalUtils.js'

const DEFAULT_HELPER_TEXT =
  'Опиши цель конкретно, чтобы проверка по словам и чёрным спискам была точнее.'

const store = useAppStore()
const isFormOpen = ref(false)
const isSubmitAttempted = ref(false)
const filter = ref('active')

const form = reactive({
  id: null,
  title: '',
  description: '',
  blacklistSites: [],
  blacklistSiteDraft: '',
  blacklistSearch: ''
})

const formTitle = computed(() => (form.id ? 'редактировать цель' : 'новая цель'))

const visibleGoals = computed(() => {
  return filter.value === 'closed' ? store.closedGoals : store.activeGoals
})

const emptyText = computed(() => {
  return filter.value === 'closed' ? 'Закрытых целей пока нет' : 'Целей пока нет'
})

function getHelperMessage() {
  const title = form.title.trim()
  const description = form.description.trim()

  if (isSubmitAttempted.value && !title) {
    return 'Заполни название цели'
  }

  if (form.title && title.length < 3) {
    return `В названии нужно ещё ${3 - title.length} симв.`
  }

  if (form.description && description.length < 8) {
    return `В описании нужно ещё ${8 - description.length} симв.`
  }

  if (isSubmitAttempted.value && !description) {
    return 'Заполни описание цели'
  }

  if (title.length >= 3) {
    const normalizedTitle = normalizeTitle(title)
    const hasDuplicate = store.goals.some(
      (goal) => goal.id !== form.id && normalizeTitle(goal.title) === normalizedTitle
    )

    if (hasDuplicate) {
      return 'Такая цель уже есть'
    }
  }

  return DEFAULT_HELPER_TEXT
}

const helperText = computed(() => getHelperMessage())

const hasValidationError = computed(() => {
  return isFormOpen.value && helperText.value !== DEFAULT_HELPER_TEXT
})

function handleFormInput() {
  if (
    !form.title &&
    !form.description &&
    !form.blacklistSiteDraft &&
    !form.blacklistSearch &&
    form.blacklistSites.length === 0
  ) {
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

function openCreateForm() {
  resetForm()
  isFormOpen.value = true
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

.goal-create-btn {
  width: 42px;
  height: 42px;
  border: 1px solid var(--accent);
  border-radius: 14px;
  background: var(--accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 2px 0 rgba(31, 31, 31, 0.04);
  transition:
    transform var(--ease),
    box-shadow var(--ease),
    border-color var(--ease),
    background var(--ease);
}

.goal-create-btn:hover {
  transform: translateY(-3px);
  background: var(--accent-deep);
  border-color: var(--accent-deep);
  box-shadow: 0 10px 20px rgba(31, 31, 31, 0.08);
  opacity: 1;
}

.goal-create-btn img {
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: block;
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

.goal-list-shell {
  display: flex;
  flex: 1;
  min-height: 0;
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

.goal-list-item {
  width: 100%;
}

.goal-card {
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: var(--bg-main);
  color: var(--text-main);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: none;
  transition: transform var(--ease), box-shadow var(--ease), background var(--ease), color var(--ease);
}

.goal-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(31, 31, 31, 0.05);
}

.goal-card-active {
  background: var(--accent);
  color: #fbfaf7;
  box-shadow: none;
}

.goal-card-active:hover {
  box-shadow: 0 6px 14px rgba(124, 140, 255, 0.14);
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
  padding-top: 2px;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 28px;
  padding: 4px 9px;
  border-radius: 999px;
  border: 0;
  background: rgba(251, 250, 247, 0.85);
  color: var(--text-main);
  font-size: 14px;
  line-height: 1;
  transition:
    transform var(--ease),
    background var(--ease),
    color var(--ease),
    border-color var(--ease),
    box-shadow var(--ease),
    opacity var(--ease);
}

.chip:hover {
  transform: translateY(-1px);
  background: #fbfaf7;
  box-shadow: 0 8px 16px rgba(31, 31, 31, 0.08);
}

.chip-danger:hover {
  background: rgba(209, 73, 91, 0.08);
}

.goal-card-active .chip {
  background: rgba(251, 250, 247, 0.92);
}

.goal-card-active .chip:hover {
  background: #fbfaf7;
}

.chip-icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
  user-select: none;
}

.goal-pane-enter-active,
.goal-pane-leave-active {
  transition: opacity var(--ease), transform var(--ease);
}

.goal-pane-enter-from,
.goal-pane-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.goal-cards-enter-active,
.goal-cards-appear-active {
  transition: opacity var(--ease), transform var(--ease);
  transition-delay: var(--goal-delay, 0ms);
}

.goal-cards-leave-active {
  transition: opacity var(--ease), transform var(--ease);
}

.goal-cards-move {
  transition: transform var(--ease);
}

.goal-cards-enter-from,
.goal-cards-appear-from,
.goal-cards-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.97);
}

.empty-text {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
  padding: 0;
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
