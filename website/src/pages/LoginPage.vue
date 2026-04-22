<template>
  <main class="login-page">
    <section class="login-panel">
      <div class="login-header">
        <h1 class="login-brand">Вход в аккаунт</h1>
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
import { computed, onMounted, ref } from 'vue'
import githubIcon from '../assets/icons/github.svg'
import googleIcon from '../assets/icons/google.svg'
import { supabase } from '../lib/supabase.js'

const errorMessage = ref('')
const loadingProvider = ref('')

const isBusy = computed(() => Boolean(loadingProvider.value))

onMounted(async () => {
  await restoreSession()
})

async function restoreSession() {
  const params = new URLSearchParams(window.location.search)
  const providerError = params.get('error_description') ?? params.get('error')
  const code = params.get('code')

  if (providerError) {
    errorMessage.value = decodeURIComponent(providerError)
    clearAuthUrl()
    return
  }

  try {
    if (code) {
      loadingProvider.value = 'restore'

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        throw error
      }

      clearAuthUrl()
    }
  } catch (error) {
    errorMessage.value = String(error?.message ?? error ?? 'Не удалось открыть авторизацию.')
  } finally {
    loadingProvider.value = ''
  }
}

async function continueWithProvider(provider) {
  errorMessage.value = ''
  loadingProvider.value = provider

  try {
    const redirectTo = new URL('/', window.location.origin).toString()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })

    if (error) {
      throw error
    }
  } catch (error) {
    errorMessage.value = String(error?.message ?? error ?? 'Не удалось открыть авторизацию.')
    loadingProvider.value = ''
  }
}

function clearAuthUrl() {
  const cleanUrl = `${window.location.origin}${window.location.pathname}`
  window.history.replaceState({}, document.title, cleanUrl)
}
</script>
