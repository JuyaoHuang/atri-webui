import { defineStore } from 'pinia'
import type { BackgroundConfig } from '@/types/settings'

export interface SettingsState {
  background: BackgroundConfig
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    background: {
      type: 'color',
      value: '#1a1a1a',
      opacity: 100
    }
  }),

  actions: {
    loadSettings() {
      // Will be implemented in US-FE-006
      // Load from LocalStorage
    },

    saveSettings() {
      // Will be implemented in US-FE-006
      // Save to LocalStorage
    },

    updateBackground(config: Partial<BackgroundConfig>) {
      this.background = { ...this.background, ...config }
    }
  }
})
