import { defineStore } from 'pinia'
import { loadGoalsState, loadPetState, saveGoalsState, savePetState } from '../lib/storage.js'

export const useAppStore = defineStore('app', {
  state: () => ({
    petMood: 'sleeping',
    goals: [],
    selectedGoalId: null
  }),

  getters: {
    selectedGoal(state) {
      return state.goals.find((goal) => goal.id === state.selectedGoalId) ?? {
        id: 'default-goal',
        title: 'По умолчанию'
      }
    },

    isDefaultGoalSelected(state) {
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

    async setDefaultGoal() {
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

    async saveCustomGoal(payload) {
      const title = payload.title.trim()
      const description = payload.description.trim()

      if (!title || !description) {
        return false
      }

      const newGoal = {
        id: `goal-${Date.now()}`,
        title,
        description
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
