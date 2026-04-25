const PET_KEY = 'pixmori-pet'
const GOALS_KEY = 'pixmori-goals'
const ANALYZE_DELAY_MS = 3000
const ANALYZE_ALARM_NAME = 'pixmori-analyze-page'

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

chrome.tabs.onActivated.addListener(() => {
  scheduleAnalysis('tabActivated').catch((error) => {
    logWorkerEvent('error', 'tabActivated', 'Не удалось запланировать анализ', error)
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.active) {
    return
  }

  scheduleAnalysis('tabUpdated').catch((error) => {
    logWorkerEvent('error', 'tabUpdated', 'Не удалось запланировать анализ', error)
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
    return
  }

  await analyzeCurrentActiveTab(trigger, monitorState)
}

async function analyzeCurrentActiveTab(trigger, cachedState) {
  try {
    const monitorState = cachedState ?? (await loadMonitorState())

    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    })

    if (!tab?.id || !tab.url) {
      throw new Error('Не удалось найти активную вкладку.')
    }

    if (!/^https?:\/\//i.test(tab.url)) {
      throw new Error('Эта страница не поддерживается для проверки.')
    }

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
    throw error
  }
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

function analyzeSnapshot(snapshot, goal, blacklistSites) {
  const domain = normalizeDomain(snapshot.domain || snapshot.url || '')
  const matchedBlacklist = findMatchedBlacklist(snapshot, blacklistSites)
  const goalText = `${goal?.title || ''} ${goal?.description || ''}`
  const goalKeywords = extractKeywords(goalText)
  const goalPhrases = extractKeyPhrases(goal)
  const pageIndex = buildPageIndex(snapshot)
  const titleMatches = matchKeywords(goalKeywords, pageIndex.titleTokens)
  const headingMatches = matchKeywords(goalKeywords, pageIndex.headingTokens)
  const metaMatches = matchKeywords(goalKeywords, pageIndex.metaTokens)
  const bodyMatches = matchKeywords(goalKeywords, pageIndex.bodyTokens)
  const phraseMatches = goalPhrases.filter((phrase) => pageIndex.fullText.includes(phrase)).slice(0, 4)
  const matches = uniqueItems([
    ...titleMatches,
    ...headingMatches,
    ...metaMatches,
    ...bodyMatches
  ]).slice(0, 8)
  const score =
    titleMatches.length * 4 +
    headingMatches.length * 3 +
    metaMatches.length * 2 +
    bodyMatches.length +
    phraseMatches.length * 5
  const coverage = goalKeywords.length ? Math.min(100, Math.round((matches.length / goalKeywords.length) * 100)) : 0

  if (matchedBlacklist) {
    return {
      status: 'не подходит',
      trigger: 'blacklist',
      domain,
      title: snapshot.title || 'Без названия',
      matchedBlacklist,
      matches,
      score,
      coverage,
      reason: 'Страница попала в список исключений для этой цели.'
    }
  }

  if (
    score >= 8 ||
    phraseMatches.length > 0 ||
    (titleMatches.length >= 1 && headingMatches.length >= 1) ||
    (titleMatches.length >= 1 && bodyMatches.length >= 2)
  ) {
    return {
      status: 'подходит',
      trigger: 'content-match',
      domain,
      title: snapshot.title || 'Без названия',
      matchedBlacklist: null,
      matches,
      score,
      coverage,
      titleMatches,
      headingMatches,
      metaMatches,
      bodyMatches,
      phraseMatches,
      reason: buildMatchReason({
        titleMatches,
        headingMatches,
        metaMatches,
        bodyMatches,
        phraseMatches
      })
    }
  }

  return {
    status: 'нейтрально',
    trigger: 'neutral',
    domain,
    title: snapshot.title || 'Без названия',
    matchedBlacklist: null,
    matches,
    score,
    coverage,
    titleMatches,
    headingMatches,
    metaMatches,
    bodyMatches,
    phraseMatches,
    reason:
      matches.length > 0
        ? 'Есть частичное совпадение по теме, но сигнал пока недостаточно сильный.'
        : 'На странице почти нет признаков выбранной цели.'
  }
}

async function loadStoredState(key) {
  const data = await chrome.storage.local.get(key)
  return data[key]
}

function buildPageIndex(snapshot) {
  const titleText = normalizeText(snapshot.title)
  const headingText = normalizeText((snapshot.headings || []).join(' '))
  const metaText = normalizeText(snapshot.metaDescription)
  const bodyText = normalizeText(snapshot.textExcerpt)

  return {
    fullText: normalizeText([titleText, headingText, metaText, bodyText].join(' ')).toLowerCase(),
    titleTokens: extractKeywords(titleText),
    headingTokens: extractKeywords(headingText),
    metaTokens: extractKeywords(metaText),
    bodyTokens: extractKeywords(bodyText)
  }
}

function buildMatchReason({ titleMatches, headingMatches, metaMatches, bodyMatches, phraseMatches }) {
  if (phraseMatches.length > 0) {
    return 'Страница хорошо совпадает с целью по ключевым фразам и содержанию.'
  }

  if (titleMatches.length > 0 && headingMatches.length > 0) {
    return 'Тема цели совпадает и в заголовке страницы, и в её основных разделах.'
  }

  if (titleMatches.length > 0 && bodyMatches.length > 0) {
    return 'Ключевая тема видна и в заголовке, и в основном тексте страницы.'
  }

  if (metaMatches.length > 0 && bodyMatches.length > 0) {
    return 'Описание страницы и её основной текст совпадают с выбранной целью.'
  }

  return 'Страница заметно связана с выбранной целью.'
}

function matchKeywords(goalKeywords, pageTokens) {
  return goalKeywords.filter((keyword) =>
    pageTokens.some((token) => isRelatedToken(keyword, token))
  )
}

function isRelatedToken(left, right) {
  if (!left || !right) {
    return false
  }

  if (left === right) {
    return true
  }

  const leftRoot = normalizeTokenForMatch(left)
  const rightRoot = normalizeTokenForMatch(right)

  return leftRoot.length >= 4 && rightRoot.length >= 4 && leftRoot === rightRoot
}

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))]
}

