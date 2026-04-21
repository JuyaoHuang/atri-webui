import { defineStore } from 'pinia'
import type { BackgroundConfig } from '@/types/settings'
import { storage } from '@/utils/storage'

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
      const savedBackground = storage.background.get()
      if (savedBackground) {
        this.background = savedBackground
      }
    },

    saveSettings() {
      storage.background.set(this.background)
    },

    updateBackground(config: Partial<BackgroundConfig>) {
      this.background = { ...this.background, ...config }
    }
  }
})
