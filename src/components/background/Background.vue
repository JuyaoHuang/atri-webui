<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useSettings } from '@/composables/useSettings'
import Dialog from '@/components/ui/Dialog.vue'
import Input from '@/components/ui/Input.vue'

const settingsStore = useSettingsStore()
const { updateBackground, uploadBackgroundImage } = useSettings()

const showDialog = ref(false)
const uploading = ref(false)

onMounted(() => {
  settingsStore.loadSettings()
})

const backgroundStyle = computed(() => {
  const { type, value, opacity } = settingsStore.background

  if (type === 'image') {
    return {
      backgroundImage: `url(${value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: opacity / 100
    }
  } else {
    return {
      backgroundColor: value,
      opacity: opacity / 100
    }
  }
})

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  uploading.value = true
  try {
    const base64 = await uploadBackgroundImage(file)
    updateBackground({
      type: 'image',
      value: base64
    })
  } catch (error) {
    console.error('上传图片失败:', error)
    alert('上传图片失败，请重试')
  } finally {
    uploading.value = false
  }
}

const handleOpacityChange = (value: string | number) => {
  updateBackground({ opacity: Number(value) })
}
</script>

<template>
  <div>
    <!-- Background layer -->
    <div class="fixed inset-0 -z-10" :style="backgroundStyle"></div>

    <!-- Settings button -->
    <button
      class="fixed bottom-6 right-6 w-12 h-12 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all shadow-lg z-50"
      @click="showDialog = true"
      title="背景设置"
    >
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </button>

    <!-- Settings dialog -->
    <Dialog v-model="showDialog" title="背景设置">
      <div class="space-y-6">
        <!-- Upload image -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">上传背景图片</label>
          <Input type="file" accept="image/*" :disabled="uploading" @change="handleFileUpload" />
          <p v-if="uploading" class="text-sm text-blue-400 mt-2">上传中...</p>
        </div>

        <!-- Opacity slider -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            透明度: {{ settingsStore.background.opacity }}%
          </label>
          <Input
            type="range"
            :model-value="settingsStore.background.opacity"
            :min="0"
            :max="100"
            :step="1"
            @update:model-value="handleOpacityChange"
          />
        </div>

        <!-- Current background info -->
        <div class="text-sm text-gray-400">
          <p>当前背景类型: {{ settingsStore.background.type === 'image' ? '图片' : '颜色' }}</p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* Background layer is behind all content */
</style>
