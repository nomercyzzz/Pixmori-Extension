import { defineStore } from 'pinia'
import { loadGoalsState, loadPetState, saveGoalsState, savePetState } from '../utils/storage.js'
import { normalizeTitle } from '../utils/goalUtils.js'

export const useAppStore = defineStore('app', {
  state: () => ({
    petActive: false,
    petHealth: 80,
    goals: [],
    selectedGoalId: null
  }),

  getters: {
    selectedGoal(state) {
      return state.goals.find((goal) => goal.id === state.selectedGoalId) ?? null
    },

    hasSelectedGoal(state) {
      return state.goals.some((goal) => goal.id === state.selectedGoalId)
    },

    activeGoals(state) {
      return state.goals.filter((goal) => goal.status !== 'closed')
    },

    closedGoals(state) {
      return state.goals.filter((goal) => goal.status === 'closed')
    }
  },

  actions: {
    savePet() {
      return savePetState({ active: this.petActive, health: this.petHealth })
    },

    saveGoals() {
      return saveGoalsState(this.goals, this.selectedGoalId)
    },

    async startPet() {
      this.petActive = true
      await this.savePet()
    },

    async stopPet() {
      this.petActive = false
      await this.savePet()
    },

    async selectGoal(goalId) {
      const goal = this.goals.find((item) => item.id === goalId)
      if (!goal || goal.status === 'closed') {
        return false
      }

      this.selectedGoalId = goalId
      await this.saveGoals()
      return true
    },

    async setGoalStatus(goalId, status) {
      const goal = this.goals.find((item) => item.id === goalId)
      if (!goal) return false

      const nextStatus = status === 'closed' ? 'closed' : 'active'
      goal.status = nextStatus

      if (nextStatus === 'closed' && this.selectedGoalId === goalId) {
        this.selectedGoalId = null
      }

      await this.saveGoals()
      return true
    },

    async deleteGoal(goalId) {
      const index = this.goals.findIndex((goal) => goal.id === goalId)
      if (index === -1) return false

      this.goals.splice(index, 1)

      if (this.selectedGoalId === goalId) {
        this.selectedGoalId = null
      }

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

      if (
        this.goals.some(
          (goal) => goal.id !== goalId && normalizeTitle(goal.title) === normalizeTitle(title)
        )
      ) {
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

        if (goal.status !== 'closed') {
          this.selectedGoalId = goal.id
        }

        await this.saveGoals()
        return true
      }

      const newGoal = {
        id: `goal-${Date.now()}`,
        title,
        description,
        status: 'active',
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

      this.petActive = pet.active
      this.petHealth = pet.health
      this.goals = goalsState.items

      const selected = this.goals.find((goal) => goal.id === goalsState.selectedGoalId)
      this.selectedGoalId = selected && selected.status !== 'closed' ? selected.id : null
    }
  }
})
