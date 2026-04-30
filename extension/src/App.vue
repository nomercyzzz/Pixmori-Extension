<template>
  <div class="panel-shell">
    <template v-if="isReady">
      <template v-if="session">
        <main class="panel-main">
          <RouterView v-slot="{ Component }">
            <Transition name="view-fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </main>
        <BottomNav />
      </template>

      <div v-else class="auth-gate">
        <div class="auth-box">
          <p class="auth-text">Войдите в аккаунт</p>
          <p class="auth-desc">Чтобы начать работу в расширении</p>
          <button class="auth-btn" @click="openLoginPage">
            Войти
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import BottomNav from './components/BottomNav.vue'

const SESSION_KEY = 'pixmori-session'
const LOGIN_URL = 'http://localhost:5173'

const isReady = ref(false)
const session = ref(null)

onMounted(async () => {
  const data = await chrome.storage.local.get(SESSION_KEY)
  session.value = data[SESSION_KEY] ?? null
  isReady.value = true
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && SESSION_KEY in changes) {
    session.value = changes[SESSION_KEY].newValue ?? null
  }
})

function openLoginPage() {
  chrome.tabs.create({ url: LOGIN_URL })
}
</script>

<style scoped>
.auth-gate {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--bg-main);
}

.auth-box {
  width: 100%;
  max-width: 280px;
  padding: 32px 24px;
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.auth-text {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-body);
  color: var(--text-main);
  line-height: 1.2;
}

.auth-desc {
  margin: 4px 0 16px;
  font-size: 14px;
  font-family: var(--font-body);
  color: var(--text-main);
  opacity: 0.6;
  line-height: 1.4;
}

.auth-btn {
  width: 100%;
  padding: 12px 24px;
  background: var(--accent);
  color: var(--bg-card);
  border: 1px solid var(--accent);
  border-radius: 14px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition:
    transform var(--ease),
    background var(--ease),
    border-color var(--ease);
}

.auth-btn:hover {
  background: var(--accent-deep);
  border-color: var(--accent-deep);
  transform: translateY(-1px);
}

.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.4s ease-in-out, transform 0.4s ease-in-out;
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
