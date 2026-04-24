<script setup lang="ts">
import { ref } from 'vue'

import { useLive2dStore } from '@/stores/live2d'

const live2dStore = useLive2dStore()
const fileInputRef = ref<HTMLInputElement | null>(null)
const customModelName = ref('')

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  try {
    await live2dStore.uploadModel(file, customModelName.value || undefined)
    if (!live2dStore.enabled) {
      live2dStore.setEnabled(true)
    }
    customModelName.value = ''
  } catch (error) {
    console.error('上传 Live2D 模型失败:', error)
    alert('上传 Live2D 模型失败，请确认 ZIP 文件结构有效。')
  } finally {
    input.value = ''
  }
}

const handleDelete = async (modelId: string) => {
  if (!confirm('确定要删除这个 Live2D 模型吗？')) {
    return
  }

  try {
    await live2dStore.deleteModel(modelId)
  } catch (error) {
    console.error('删除 Live2D 模型失败:', error)
    alert('删除 Live2D 模型失败，请稍后重试。')
  }
}
</script>

<template>
  <div class="live2d-manager">
    <div class="manager-toolbar">
      <div>
        <p class="manager-kicker">Stage Mode</p>
        <h2>Live2D 舞台开关</h2>
        <p class="manager-description">
          关闭时维持当前主页面布局；开启后，首页会切换到 Live2D 舞台模式。
        </p>
      </div>

      <button
        class="mode-toggle"
        :class="{ 'is-enabled': live2dStore.enabled }"
        @click="live2dStore.setEnabled(!live2dStore.enabled)"
      >
        <span class="toggle-track">
          <span class="toggle-thumb" />
        </span>
        <span class="toggle-text">{{ live2dStore.enabled ? '已启用' : '未启用' }}</span>
      </button>
    </div>

    <div class="upload-panel">
      <div class="upload-copy">
        <h3>导入模型 ZIP</h3>
        <p>上传后端会自动解压模型，并在首页舞台和这里的预览区中可用。</p>
      </div>

      <div class="upload-actions">
        <input
          v-model="customModelName"
          class="name-input"
          type="text"
          placeholder="可选：自定义模型名称"
        >
        <button class="upload-button" :disabled="live2dStore.uploading" @click="openFilePicker">
          {{ live2dStore.uploading ? '上传中...' : '上传模型' }}
        </button>
        <input
          ref="fileInputRef"
          class="hidden"
          type="file"
          accept=".zip,application/zip"
          @change="handleFileSelect"
        >
      </div>
    </div>

    <div v-if="live2dStore.loading" class="manager-empty-state">
      正在加载模型列表...
    </div>

    <div v-else-if="live2dStore.models.length === 0" class="manager-empty-state">
      当前还没有 Live2D 模型。你可以先上传一个 ZIP 模型包，或者等待默认 Hiyori 模型被识别。
    </div>

    <div v-else class="model-grid">
      <article
        v-for="model in live2dStore.models"
        :key="model.id"
        class="model-card"
        :class="{ 'is-active': live2dStore.activeModelId === model.id }"
      >
        <div class="preview-shell">
          <img
            v-if="model.thumbnailUrl"
            :src="model.thumbnailUrl"
            :alt="model.name"
            class="preview-image"
          >
          <div v-else class="preview-fallback">
            <span>{{ model.name.slice(0, 1) }}</span>
          </div>

          <div class="model-badges">
            <span v-if="model.isDefault" class="badge">默认</span>
            <span v-if="live2dStore.activeModelId === model.id" class="badge is-active">当前</span>
          </div>
        </div>

        <div class="model-content">
          <div>
            <h3>{{ model.name }}</h3>
            <p>{{ model.expressions.length }} 个表情 · {{ new Date(model.createdAt).toLocaleDateString('zh-CN') }}</p>
          </div>

          <div class="model-actions">
            <button
              class="action-button"
              :class="{ 'is-primary': live2dStore.activeModelId !== model.id }"
              @click="live2dStore.setActiveModel(model.id)"
            >
              {{ live2dStore.activeModelId === model.id ? '已选中' : '设为当前' }}
            </button>

            <button class="action-button is-danger" @click="handleDelete(model.id)">
              删除
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.live2d-manager {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.manager-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.manager-kicker {
  color: rgb(0 129 179 / 0.58);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.manager-toolbar h2 {
  margin-top: 0.25rem;
  color: #0071a0;
  font-size: 1.15rem;
  font-weight: 800;
}

.manager-description {
  margin-top: 0.55rem;
  color: rgb(0 129 179 / 0.74);
  line-height: 1.7;
}

.mode-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  background: rgb(240 252 255 / 0.9);
  border: 1px solid rgb(152 236 255 / 0.5);
  color: #0081b3;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.mode-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgb(0 129 179 / 0.08);
}

.toggle-track {
  position: relative;
  width: 2.85rem;
  height: 1.6rem;
  border-radius: 999px;
  background: rgb(152 236 255 / 0.72);
}

.toggle-thumb {
  position: absolute;
  top: 0.18rem;
  left: 0.18rem;
  width: 1.24rem;
  height: 1.24rem;
  border-radius: 999px;
  background: white;
  box-shadow: 0 4px 10px rgb(0 0 0 / 0.12);
  transition: transform 0.2s ease;
}

.mode-toggle.is-enabled .toggle-track {
  background: linear-gradient(135deg, #18b5d8, #63d9dc);
}

.mode-toggle.is-enabled .toggle-thumb {
  transform: translateX(1.22rem);
}

.toggle-text {
  font-size: 0.9rem;
  font-weight: 700;
}

.upload-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, rgb(240 252 255 / 0.94), rgb(223 249 255 / 0.76));
  border: 1px solid rgb(152 236 255 / 0.42);
}

