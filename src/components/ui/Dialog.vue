<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const close = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="modelValue" class="dialog-overlay" @click="close">
        <div class="dialog-content" @click.stop>
          <div class="dialog-header">
            <h3 class="dialog-title">{{ title || '设置' }}</h3>
            <button class="dialog-close" @click="close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="dialog-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog-content {
  background: #1f2937;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #374151;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f3f4f6;
}

.dialog-close {
  color: #9ca3af;
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.dialog-close:hover {
  color: #f3f4f6;
}

.dialog-body {
  padding: 24px;
  overflow-y: auto;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .dialog-content,
.dialog-leave-active .dialog-content {
  transition: transform 0.2s;
}

.dialog-enter-from .dialog-content,
.dialog-leave-to .dialog-content {
  transform: scale(0.95);
}
</style>
