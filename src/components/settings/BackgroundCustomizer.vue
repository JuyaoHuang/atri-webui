<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

import { useBackground } from '@/composables/useBackground'

const { settings, uploadImage, updateOpacity, updateBlur, reset, backgroundStyle } = useBackground()

const errorMessage = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  errorMessage.value = ''
  const result = await uploadImage(file)

  if (!result.success) {
    errorMessage.value = result.error || '上传失败'
    toast.error(result.error || '上传失败')
  }
  else {
    toast.success('背景图片上传成功')
  }

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
  toast.success('背景已恢复默认')
}
</script>

<template>
  <div class="background-customizer">
    <section class="panel intro-panel">
      <div>
        <h2 class="panel-title">背景设置</h2>
        <p class="panel-description">
          为聊天舞台选择专属背景，并调节透明度与模糊度。
        </p>
      </div>
    </section>

    <section v-if="errorMessage" class="panel error-panel">
      <p>{{ errorMessage }}</p>
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <h3 class="section-title">背景图片</h3>
          <p class="section-description">支持 PNG、JPG、WEBP，文件大小不超过 5MB。</p>
        </div>
        <button
          type="button"
          class="primary-button"
          @click="handleUploadClick"
        >
          上传图片
        </button>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        class="hidden"
        @change="handleFileSelect"
      >

      <div class="preview-box">
        <div
          v-if="settings.imageUrl"
          class="preview-bg"
          :style="backgroundStyle"
        />
        <div v-else class="preview-empty">
          暂未设置背景图片
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="slider-group">
        <label class="slider-label" for="background-opacity">
          <span>透明度</span>
          <span>{{ settings.opacity }}%</span>
        </label>
        <input
          id="background-opacity"
          type="range"
          min="0"
          max="100"
          :value="settings.opacity"
          @input="updateOpacity(Number(($event.target as HTMLInputElement).value))"
        >
      </div>

      <div class="slider-group">
        <label class="slider-label" for="background-blur">
          <span>模糊度</span>
          <span>{{ settings.blur }}px</span>
        </label>
        <input
          id="background-blur"
          type="range"
          min="0"
          max="10"
          :value="settings.blur"
          @input="updateBlur(Number(($event.target as HTMLInputElement).value))"
        >
      </div>
    </section>

    <section class="panel actions-panel">
      <button
        type="button"
        class="secondary-button"
        @click="handleReset"
      >
        恢复默认
      </button>
    </section>
  </div>
</template>

<style scoped>
.background-customizer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel {
  border: 1px solid color-mix(in srgb, var(--panel-border, rgb(226 232 240)) 78%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--panel-bg, rgb(248 250 252)) 82%, transparent);
  padding: 1.25rem;
  backdrop-filter: blur(12px);
}

.intro-panel {
  background: color-mix(in srgb, rgb(248 250 252) 86%, transparent);
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(23 23 23);
}

.panel-description {
  margin-top: 0.375rem;
  color: rgb(115 115 115);
  line-height: 1.6;
}

.error-panel {
  border-color: rgb(254 202 202);
  background: rgb(254 242 242 / 0.9);
  color: rgb(185 28 28);
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(23 23 23);
}

.section-description {
  margin-top: 0.25rem;
  color: rgb(115 115 115);
  line-height: 1.5;
}

.primary-button,
.secondary-button {
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.25s ease-in-out;
  cursor: pointer;
}

.primary-button {
  background: rgb(68 119 245);
  color: white;
  box-shadow: 0 10px 24px rgb(68 119 245 / 0.22);
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgb(68 119 245 / 0.26);
}

.secondary-button {
  background: rgb(255 255 255 / 0.72);
  border-color: rgb(212 212 216);
  color: rgb(63 63 70);
}

.secondary-button:hover {
  border-color: rgb(148 163 184);
  color: rgb(23 23 23);
}

.preview-box {
  position: relative;
  height: 14rem;
  overflow: hidden;
  border: 1px solid rgb(226 232 240);
  border-radius: 1rem;
  background:
    linear-gradient(135deg, rgb(248 250 252 / 0.92), rgb(241 245 249 / 0.8)),
    radial-gradient(circle at top right, rgb(184 208 255 / 0.45), transparent 45%);
}

.preview-bg {
  position: absolute;
  inset: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  pointer-events: none;
}

.preview-empty {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: rgb(115 115 115);
}

.slider-group + .slider-group {
  margin-top: 1rem;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: rgb(63 63 70);
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 0.375rem;
  border-radius: 999px;
  background: linear-gradient(90deg, rgb(184 208 255), rgb(95 149 255));
  outline: none;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid white;
  border-radius: 999px;
  background: rgb(68 119 245);
  box-shadow: 0 4px 10px rgb(68 119 245 / 0.24);
  cursor: pointer;
}

input[type='range']::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  border: 2px solid white;
  border-radius: 999px;
  background: rgb(68 119 245);
  box-shadow: 0 4px 10px rgb(68 119 245 / 0.24);
  cursor: pointer;
}

.actions-panel {
  display: flex;
  justify-content: flex-end;
}

.dark .panel {
  --panel-border: rgb(38 38 38);
  --panel-bg: rgb(23 23 23);
}

.dark .intro-panel {
  background: color-mix(in srgb, rgb(23 23 23) 88%, transparent);
}

.dark .panel-title,
.dark .section-title {
  color: rgb(245 245 245);
}

.dark .panel-description,
.dark .section-description,
.dark .slider-label,
.dark .preview-empty {
  color: rgb(161 161 170);
}

.dark .error-panel {
  border-color: rgb(127 29 29 / 0.8);
  background: rgb(69 10 10 / 0.68);
  color: rgb(254 202 202);
}

.dark .secondary-button {
  background: rgb(38 38 38 / 0.8);
  border-color: rgb(63 63 70);
  color: rgb(228 228 231);
}

.dark .secondary-button:hover {
  border-color: rgb(113 113 122);
  color: rgb(250 250 250);
}

.dark .preview-box {
  border-color: rgb(38 38 38);
  background:
    linear-gradient(135deg, rgb(15 23 42 / 0.9), rgb(23 23 23 / 0.88)),
    radial-gradient(circle at top right, rgb(95 149 255 / 0.18), transparent 45%);
}

@media (max-width: 768px) {
  .panel {
    padding: 1rem;
  }

  .section-head {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
    justify-content: center;
  }

  .actions-panel {
    justify-content: stretch;
  }
}
</style>
