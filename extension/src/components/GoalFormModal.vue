<template>
  <Transition name="alert-fade">
    <div v-if="isOpen" class="alert-overlay" @click.self="emit('close')">
      <form class="alert-card" @submit.prevent="emit('submit')">
        <h2>{{ title }}</h2>

        <input
          v-model="form.title"
          @input="emit('input')"
          class="field"
          type="text"
          placeholder="Название"
        />

        <textarea
          v-model="form.description"
          @input="emit('input')"
          class="field field-area"
          rows="3"
          placeholder="Описание"
        ></textarea>

        <p class="helper" :class="{ 'helper-error': hasValidationError }">
          {{ helperText }}
        </p>

        <div class="extra-block">
          <div class="blacklist-head">
            <p class="blacklist-title">Чёрный список сайтов</p>
            <span class="blacklist-count">{{ filteredBlacklistSites.length }} / {{ form.blacklistSites.length }}</span>
          </div>

          <div class="blacklist-input-row">
            <input
              v-model="form.blacklistSiteDraft"
              @input="emit('input')"
              @keydown.enter.prevent="addBlacklistSite"
              class="field field-site"
              type="text"
              placeholder="Добавить сайт"
            />

            <button type="button" class="site-add-btn" @click="addBlacklistSite">
              Добавить
            </button>
          </div>

          <input
            v-model="form.blacklistSearch"
            @input="emit('input')"
            class="field field-search"
            type="text"
            placeholder="Поиск по чёрному списку"
          />

          <div class="blacklist-panel">
            <div v-if="filteredBlacklistSites.length > 0" class="blacklist-picked">
              <button
                v-for="site in filteredBlacklistSites"
                :key="site"
                type="button"
                class="site-chip site-chip-active"
                @click="removeBlacklistSite(site)"
              >
                <span>{{ site }}</span>
                <span class="site-chip-mark" aria-hidden="true">+</span>
              </button>
            </div>

            <p v-else class="blacklist-empty">
              {{
                form.blacklistSites.length > 0
                  ? 'Ничего не найдено'
                  : 'Сайты можно добавлять по желанию, а сам чёрный список будет автоматически пополняться от выбранной цели.'
              }}
            </p>
          </div>
        </div>

        <div class="alert-actions">
          <button type="submit" class="save-btn">Сохранить</button>
          <button type="button" class="cancel-btn" @click="emit('close')">Отмена</button>
        </div>
      </form>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  title: String,
  form: Object,
  helperText: String,
  hasValidationError: Boolean
})

const emit = defineEmits(['close', 'submit', 'input'])

function normalizeSite(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
}

const filteredBlacklistSites = computed(() => {
  const search = (props.form.blacklistSearch ?? '').trim().toLowerCase()
  const sites = Array.isArray(props.form.blacklistSites) ? props.form.blacklistSites : []
  if (!search) return sites
  return sites.filter((site) => site.toLowerCase().includes(search))
})

function addBlacklistSite() {
  const site = normalizeSite(props.form.blacklistSiteDraft ?? '')
  if (!site) return
  if (!props.form.blacklistSites.includes(site)) {
    props.form.blacklistSites.push(site)
  }
  props.form.blacklistSiteDraft = ''
  emit('input')
}

function removeBlacklistSite(site) {
  props.form.blacklistSites = props.form.blacklistSites.filter((item) => item !== site)
  emit('input')
}

function toggleBlacklistSite(site) {
  if (props.form.blacklistSites.includes(site)) {
    removeBlacklistSite(site)
    return
  }

  props.form.blacklistSites.push(site)
  emit('input')
}
</script>

<style scoped>
.alert-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(31, 31, 31, 0.48);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.alert-card {
  width: 100%;
  min-height: 318px;
  max-height: calc(100% - 8px);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  background: var(--bg-card);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border-soft) transparent;
}

.alert-card::-webkit-scrollbar {
  width: 8px;
}

.alert-card::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 999px;
}

.alert-card::-webkit-scrollbar-thumb {
  background: var(--border-soft);
  border-radius: 999px;
}

.alert-card::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.alert-card h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.field {
  width: 100%;
  border: 1px solid var(--border-soft);
  border-radius: 9px;
  background: var(--bg-main);
  color: var(--text-main);
  min-height: 36px;
  padding: 9px 11px;
  font-size: 14px;
  line-height: 1.4;
  transition: border-color 0.4s ease-in-out;
}

.field::placeholder {
  color: var(--text-muted);
}

.field:focus {
  outline: none;
  border-color: var(--accent);
}

.field-area {
  line-height: 1.5;
  min-height: 110px;
  max-height: 180px;
  resize: none;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border-soft) transparent;
}

.field-area::-webkit-scrollbar {
  width: 8px;
}

.field-area::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 999px;
}

.field-area::-webkit-scrollbar-thumb {
  background: var(--border-soft);
  border-radius: 999px;
}

.field-area::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.helper {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.4;
}

.helper-error {
  color: var(--danger);
}

.extra-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.blacklist-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.blacklist-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

.blacklist-count {
  font-size: 14px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.blacklist-input-row {
  display: flex;
  gap: 8px;
}

.field-site {
  min-height: 40px;
}

.field-search {
  min-height: 40px;
}

.blacklist-panel {
  min-height: 84px;
  max-height: 160px;
  padding: 4px 2px 2px 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border-soft) transparent;
}

.blacklist-panel::-webkit-scrollbar {
  width: 8px;
}

.blacklist-panel::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 999px;
}

.blacklist-panel::-webkit-scrollbar-thumb {
  background: var(--border-soft);
  border-radius: 999px;
}

.blacklist-panel::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.blacklist-picked {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.blacklist-empty {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.4;
}

.site-add-btn {
  min-width: 104px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 9px;
  border: 1px solid var(--border-soft);
  background: var(--bg-main);
  color: var(--text-main);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.4s ease-in-out;
}

.site-add-btn:hover {
  border-color: var(--text-muted);
  background: var(--bg-card);
}

.site-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-soft);
  background: var(--bg-main);
  color: var(--text-main);
  font-size: 14px;
  line-height: 1.3;
  transition: all 0.4s ease-in-out;
}

.site-chip:hover {
  border-color: var(--text-muted);
  transform: translateY(-1px);
}

.site-chip-selected,
.site-chip-active {
  background: var(--accent-soft);
  border-color: var(--accent-soft);
  color: var(--accent-deep);
}

.site-chip-active:hover {
  background: rgba(209, 73, 91, 0.08);
  border-color: rgba(209, 73, 91, 0.18);
  color: var(--danger);
}

.site-chip-mark {
  position: relative;
  top: -2px;
  font-size: 20px;
  line-height: 1;
  transform:rotate(45deg);
}

.alert-actions {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.save-btn,
.cancel-btn {
  flex: 1;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid var(--border-soft);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.4s ease-in-out;
}

.save-btn {
  border-color: var(--accent);
  background: var(--accent);
  color: #FBFAF7;
}

.save-btn:hover {
  background: var(--accent-deep);
  border-color: var(--accent-deep);
  opacity: 1;
}

.cancel-btn:hover {
  border-color: var(--text-muted);
  transform: translateY(-1px);
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
