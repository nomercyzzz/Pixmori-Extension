<template>
  <SuccessScreen v-if="loginSuccess" />

  <main v-else class="login-page">
    <section class="login-panel">
      <div class="login-header">
        <h1 class="login-heading">Войти в аккаунт</h1>
      </div>

      <div class="login-stack">
        <button
          type="button"
          class="provider-card provider-card-google"
          :disabled="isBusy"
          @click="continueWithProvider('google')"
        >
          <span class="provider-card-icon">
            <span v-if="loadingProvider === 'google'" class="provider-spinner"></span>
            <img
              v-else
              :src="googleIcon"
              alt="Google"
              draggable="false"
            />
          </span>

          <span class="provider-card-content">
            <span class="provider-card-title">войти через Google</span>
          </span>
        </button>

        <button
          type="button"
          class="provider-card provider-card-github"
          :disabled="isBusy"
          @click="continueWithProvider('github')"
        >
          <span class="provider-card-icon provider-card-icon-light">
            <span
              v-if="loadingProvider === 'github'"
              class="provider-spinner provider-spinner-dark"
            ></span>
            <img
              v-else
              :src="githubIcon"
              alt="GitHub"
              draggable="false"
            />
          </span>

          <span class="provider-card-content">
            <span class="provider-card-title">войти через GitHub</span>
          </span>
        </button>
      </div>

      <div class="email-block">
        <div class="login-divider" aria-hidden="true">
          <span>или</span>
        </div>

        <input
          id="email-input"
          type="email"
          placeholder="Вход по почте скоро появиться"
          class="email-input"
          autocomplete="off"
          aria-label="Почта"
          disabled
        />

        <button
          type="button"
          class="email-submit"
          disabled
        >
          Скоро будет доступно
        </button>
      </div>

      <p v-if="errorMessage" class="login-error">
        {{ errorMessage }}
      </p>

      <p class="login-register">
        нет аккаунта?
        <button type="button" class="login-register-link">
          зарегистрироваться
        </button>
      </p>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import githubIcon from '../assets/icons/github.svg'
import googleIcon from '../assets/icons/google.svg'
import { supabase } from '../lib/supabase.js'
import SuccessScreen from './SuccessScreen.vue'

const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID

const errorMessage = ref('')
const loadingProvider = ref('')
const loginSuccess = ref(false)

const isBusy = computed(() => Boolean(loadingProvider.value))

let authSubscription = null

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const providerError = params.get('error_description') ?? params.get('error')

  if (providerError) {
    errorMessage.value = decodeURIComponent(providerError)
    clearAuthUrl()
    return
  }

  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      loadingProvider.value = ''
      clearAuthUrl()
      await sendSessionToExtension(session)
      loginSuccess.value = true
    }
  })

  authSubscription = data.subscription
})

onUnmounted(() => {
  authSubscription?.unsubscribe()
})

async function continueWithProvider(provider) {
  errorMessage.value = ''
  loadingProvider.value = provider

  try {
    const redirectTo = new URL('/', window.location.origin).toString()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })

    if (error) throw error
  } catch (error) {
    errorMessage.value = String(error?.message ?? error ?? 'Не удалось открыть авторизацию.')
    loadingProvider.value = ''
  }
}

async function sendSessionToExtension(session) {
  if (!EXTENSION_ID) {
    console.warn('[pixmori] VITE_EXTENSION_ID не задан')
    return
  }

  if (typeof chrome === 'undefined' || !chrome?.runtime?.sendMessage) {
    console.warn('[pixmori] chrome.runtime недоступен')
    return
  }

  try {
    await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { type: 'PIXMORI_SESSION', session },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve(response)
          }
        }
      )
    })
  } catch (error) {
    console.warn('[pixmori] Не удалось передать сессию в расширение:', error.message)
  }
}

function clearAuthUrl() {
  const cleanUrl = `${window.location.origin}${window.location.pathname}`
  window.history.replaceState({}, document.title, cleanUrl)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.login-panel {
  width: 100%;
  max-width: 430px;
  padding: 28px;
  border: 1px solid var(--px-border);
  border-radius: 24px;
  background: var(--px-bg-card);
  box-shadow: var(--px-shadow-card);
  animation: panel-fade-in 0.4s ease-in-out;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.login-heading {
  margin: 0;
  color: var(--px-text);
  font-family: var(--px-font-body);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
}

.login-stack {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--px-border);
  border-radius: 18px;
  background: var(--px-bg-card);
  transition:
    transform var(--px-ease),
    border-color var(--px-ease),
    background var(--px-ease),
    box-shadow var(--px-ease);
}

.provider-card:hover {
  transform: translateY(-2px);
  border-color: var(--px-border-strong);
  box-shadow: var(--px-shadow-soft);
}

.provider-card:active {
  transform: translateY(0);
}

.provider-card:disabled {
  pointer-events: none;
  opacity: 0.76;
}

.provider-card-google {
  background: var(--px-accent);
  border-color: var(--px-accent);
  color: #fbfaf7;
}

.provider-card-google:hover {
  background: var(--px-accent-hover);
  border-color: var(--px-accent-hover);
}

.provider-card-github:hover {
  background: var(--px-bg-card-hover);
}

.provider-card-icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.16);
}

.provider-card-icon-light {
  border: 1px solid var(--px-border);
  background: #fffdf9;
}

.provider-card-icon img {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

.provider-card-content {
  display: flex;
  align-items: center;
  min-width: 0;
  text-align: left;
}

.provider-card-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.email-block {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.login-divider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-divider::before,
.login-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--px-border);
}

.login-divider span {
  color: var(--px-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.email-input {
  width: 100%;
  min-height: 50px;
  padding: 14px 16px;
  border: 1px solid var(--px-border);
  border-radius: 16px;
  background: #fffdf9;
  color: var(--px-text);
  transition:
    border-color var(--px-ease),
    background var(--px-ease),
    transform var(--px-ease);
}

.email-input::placeholder {
  color: var(--px-muted);
}

.email-input:focus {
  outline: none;
  border-color: var(--px-border-strong);
  background: #ffffff;
}

.email-submit {
  width: 100%;
  min-height: 50px;
  padding: 12px 16px;
  border: 1px solid var(--px-border);
  border-radius: 16px;
  background: #ebe6dc;
  color: #8b847a;
  font-size: 14px;
  font-weight: 700;
  transition:
    transform var(--px-ease),
    border-color var(--px-ease),
    background var(--px-ease),
    color var(--px-ease);
}

.email-submit:hover {
  transform: translateY(-2px);
}

.email-submit:disabled {
  cursor: default;
}

.login-error {
  margin: 14px 0 0;
  padding: 12px 14px;
  border: 1px solid rgba(209, 73, 91, 0.2);
  border-radius: 14px;
  background: rgba(209, 73, 91, 0.08);
  color: var(--px-danger);
  font-size: 13px;
}

.login-register {
  margin: 18px 0 0;
  text-align: center;
  color: var(--px-muted);
  font-size: 13px;
}

.login-register-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--px-accent-hover);
  font-weight: 700;
  transition: opacity var(--px-ease);
}

.login-register-link:hover {
  opacity: 0.72;
}

.provider-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.28);
  border-top-color: currentColor;
  border-radius: 999px;
  animation: login-spin 0.8s linear infinite;
}

.provider-spinner-dark {
  border-color: rgba(31, 31, 31, 0.14);
  border-top-color: var(--px-text);
}

@keyframes panel-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes login-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 420px) {
  .login-panel {
    padding: 24px 20px;
  }
}
</style>
