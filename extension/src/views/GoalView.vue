<template>
  <section class="goal-page">
    <div class="goal-actions">
      <button
        class="action-btn"
        :class="{ 'action-btn-active': activeTab === 'default' }"
        type="button"
        @click="selectDefault"
      >
        По умолчанию
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

    <section class="goal-list-card">
      <p class="list-title">Список целей</p>

      <ul v-if="store.goals.length > 0" class="goal-list">
        <li v-for="goal in store.goals" :key="goal.id">
          <button
            type="button"
            class="goal-item"
            :class="{ 'goal-item-active': store.selectedGoalId === goal.id }"
            @click="selectCustomGoal(goal.id)"
          >
            <span class="goal-item-title">{{ goal.title }}</span>
            <span v-if="goal.description" class="goal-item-text">{{ goal.description }}</span>
          </button>
        </li>
      </ul>

      <p v-else class="empty-text">целей пока что нет :(</p>
    </section>

    <Transition name="alert-fade">
      <div v-if="isFormOpen" class="alert-overlay" @click.self="closeCreateForm">
        <form class="alert-card" @submit.prevent="submitGoal">
          <h2>Новая цель</h2>

          <input
            v-model="form.title"
            @input="handleFormInput"
            class="field"
            type="text"
            placeholder="Название"
          />

          <textarea
            v-model="form.description"
            @input="handleFormInput"
            class="field field-area"
            rows="3"
            placeholder="Описание"
          ></textarea>

          <p class="helper" :class="{ 'helper-error': hasValidationError }">
            {{ helperText }}
          </p>

          <div class="alert-actions">
            <button type="submit" class="save-btn">Сохранить</button>
            <button type="button" class="cancel-btn" @click="closeCreateForm">Отмена</button>
          </div>
        </form>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useAppStore } from '../stores/appStore'

const DEFAULT_HELPER_TEXT = 'Опиши цель конкретно, чтобы анализ понимал, какие сайты и действия полезны.'

const store = useAppStore()
const isFormOpen = ref(false)
const isSubmitAttempted = ref(false)

const activeTab = computed(() => {
  return isFormOpen.value || !store.isDefaultGoalSelected ? 'create' : 'default'
})

const form = reactive({
  title: '',
  description: ''
})

function normalizeTitle(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
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
    const hasDuplicate = store.goals.some((goal) => normalizeTitle(goal.title) === normalizedTitle)

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
  if (!form.title && !form.description) {
    isSubmitAttempted.value = false
  }
}

async function selectDefault() {
  await store.setDefaultGoal()
  closeCreateForm()
}

function openCreateForm() {
  isFormOpen.value = true
  form.title = ''
  form.description = ''
  isSubmitAttempted.value = false
}

async function selectCustomGoal(goalId) {
  await store.selectGoal(goalId)
}

function closeCreateForm() {
  isFormOpen.value = false
  form.title = ''
  form.description = ''
  isSubmitAttempted.value = false
}

async function submitGoal() {
  isSubmitAttempted.value = true

  if (helperText.value !== DEFAULT_HELPER_TEXT) {
    return
  }

  const saved = await store.saveCustomGoal(form)

  if (!saved) return

  isSubmitAttempted.value = false
  form.title = ''
  form.description = ''
  closeCreateForm()
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

.goal-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex:1;
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
  text-transform: uppercase;
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
  width: 100%;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  background: #181818;
  color: #efefef;
  padding: 10px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.4s ease-in-out;
}

.goal-item:hover {
  border-color: #5f5f5f;
}

.goal-item-active {
  border-color: #ffffff;
  background: #ffffff;
  color: #090909;
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

.goal-item-active .goal-item-text {
  color: #6a6a6a;
}

.empty-text {
  color: #9a9a9a;
  font-size: 9px;
}

.alert-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.alert-card {
  width: 100%;
  min-height: 318px;
  max-height: calc(100% - 8px);
  border: 1px solid #3d3d3d;
  border-radius: 12px;
  background: #151515;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.alert-card h2 {
  margin: 0;
  font-size: 11px;
}

.field {
  width: 100%;
  border: 1px solid #333333;
  border-radius: 9px;
  background: #0f0f0f;
  color: #f0f0f0;
  min-height: 36px;
  padding: 10px 11px 8px;
  font-size: 9px;
  line-height: 2;
  transition: border-color 0.4s ease-in-out;
}

.field:focus {
  outline: none;
  border-color: #6a6a6a;
}

.field-area {
  line-height: 2;
  min-height: 122px;
  max-height: 182px;
  resize: none;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #666666 #171717;
}

.field-area::-webkit-scrollbar {
  width: 8px;
}

.field-area::-webkit-scrollbar-track {
  background: #171717;
  border-radius: 999px;
}

.field-area::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #5c5c5c, #3f3f3f);
  border-radius: 999px;
  border: 1px solid #1f1f1f;
}

.field-area::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #737373, #525252);
}

.helper {
  margin: 0;
  color: #a3a3a3;
  font-size: 9px;
  line-height: 1.35;
}
.helper-error {
  color: #ff6b6b;
}

.alert-actions {
  display: flex;
  gap: 6px;
}

.save-btn, .cancel-btn {
  flex: 1;
  min-height: 32px;
  border-radius: 8px;
  border: 1px solid #4c4c4c;
  background: #1a1a1a;
  color: #f3f3f3;
  font-size: 9px;
  transition: all 0.4s ease-in-out;
}

.save-btn {
  border-color: #ffffff;
  background: #ffffff;
  color: #0b0b0b;
}

.save-btn:hover {
  opacity: 0.9;
}

.cancel-btn:hover {
  border-color: #f6f6f6;
  background: #181818;
}

.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: opacity 0.4s ease-in-out;
}

.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
}
</style>
