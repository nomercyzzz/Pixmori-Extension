export const STOP_WORDS = new Set([
  'а', 'без', 'бы', 'в', 'вам', 'вас', 'весь', 'все', 'всё', 'вы', 'где', 'да', 'для',
  'до', 'его', 'ее', 'её', 'если', 'есть', 'еще', 'ещё', 'же', 'за', 'здесь', 'и', 'из',
  'или', 'им', 'их', 'к', 'как', 'ко', 'когда', 'кто', 'ли', 'либо', 'мне', 'можно',
  'мы', 'на', 'над', 'не', 'него', 'нее', 'неё', 'нет', 'но', 'ну', 'о', 'об', 'обо',
  'он', 'она', 'они', 'оно', 'от', 'по', 'под', 'при', 'про', 'с', 'со', 'так', 'также',
  'там', 'тем', 'то', 'того', 'тоже', 'только', 'том', 'ты', 'у', 'уже', 'чего', 'чем',
  'что', 'чтобы', 'это', 'этот', 'эту', 'я', 'a', 'an', 'and', 'are', 'as', 'at', 'be',
  'by', 'for', 'from', 'how', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this',
  'to', 'with'
])

const WORD_SUFFIXES = [
  'иями', 'ями', 'ами', 'иях', 'ях', 'ах', 'ого', 'ему', 'ому', 'ыми', 'ими', 'ов', 'ев',
  'ом', 'ем', 'ам', 'ям', 'ий', 'ый', 'ой', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие', 'ую', 'юю',
  'ия', 'иям', 'иях', 'ing', 'ers', 'ies', 'ied', 'ed', 'es', 's', 'а', 'я', 'ы', 'и', 'е',
  'у', 'ю', 'о'
]

export function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function normalizeDomain(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[?#].*$/, '')
    .replace(/\/.*$/, '')
}

export function normalizeUrl(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '')
}

export function normalizeBlacklistSites(sites) {
  if (!Array.isArray(sites)) return []
  return sites.map((site) => normalizeUrl(site)).filter(Boolean)
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

function tokenize(value) {
  return normalizeText(value).toLowerCase().split(/[^0-9a-zа-яё]+/i).filter(Boolean)
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

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))]
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

function matchKeywords(goalKeywords, pageTokens) {
  return goalKeywords.filter((keyword) => pageTokens.some((token) => isRelatedToken(keyword, token)))
}

function findMatchedBlacklist(snapshot, blacklistSites) {
  const domain = normalizeDomain(snapshot.domain || snapshot.url || '')
  const normalizedUrl = normalizeUrl(snapshot.url || '')

  return blacklistSites.find((site) => {
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

export function analyzeSnapshot(snapshot, goal, blacklistSites) {
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
  const matches = uniqueItems([...titleMatches, ...headingMatches, ...metaMatches, ...bodyMatches]).slice(0, 8)
  const score = titleMatches.length * 4 + headingMatches.length * 3 + metaMatches.length * 2 + bodyMatches.length + phraseMatches.length * 5
  const coverage = goalKeywords.length ? Math.min(100, Math.round((matches.length / goalKeywords.length) * 100)) : 0
  const title = snapshot.title || 'Без названия'

  if (matchedBlacklist) {
    return {
      status: 'не подходит',
      trigger: 'blacklist',
      domain,
      title,
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
      title,
      matchedBlacklist: null,
      matches,
      score,
      coverage,
      titleMatches,
      headingMatches,
      metaMatches,
      bodyMatches,
      phraseMatches,
      reason: buildMatchReason({ titleMatches, headingMatches, metaMatches, bodyMatches, phraseMatches })
    }
  }

  return {
    status: 'нейтрально',
    trigger: 'neutral',
    domain,
    title,
    matchedBlacklist: null,
    matches,
    score,
    coverage,
    titleMatches,
    headingMatches,
    metaMatches,
    bodyMatches,
    phraseMatches,
    reason: matches.length > 0
      ? 'Есть частичное совпадение по теме, но сигнал пока недостаточно сильный.'
      : 'На странице почти нет признаков выбранной цели.'
  }
}

export function extractPageSnapshot() {
  const normalizePageText = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
  
  const mainNode = document.querySelector('main') || document.querySelector('article') || document.querySelector('[role="main"]') || document.body
  const rawText = mainNode?.innerText || mainNode?.textContent || ''
  
  const textExcerpt = normalizePageText(rawText).slice(0, 12000)
  
  const headings = [...document.querySelectorAll('h1, h2, h3, [role="heading"]')]
    .map((node) => normalizePageText(node.textContent || ''))
    .filter(Boolean)
    .slice(0, 12)
    
  const metaDescription = normalizePageText(document.querySelector('meta[name="description"]')?.getAttribute('content') || '')

  return {
    url: window.location.href,
    domain: window.location.hostname.replace(/^www\./i, ''),
    title: normalizePageText(document.title),
    headings,
    metaDescription,
    textExcerpt
  }
}
