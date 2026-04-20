const PET_KEY = 'pixmori:pet'
const GOALS_KEY = 'pixmori:goals'

function normalizeGoals(items) {
  if (!Array.isArray(items)) return []
  return items.map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    status: goal.status === 'closed' ? 'closed' : 'active',
    blacklistSites: Array.isArray(goal.blacklistSites)
      ? goal.blacklistSites.map((site) => site.trim()).filter(Boolean)
      : []
  }))
}

function clampHealth(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 80
  return Math.max(0, Math.min(100, Math.round(num)))
}

export async function loadPetState() {
  const data = await chrome.storage.local.get(PET_KEY)
  const pet = data[PET_KEY]
  return {
    active: pet?.active === true,
    health: clampHealth(pet?.health ?? 80)
  }
}

export function savePetState(pet) {
  return chrome.storage.local.set({
    [PET_KEY]: {
      active: pet?.active === true,
      health: clampHealth(pet?.health ?? 80)
    }
  })
}

export async function loadGoalsState() {
  const data = await chrome.storage.local.get(GOALS_KEY)
  const goals = data[GOALS_KEY]
  return { items: normalizeGoals(goals?.items), selectedGoalId: goals?.selectedGoalId ?? null }
}

export function saveGoalsState(goals, selectedGoalId) {
  return chrome.storage.local.set({ [GOALS_KEY]: { items: normalizeGoals(goals), selectedGoalId: selectedGoalId ?? null } })
}
