import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useSettings() {
  const settingsStore = useSettingsStore()

  onMounted(() => {
    settingsStore.loadSettings()
  })

  const updateBackground = (config: Partial<typeof settingsStore.background>) => {
    settingsStore.updateBackground(config)
    settingsStore.saveSettings()
  }

  const uploadBackgroundImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          resolve(result)
        } else {
          reject(new Error('Failed to read file'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsDataURL(file)
    })
  }

  return {
    background: settingsStore.background,
    updateBackground,
    uploadBackgroundImage
  }
}
