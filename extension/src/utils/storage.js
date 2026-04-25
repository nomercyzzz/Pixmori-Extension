const PET_KEY = 'pixmori-pet'
const GOALS_KEY = 'pixmori-goals'

function normalizeBlacklistSites(sites) {
  if (!Array.isArray(sites)) return []

  return sites
    .map((site) => String(site ?? '').trim().toLowerCase())
    .filter(Boolean)
    .map((site) =>
        site
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/[?#].*$/, '')
        .replace(/\/+$/, '')
    )
}

function normalizeGoals(items) {
  if (!Array.isArray(items)) return []

  return items.map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    status: goal.status === 'closed' ? 'closed' : 'active',
    blacklistSites: normalizeBlacklistSites(goal.blacklistSites)
  }))
}

function clampHealth(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 80
  return Math.max(0, Math.min(100, Math.round(num)))
}

export async function loadPetState() {
  const data = await chrome.storage.local.get(PET_KEY)

  return {
    active: data[PET_KEY]?.active === true,
    health: clampHealth(data[PET_KEY]?.health ?? 80)
  }
}

export async function savePetState(pet) {
  await chrome.storage.local.set({
    [PET_KEY]: {
      active: pet?.active === true,
      health: clampHealth(pet?.health ?? 80)
    }
  })
}

export async function loadGoalsState() {
  const data = await chrome.storage.local.get(GOALS_KEY)

  return {
    items: normalizeGoals(data[GOALS_KEY]?.items),
    selectedGoalId: data[GOALS_KEY]?.selectedGoalId ?? null
  }
}

export async function saveGoalsState(goals, selectedGoalId) {
  await chrome.storage.local.set({
    [GOALS_KEY]: {
      items: normalizeGoals(goals),
      selectedGoalId: selectedGoalId ?? null
    }
  })
}
