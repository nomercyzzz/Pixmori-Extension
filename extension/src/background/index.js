import { analyzeSnapshot, extractPageSnapshot, normalizeBlacklistSites } from './analyzer.js'

const PET_KEY = 'pixmori-pet'
const GOALS_KEY = 'pixmori-goals'
const SESSION_KEY = 'pixmori-session'
const ANALYZE_DELAY_MS = 3000
const ANALYZE_ALARM_NAME = 'pixmori-analyze-page'

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'PIXMORI_SESSION') {
    return false
  }

  const session = message.session

  if (!session?.access_token || !session?.refresh_token) {
    logWorkerEvent('warn', 'authBridge', 'Получена невалидная сессия - отклонена')
    sendResponse({ ok: false, error: 'invalid_session' })
    return false
  }

  chrome.storage.local.set({ [SESSION_KEY]: session }, () => {
    logWorkerEvent('info', 'authBridge', 'Сессия успешно сохранена')
    sendResponse({ ok: true })
  })

  return true
})

chrome.runtime.onInstalled.addListener(() => {
  logWorkerEvent('info', 'workerReady', 'Service worker готов к анализу')
})

chrome.runtime.onStartup.addListener(() => {
  logWorkerEvent('info', 'workerReady', 'Service worker запущен')
})

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || (!changes[PET_KEY] && !changes[GOALS_KEY])) {
    return
  }

  scheduleAnalysis('stateChanged').catch((error) => {
    logWorkerEvent('error', 'stateChanged', 'Не удалось запланировать анализ после изменения состояния', error)
  })
})

chrome.tabs.onActivated.addListener(() => {
  scheduleAnalysis('tabActivated').catch((error) => {
    logWorkerEvent('error', 'tabActivated', 'Не удалось запланировать анализ после смены вкладки', error)
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.active) {
    return
  }

  scheduleAnalysis('tabUpdated').catch((error) => {
    logWorkerEvent('error', 'tabUpdated', 'Не удалось запланировать анализ после загрузки вкладки', error)
  })
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ANALYZE_ALARM_NAME) {
    return
  }

  logWorkerEvent('info', 'delayedRun', 'Таймер сработал, запускаю анализ')
  runBackgroundAnalysis('delayedRun').catch((error) => {
    logWorkerEvent('error', 'delayedRun', 'Фоновый анализ завершился с ошибкой', error)
  })
})

function canRunAnalysis(monitorState) {
  if (!monitorState.enabled) return { ok: false, reason: 'питомец не активен' }
  if (!monitorState.goal) return { ok: false, reason: 'цель не выбрана' }
  return { ok: true }
}

async function scheduleAnalysis(trigger = 'auto') {
  const monitorState = await loadMonitorState()
  await chrome.alarms.clear(ANALYZE_ALARM_NAME)

  const check = canRunAnalysis(monitorState)
  if (!check.ok) {
    logWorkerEvent('warn', trigger, `Анализ пропущен: ${check.reason}`)
    return false
  }

  chrome.alarms.create(ANALYZE_ALARM_NAME, { when: Date.now() + ANALYZE_DELAY_MS })
  logWorkerEvent('info', trigger, `Анализ запланирован через ${ANALYZE_DELAY_MS} мс`)
  return true
}

async function runBackgroundAnalysis(trigger) {
  const monitorState = await loadMonitorState()
  const check = canRunAnalysis(monitorState)

  if (!check.ok) {
    logWorkerEvent('warn', trigger, `Фоновый анализ пропущен: ${check.reason}`)
    return null
  }

  return analyzeCurrentActiveTab(trigger, monitorState)
}

async function analyzeCurrentActiveTab(trigger, cachedState) {
  const monitorState = cachedState ?? (await loadMonitorState())
  const tab = await findActiveTab()

  if (!tab?.id || !tab.url) {
    logWorkerEvent('warn', trigger, 'Анализ пропущен: не удалось найти активную вкладку')
    return null
  }

  if (!/^https?:\/\//i.test(tab.url)) {
    logWorkerEvent('warn', trigger, 'Анализ пропущен: текущая вкладка не поддерживается')
    return null
  }

  try {
    const [injected] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageSnapshot
    })

    const snapshot = injected?.result
    if (!snapshot) {
      throw new Error('Не удалось прочитать страницу.')
    }

    const result = analyzeSnapshot(snapshot, monitorState.goal, monitorState.blacklistSites)
    logWorkerEvent('info', trigger, `Анализ завершён: ${result.status}`, result)
    return result
  } catch (error) {
    logWorkerEvent('error', trigger, 'Анализ завершился с ошибкой', error)
    return null
  }
}

async function findActiveTab() {
  const focusedTabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  const focusedTab = pickMostRecentTab(focusedTabs)

  if (focusedTab) {
    return focusedTab
  }

  const activeTabs = await chrome.tabs.query({ active: true })
  return pickMostRecentTab(activeTabs)
}

function pickMostRecentTab(tabs) {
  return [...tabs].filter(Boolean).sort((left, right) => (right?.lastAccessed ?? 0) - (left?.lastAccessed ?? 0))[0] ?? null
}

function logWorkerEvent(level, trigger, message, details) {
  const prefix = `[pixmori][${getTriggerLabel(trigger)}] ${message}`
  const normalizedDetails = normalizeLogDetails(details)
  const consoleMethod = console[level] || console.log

  if (normalizedDetails !== undefined) {
    consoleMethod(prefix, normalizedDetails)
  } else {
    consoleMethod(prefix)
  }
}

function getTriggerLabel(trigger) {
  if (trigger === 'workerReady') return 'service worker'
  if (trigger === 'stateChanged') return 'изменение состояния'
  if (trigger === 'tabActivated') return 'смена вкладки'
  if (trigger === 'tabUpdated') return 'загрузка вкладки'
  if (trigger === 'delayedRun') return 'отложенный запуск'
  return 'автопроверка'
}

function normalizeLogDetails(details) {
  if (details === undefined) {
    return undefined
  }

  if (details instanceof Error) {
    return {
      name: details.name,
      message: details.message,
      stack: details.stack
    }
  }

  return details
}

async function loadMonitorState() {
  const [pet, goalsState] = await Promise.all([
    loadStoredState(PET_KEY),
    loadStoredState(GOALS_KEY)
  ])
  const selectedGoalId = goalsState?.selectedGoalId ?? null
  const goals = Array.isArray(goalsState?.items) ? goalsState.items : []
  const goal = goals.find((item) => item.id === selectedGoalId && item.status !== 'closed') ?? null

  return {
    enabled: pet?.active === true,
    goal,
    blacklistSites: normalizeBlacklistSites(goal?.blacklistSites)
  }
}

async function loadStoredState(key) {
  const data = await chrome.storage.local.get(key)
  return data[key]
}
