import { defineStore } from 'pinia'
import { loadGoalsState, loadPetState, saveGoalsState, savePetState } from '../utils/storage.js'
import { normalizeTitle } from '../utils/goalUtils.js'

export const useAppStore = defineStore('app', {
  state: () => ({
    petMood: 'sleeping',
    goals: [],
    selectedGoalId: null
  }),

  getters: {
    selectedGoal(state) {
      return state.goals.find((goal) => goal.id === state.selectedGoalId) ?? {
        id: 'free-goal',
        title: 'Свободный режим',
        description: '',
        blacklistSites: []
      }
    },

    isFreeGoalSelected(state) {
      return state.selectedGoalId === null
    }
  },

  actions: {
    savePet() {
      return savePetState(this.petMood)
    },

    saveGoals() {
      return saveGoalsState(this.goals, this.selectedGoalId)
    },

    async startPet() {
      this.petMood = 'default'
      await this.savePet()
    },

    async stopPet() {
      this.petMood = 'sleeping'
      await this.savePet()
    },

    async setFreeGoal() {
      this.selectedGoalId = null
      await this.saveGoals()
    },

    async selectGoal(goalId) {
      if (!this.goals.some((goal) => goal.id === goalId)) {
        return false
      }

      this.selectedGoalId = goalId
      await this.saveGoals()
      return true
    },

    async saveGoal(payload) {
      const title = payload.title.trim()
      const description = payload.description.trim()
      const goalId = payload.id ?? null
      const blacklistSites = Array.isArray(payload.blacklistSites)
        ? payload.blacklistSites.map((site) => site.trim()).filter(Boolean)
        : []

      if (!title || title.length < 3) {
        return false
      }

      if (!description || description.length < 8) {
        return false
      }

      if (this.goals.some((goal) => goal.id !== goalId && normalizeTitle(goal.title) === normalizeTitle(title))) {
        return false
      }

      if (goalId) {
        const goal = this.goals.find((item) => item.id === goalId)

        if (!goal) {
          return false
        }

        goal.title = title
        goal.description = description
        goal.blacklistSites = blacklistSites
        this.selectedGoalId = goal.id
        await this.saveGoals()
        return true
      }

      const newGoal = {
        id: `goal-${Date.now()}`,
        title,
        description,
        blacklistSites
      }

      this.goals.unshift(newGoal)
      this.selectedGoalId = newGoal.id
      await this.saveGoals()
      return true
    },

    async loadFromStorage() {
      const pet = await loadPetState()
      const goalsState = await loadGoalsState()
      this.petMood = pet.mood
      this.goals = goalsState.items
      this.selectedGoalId = this.goals.some((goal) => goal.id === goalsState.selectedGoalId) ? goalsState.selectedGoalId : null
    }
  }
})