.upload-copy h3 {
  color: #0071a0;
  font-size: 0.98rem;
  font-weight: 700;
}

.upload-copy p {
  margin-top: 0.35rem;
  color: rgb(0 113 160 / 0.72);
  font-size: 0.9rem;
  line-height: 1.65;
}

.upload-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.name-input {
  min-width: 14rem;
  border: 1px solid rgb(152 236 255 / 0.45);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.74);
  color: #0071a0;
  padding: 0.72rem 1rem;
}

.upload-button,
.action-button {
  border-radius: 999px;
  padding: 0.72rem 1.05rem;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.upload-button {
  background: linear-gradient(135deg, #18b5d8, #63d9dc);
  color: white;
}

.upload-button:hover,
.action-button:hover {
  transform: translateY(-1px);
}

.upload-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.manager-empty-state {
  padding: 1.2rem 1rem;
  border-radius: 1.25rem;
  background: rgb(240 252 255 / 0.64);
  color: rgb(0 129 179 / 0.72);
  text-align: center;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.model-card {
  border-radius: 1.45rem;
  overflow: hidden;
  background: rgb(240 252 255 / 0.62);
  border: 1px solid rgb(152 236 255 / 0.3);
  box-shadow: 0 14px 30px rgb(0 129 179 / 0.05);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease;
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 36px rgb(0 129 179 / 0.1);
}

.model-card.is-active {
  border-color: rgb(0 152 196 / 0.45);
  box-shadow: 0 20px 40px rgb(24 181 216 / 0.14);
}

.preview-shell {
  position: relative;
  aspect-ratio: 1.15 / 1;
  background:
    radial-gradient(circle at top, rgb(255 255 255 / 0.95), transparent 42%),
    linear-gradient(180deg, rgb(223 249 255 / 0.96), rgb(197 252 255 / 0.32));
}

.preview-image,
.preview-fallback {
  width: 100%;
  height: 100%;
}

.preview-image {
  object-fit: cover;
}

.preview-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0081b3;
  font-size: 3rem;
  font-weight: 700;
}

.model-badges {
  position: absolute;
  top: 0.9rem;
  left: 0.9rem;
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.92);
  color: #0071a0;
  font-size: 0.74rem;
  font-weight: 700;
}

.badge.is-active {
  background: linear-gradient(135deg, #18b5d8, #63d9dc);
  color: white;
}

.model-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.model-content h3 {
  color: #0071a0;
  font-size: 1rem;
  font-weight: 700;
}

.model-content p {
  margin-top: 0.3rem;
  color: rgb(0 113 160 / 0.7);
  font-size: 0.86rem;
}

.model-actions {
  display: flex;
  gap: 0.65rem;
}

.action-button {
  flex: 1;
  background: rgb(255 255 255 / 0.84);
  border: 1px solid rgb(152 236 255 / 0.45);
  color: #0071a0;
}

.action-button.is-primary {
  background: linear-gradient(135deg, rgb(24 181 216 / 0.12), rgb(99 217 220 / 0.2));
}

.action-button.is-danger {
  color: #b34747;
  border-color: rgb(239 68 68 / 0.22);
}

.dark .manager-kicker {
  color: rgb(152 236 255 / 0.7);
}

.dark .manager-toolbar h2,
.dark .upload-copy h3,
.dark .model-content h3 {
  color: #c5fcff;
}

.dark .manager-description,
.dark .upload-copy p,
.dark .model-content p,
.dark .manager-empty-state {
  color: rgb(152 236 255 / 0.8);
}

.dark .mode-toggle,
.dark .name-input,
.dark .action-button {
  background: rgb(0 51 69 / 0.78);
  border-color: rgb(41 189 226 / 0.28);
  color: #c5fcff;
}

.dark .upload-panel,
.dark .manager-empty-state,
.dark .model-card {
  background: rgb(0 51 69 / 0.56);
  border-color: rgb(41 189 226 / 0.22);
}

.dark .preview-shell {
  background:
    radial-gradient(circle at top, rgb(197 252 255 / 0.22), transparent 42%),
    linear-gradient(180deg, rgb(0 71 102 / 0.92), rgb(0 51 69 / 0.55));
}

.dark .preview-fallback,
.dark .badge,
.dark .mode-toggle {
  color: #c5fcff;
}

.dark .badge {
  background: rgb(0 71 102 / 0.92);
}

@media (max-width: 960px) {
  .manager-toolbar,
  .upload-panel,
  .upload-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .name-input {
    min-width: 0;
  }
}
</style>
