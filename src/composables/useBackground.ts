import { computed } from 'vue'

import { useSettingsStore } from '@/stores/settings'

export function useBackground() {
  const settingsStore = useSettingsStore()

  const settings = computed(() => settingsStore.background)

  const uploadImage = async (file: File): Promise<{ success: boolean; error?: string }> => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: '仅支持 PNG、JPG、WEBP 格式' }
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, error: '图片大小不能超过 5MB' }
    }

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        settingsStore.updateBackground({ imageUrl: base64 })
        resolve({ success: true })
      }
      reader.onerror = () => {
        resolve({ success: false, error: '图片读取失败' })
      }
      reader.readAsDataURL(file)
    })
  }

  const updateOpacity = (value: number) => {
    settingsStore.updateBackground({ opacity: value })
  }

  const updateBlur = (value: number) => {
    settingsStore.updateBackground({ blur: value })
  }

  const reset = () => {
    settingsStore.resetBackground()
  }

  const backgroundStyle = computed(() => {
    const background = settings.value
    if (!background.imageUrl) {
      return {}
    }

    return {
      backgroundImage: `url(${background.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: background.opacity / 100,
      filter: `blur(${background.blur}px)`,
    }
  })

  return {
    settings,
    uploadImage,
    updateOpacity,
    updateBlur,
    reset,
    backgroundStyle,
  }
}
