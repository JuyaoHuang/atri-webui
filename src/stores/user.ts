import { defineStore } from 'pinia'

export interface UserSettings {
  nickname: string
  avatar: string
}

export interface UserState {
  settings: UserSettings
}

// ============================================
// 用户配置 - 在这里修改你的昵称和头像
// ============================================
const DEFAULT_SETTINGS: UserSettings = {
  nickname: 'juyao',           // 修改这里设置你的昵称
  avatar: '1.jpg' // 修改这里设置你的头像文件名（需放在 public/avatars/ 目录下）
}
// ============================================

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    settings: loadSettings()
  }),

  actions: {
    updateSettings(settings: Partial<UserSettings>) {
      this.settings = { ...this.settings, ...settings }
      saveSettings(this.settings)
    },

    resetSettings() {
      this.settings = { ...DEFAULT_SETTINGS }
      saveSettings(this.settings)
    }
  }
})

// LocalStorage 持久化
const STORAGE_KEY = 'atri_user_settings'

function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error('Failed to load user settings:', error)
  }
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save user settings:', error)
  }
}
