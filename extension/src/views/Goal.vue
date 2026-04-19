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
      <p class="list-title">Мои цели</p>

      <ul v-if="store.goals.length > 0" class="goal-list">
        <li v-for="goal in store.goals" :key="goal.id">
          <div class="goal-item-box" :class="{ 'goal-item-box-active': store.selectedGoalId === goal.id }">
            <button
              type="button"
              class="goal-item"
              @click="selectCustomGoal(goal.id)"
            >
              <span class="goal-item-title">{{ goal.title }}</span>
              <span v-if="goal.description" class="goal-item-text">{{ goal.description }}</span>
            </button>

            <button type="button" class="goal-edit-btn" @click="openEditForm(goal)">
              Изменить
            </button>
          </div>
        </li>
      </ul>

      <p v-else class="empty-text">целей пока что нет :(</p>
    </section>

    <GoalFormModal
      :is-open="isFormOpen"
      :title="formTitle"
      :form="form"
      :helper-text="helperText"
      :has-validation-error="hasValidationError"
      :is-blacklist-open="isBlacklistOpen"
      @close="closeGoalForm"
      @submit="submitGoal"
      @input="handleFormInput"
      @toggle-blacklist="toggleBlacklist"
    />
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import GoalFormModal from '../components/GoalFormModal.vue'
import { useAppStore } from '../stores/appStore'
import { normalizeTitle } from '../utils/goalUtils.js'

const DEFAULT_HELPER_TEXT = 'Опиши цель конкретно, чтобы анализ понимал, какие сайты и действия полезны.'

const store = useAppStore()
const isFormOpen = ref(false)
const isSubmitAttempted = ref(false)
const isBlacklistOpen = ref(false)

const activeTab = computed(() => {
  return isFormOpen.value || !store.isFreeGoalSelected ? 'create' : 'free'
})

const form = reactive({
  id: null,
  title: '',
  description: '',
  blacklistSitesText: ''
})

const formTitle = computed(() => {
  return form.id ? 'Редактировать цель' : 'Новая цель'
})

function parseBlacklistSites(value) {
  return value.split('\n').map((site) => site.trim()).filter(Boolean)
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
  if (!form.title && !form.description && !form.blacklistSitesText) {
    isSubmitAttempted.value = false
  }
}

function resetForm() {
  form.id = null
  form.title = ''
  form.description = ''
  form.blacklistSitesText = ''
  isSubmitAttempted.value = false
  isBlacklistOpen.value = false
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
  form.blacklistSitesText = Array.isArray(goal.blacklistSites) ? goal.blacklistSites.join('\n') : ''
  isSubmitAttempted.value = false
  isBlacklistOpen.value = false
}

async function selectCustomGoal(goalId) {
  await store.selectGoal(goalId)
}

function closeGoalForm() {
  isFormOpen.value = false
  resetForm()
}

function toggleBlacklist() {
  isBlacklistOpen.value = !isBlacklistOpen.value
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
    blacklistSites: parseBlacklistSites(form.blacklistSitesText)
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
  gap: 8px;
  position: relative;
  min-height: 0;
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

.goal-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 8px 8px 4px 8px;
  min-height: 36px;
  border-radius: 8px;
  border: 1px solid #3a3a3a;
  background: #111111;
  color: #f2f2f2;
  font-size: 9px;
  transition: all 0.4s ease-in-out;
}

.action-btn-active {
  background: #ffffff;
  color: #090909;
}

.action-btn:not(.action-btn-active):hover {
  border-color: #f6f6f6;
  background: #181818;
  color: #ffffff;
}

.action-btn-active:hover {
  opacity: 0.9;
  background: #ffffff;
  color: #090909;
}

.goal-list-card {
  border: 1px solid #2d2d2d;
  border-radius: 11px;
  background: #111111;
  padding: 9px;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  gap: 7px;
  overflow: hidden;
}

.list-title {
  color: #a9a9a9;
  font-size: 8px;
  font-weight: bold;
}

.goal-list {
  margin: 0;
  padding: 0 4px 0 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 6px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #666666 #171717;
}

.goal-list::-webkit-scrollbar {
  width: 8px;
}

.goal-list::-webkit-scrollbar-track {
  background: #171717;
  border-radius: 999px;
}

.goal-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #5c5c5c, #3f3f3f);
  border-radius: 999px;
  border: 1px solid #1f1f1f;
}

.goal-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #737373, #525252);
}

.goal-item {
  flex: 1;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.goal-item-box {
  width: 100%;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  background: #181818;
  color: #efefef;
  padding: 10px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  transition: all 0.4s ease-in-out;
}

.goal-item-box:hover {
  border-color: #5f5f5f;
}

.goal-item-box-active {
  border-color: #ffffff;
  background: #ffffff;
  color: #090909;
}

.goal-item-box-active:hover {
  border-color: #ffffff;
  background: #ffffff;
  color: #090909;
}

.goal-edit-btn {
  flex-shrink: 0;
  min-width: 76px;
  min-height: 28px;
  padding: 8px 10px 6px;
  border-radius: 7px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #3f3f3f;
  font-size: 8px;
  transition: transform 0.4s ease-in-out;
}

.goal-edit-btn:hover {
  transform: scale(1.01);
}

.goal-item-box-active .goal-edit-btn {
  border-color: #3a3a3a;
  background: #111111;
  color: #f2f2f2;
}

.goal-item-box-active .goal-edit-btn:hover {
  transform: scale(1.01);
}

.goal-item-title {
  font-size: 8px;
  line-height: 2;
  max-height: 1.4em;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.goal-item-text {
  font-size: 8px;
  color: #a8a8a8;
  line-height: 2;
  max-height: 3.9em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.goal-item-box-active .goal-item-text {
  color: #6a6a6a;
}

.empty-text {
  color: #9a9a9a;
  font-size: 9px;
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
