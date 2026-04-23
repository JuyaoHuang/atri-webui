import { defineStore } from 'pinia'

export interface BackgroundSettings {
  imageUrl: string | null
  opacity: number
  blur: number
}

export interface SettingsState {
  background: BackgroundSettings
}

const STORAGE_KEY = 'atri-background-settings'

const DEFAULT_BACKGROUND: BackgroundSettings = {
  imageUrl: null,
  opacity: 100,
  blur: 0
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    background: { ...DEFAULT_BACKGROUND }
  }),

  actions: {
    loadSettings() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as BackgroundSettings
          this.background = {
            imageUrl: parsed.imageUrl ?? DEFAULT_BACKGROUND.imageUrl,
            opacity: parsed.opacity ?? DEFAULT_BACKGROUND.opacity,
            blur: parsed.blur ?? DEFAULT_BACKGROUND.blur
          }
        }
      } catch (error) {
        console.error('加载背景设置失败:', error)
        this.background = { ...DEFAULT_BACKGROUND }
      }
    },

    saveSettings() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.background))
      } catch (error) {
        console.error('保存背景设置失败:', error)
      }
    },

    updateBackground(settings: Partial<BackgroundSettings>) {
      this.background = {
        ...this.background,
        ...settings
      }
      this.saveSettings()
    },

    resetBackground() {
      this.background = { ...DEFAULT_BACKGROUND }
      this.saveSettings()
    }
  }
})
