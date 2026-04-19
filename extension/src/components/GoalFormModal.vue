<template>
  <Transition name="alert-fade">
    <div v-if="isOpen" class="alert-overlay" @click.self="$emit('close')">
      <form class="alert-card" @submit.prevent="$emit('submit')">
        <h2>{{ title }}</h2>

        <input
          v-model="form.title"
          @input="$emit('input')"
          class="field"
          type="text"
          placeholder="Название"
        />

        <textarea
          v-model="form.description"
          @input="$emit('input')"
          class="field field-area"
          rows="3"
          placeholder="Описание"
        ></textarea>

        <p class="helper" :class="{ 'helper-error': hasValidationError }">
          {{ helperText }}
        </p>

        <div class="extra-block">
          <button type="button" class="extra-toggle" @click="$emit('toggle-blacklist')">
            <span>Чёрный список сайтов</span>
            <span class="extra-toggle-mark">{{ isBlacklistOpen ? '−' : '+' }}</span>
          </button>

          <Transition name="blacklist-fade">
            <textarea
              v-if="isBlacklistOpen"
              v-model="form.blacklistSitesText"
              @input="$emit('input')"
              class="field field-area field-area-small"
              rows="4"
              placeholder="youtube.com&#10;vk.com"
            ></textarea>
          </Transition>
        </div>

        <div class="alert-actions">
          <button type="submit" class="save-btn">Сохранить</button>
          <button type="button" class="cancel-btn" @click="$emit('close')">Отмена</button>
        </div>
      </form>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  title: String,
  form: Object,
  helperText: String,
  hasValidationError: Boolean,
  isBlacklistOpen: Boolean
})

defineEmits(['close', 'submit', 'input', 'toggle-blacklist'])
</script>

<style scoped>
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
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #666666 #171717;
}

.alert-card::-webkit-scrollbar {
  width: 8px;
}

.alert-card::-webkit-scrollbar-track {
  background: #171717;
  border-radius: 999px;
}

.alert-card::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #5c5c5c, #3f3f3f);
  border-radius: 999px;
  border: 1px solid #1f1f1f;
}

.alert-card::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #737373, #525252);
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

.extra-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.extra-toggle {
  width: 100%;
  min-height: 32px;
  padding: 8px 10px 6px;
  border-radius: 8px;
  border: 1px solid #333333;
  background: #101010;
  color: #f0f0f0;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.4s ease-in-out;
}

.extra-toggle-mark {
  color: #8a8a8a;
  font-size: 10px;
}

.field-area-small {
  min-height: 88px;
  max-height: 120px;
  font-size: 9px;
  line-height: 2;
}

.alert-actions {
  display: flex;
  gap: 6px;
}

.save-btn,
.cancel-btn {
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

.blacklist-fade-enter-active,
.blacklist-fade-leave-active {
  transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out;
}

.blacklist-fade-enter-from,
.blacklist-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