function findMatchedBlacklist(snapshot, blacklistSites) {
  const domain = normalizeDomain(snapshot.domain || snapshot.url || '')
  const normalizedUrl = normalizeUrl(snapshot.url || '')

  return (
    blacklistSites.find((site) => {
      const normalizedSite = normalizeUrl(site)
      const siteDomain = normalizeDomain(normalizedSite)

      if (!siteDomain) {
        return false
      }

      if (domain !== siteDomain && !domain.endsWith(`.${siteDomain}`)) {
        return false
      }

      if (!normalizedSite.includes('/')) {
        return true
      }

      return normalizedUrl === normalizedSite || normalizedUrl.startsWith(`${normalizedSite}/`)
    }) ?? null
  )
}

function extractPageSnapshot() {
  const mainNode =
    document.querySelector('main') ||
    document.querySelector('article') ||
    document.querySelector('[role="main"]') ||
    document.body

  const rawText = mainNode?.innerText || mainNode?.textContent || ''
  const textExcerpt = normalizeText(rawText).slice(0, 12000)
  const headings = [...document.querySelectorAll('h1, h2, h3, [role="heading"]')]
    .map((node) => normalizeText(node.textContent || ''))
    .filter(Boolean)
    .slice(0, 12)
  const metaDescription = normalizeText(
    document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
  )

  return {
    url: window.location.href,
    domain: window.location.hostname.replace(/^www\./i, ''),
    title: normalizeText(document.title),
    headings,
    metaDescription,
    textExcerpt
  }
}

function extractKeywords(value) {
  return [
    ...new Set(
      tokenize(value)
        .filter((token) => token.length >= 4 && !STOP_WORDS.has(token))
        .map((token) => normalizeTokenForMatch(token))
        .filter((token) => token.length >= 4)
    )
  ]
}

function extractKeyPhrases(goal) {
  const source = `${goal?.title || ''}. ${goal?.description || ''}`
  const words = tokenize(source).filter((token) => token.length >= 3 && !STOP_WORDS.has(token))
  const phrases = []

  for (let size = 2; size <= 4; size += 1) {
    for (let index = 0; index <= words.length - size; index += 1) {
      const phrase = words.slice(index, index + size).join(' ')

      if (phrase.length >= 10) {
        phrases.push(phrase)
      }
    }
  }

  return uniqueItems(phrases).slice(0, 10)
}

function tokenize(value) {
  return normalizeText(value)
    .toLowerCase()
    .split(/[^0-9a-zа-яё]+/i)
    .filter(Boolean)
}

function normalizeBlacklistSites(sites) {
  if (!Array.isArray(sites)) {
    return []
  }

  return sites.map((site) => normalizeUrl(site)).filter(Boolean)
}

function normalizeDomain(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[?#].*$/, '')
    .replace(/\/.*$/, '')
}

function normalizeUrl(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '')
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeTokenForMatch(token) {
  let normalized = String(token ?? '').toLowerCase()

  for (const suffix of WORD_SUFFIXES) {
    if (normalized.length - suffix.length >= 4 && normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length)
      break
    }
  }

  return normalized
}

const WORD_SUFFIXES = [
  'иями',
  'ями',
  'ами',
  'иях',
  'ях',
  'ах',
  'ого',
  'ему',
  'ому',
  'ыми',
  'ими',
  'ов',
  'ев',
  'ом',
  'ем',
  'ам',
  'ям',
  'ий',
  'ый',
  'ой',
  'ая',
  'яя',
  'ое',
  'ее',
  'ые',
  'ие',
  'ую',
  'юю',
  'ия',
  'ие',
  'ий',
  'иям',
  'ияx',
  'ing',
  'ers',
  'ies',
  'ied',
  'ed',
  'es',
  's',
  'а',
  'я',
  'ы',
  'и',
  'е',
  'у',
  'ю',
  'о'
]

const STOP_WORDS = new Set([
  'а',
  'без',
  'бы',
  'в',
  'вам',
  'вас',
  'весь',
  'все',
  'всё',
  'вы',
  'где',
  'да',
  'для',
  'до',
  'его',
  'ее',
  'её',
  'если',
  'есть',
  'еще',
  'ещё',
  'же',
  'за',
  'здесь',
  'и',
  'из',
  'или',
  'им',
  'их',
  'к',
  'как',
  'ко',
  'когда',
  'кто',
  'ли',
  'либо',
  'мне',
  'можно',
  'мы',
  'на',
  'над',
  'не',
  'него',
  'нее',
  'неё',
  'нет',
  'но',
  'ну',
  'о',
  'об',
  'обо',
  'он',
  'она',
  'они',
  'оно',
  'от',
  'по',
  'под',
  'при',
  'про',
  'с',
  'со',
  'так',
  'также',
  'там',
  'тем',
  'то',
  'того',
  'тоже',
  'только',
  'том',
  'ты',
  'у',
  'уже',
  'чего',
  'чем',
  'что',
  'чтобы',
  'это',
  'этот',
  'эту',
  'я',
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'how',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'with'
])
