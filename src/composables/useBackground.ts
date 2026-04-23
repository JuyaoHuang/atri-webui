import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useBackground() {
  const settingsStore = useSettingsStore()

  const settings = computed(() => settingsStore.background)

  const uploadImage = async (file: File): Promise<{ success: boolean; error?: string }> => {
    // 验证文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: '仅支持 PNG/JPG/WEBP 格式' }
    }

    // 验证文件大小（< 5MB）
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { success: false, error: '图片大小不能超过 5MB' }
    }

    // 转换为 Base64
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
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
    const bg = settings.value
    if (bg.imageUrl) {
      return {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: bg.opacity / 100,
        filter: `blur(${bg.blur}px)`
      }
    }
    return {}
  })

  return {
    settings,
    uploadImage,
    updateOpacity,
    updateBlur,
    reset,
    backgroundStyle
  }
}
