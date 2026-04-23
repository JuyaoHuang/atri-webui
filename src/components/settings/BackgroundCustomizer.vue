<script setup lang="ts">
import { ref } from 'vue'
import { useBackground } from '@/composables/useBackground'
import { toast } from 'vue-sonner'

const { settings, uploadImage, updateOpacity, updateBlur, reset, backgroundStyle } = useBackground()

const errorMessage = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  errorMessage.value = ''
  const result = await uploadImage(file)

  if (!result.success) {
    errorMessage.value = result.error || '上传失败'
    toast.error(result.error || '上传失败')
  } else {
    toast.success('背景图片上传成功！')
  }

  // 清空 input，允许重复上传同一文件
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleUploadClick = () => {
  fileInputRef.value?.click()
}

const handleReset = () => {
  errorMessage.value = ''
  reset()
  toast.success('背景已重置为默认')
}
</script>

<template>
  <div class="background-customizer">
    <h3 class="text-xl font-bold mb-4">背景设置</h3>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message mb-4 p-3 bg-red-100 text-red-700 rounded">
      {{ errorMessage }}
    </div>

    <!-- 图片上传 -->
    <div class="upload-section mb-6">
      <label class="block text-sm font-medium mb-2">背景图片</label>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        @change="handleFileSelect"
        class="hidden"
      />
      <button
        @click="handleUploadClick"
        class="upload-btn px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        上传背景图片
      </button>
      <p class="text-xs text-gray-500 mt-2">支持 PNG/JPG/WEBP 格式，大小不超过 5MB</p>
    </div>

    <!-- 透明度调节 -->
    <div class="slider-section mb-6">
      <label class="block text-sm font-medium mb-2">
        透明度: {{ settings.opacity }}%
      </label>
      <input
        type="range"
        min="0"
        max="100"
        :value="settings.opacity"
        @input="updateOpacity(Number(($event.target as HTMLInputElement).value))"
        class="w-full"
      />
    </div>

    <!-- 模糊度调节 -->
    <div class="slider-section mb-6">
      <label class="block text-sm font-medium mb-2">
        模糊度: {{ settings.blur }}px
      </label>
      <input
        type="range"
        min="0"
        max="10"
        :value="settings.blur"
        @input="updateBlur(Number(($event.target as HTMLInputElement).value))"
        class="w-full"
      />
    </div>

    <!-- 预览 -->
    <div class="preview-section mb-6">
      <label class="block text-sm font-medium mb-2">预览效果</label>
      <div class="preview-box relative w-full h-48 border-2 border-gray-300 rounded overflow-hidden">
        <div
          v-if="settings.imageUrl"
          class="preview-bg absolute inset-0"
          :style="backgroundStyle"
        ></div>
        <div v-else class="flex items-center justify-center h-full text-gray-400">
          未设置背景图片
        </div>
      </div>
    </div>

    <!-- 重置按钮 -->
    <div class="actions">
      <button
        @click="handleReset"
        class="reset-btn px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
      >
        重置为默认
      </button>
    </div>
  </div>
</template>

<style scoped>
.background-customizer {
  max-width: 600px;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.preview-bg {
  pointer-events: none;
}
</style>
