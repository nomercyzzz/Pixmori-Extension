import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAppStore } from './stores/appStore'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

async function bootstrap() {
  const store = useAppStore(pinia)
  await store.loadFromStorage()
  app.mount('#app')
}

bootstrap()
