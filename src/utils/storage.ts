import type { BackgroundConfig } from '@/types/settings'

const STORAGE_KEYS = {
  BACKGROUND: 'atri:background'
} as const

export const storage = {
  background: {
    get(): BackgroundConfig | null {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.BACKGROUND)
        return data ? JSON.parse(data) : null
      } catch (error) {
        console.error('Failed to load background config:', error)
        return null
      }
    },

    set(config: BackgroundConfig): void {
      try {
        localStorage.setItem(STORAGE_KEYS.BACKGROUND, JSON.stringify(config))
      } catch (error) {
        console.error('Failed to save background config:', error)
      }
    }
  }
}
