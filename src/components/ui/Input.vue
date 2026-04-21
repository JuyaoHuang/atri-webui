<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: 'text' | 'number' | 'file' | 'range'
  placeholder?: string
  min?: number
  max?: number
  step?: number
  accept?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  modelValue: ''
})

const emit = defineEmits<Emits>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (props.type === 'number' || props.type === 'range') {
    emit('update:modelValue', Number(target.value))
  } else {
    emit('update:modelValue', target.value)
  }
}

const handleFileChange = (event: Event) => {
  emit('change', event)
}
</script>

<template>
  <div class="input-wrapper">
    <input
      v-if="type === 'file'"
      :type="type"
      :accept="accept"
      :disabled="disabled"
      class="input-file"
      @change="handleFileChange"
    />
    <input
      v-else-if="type === 'range'"
      :type="type"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="input-range"
      @input="handleInput"
    />
    <input
      v-else
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-text"
      @input="handleInput"
    />
  </div>
</template>

<style scoped>
.input-wrapper {
  width: 100%;
}

.input-text {
  width: 100%;
  padding: 10px 14px;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  color: #f3f4f6;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.input-text:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-text:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-text::placeholder {
  color: #9ca3af;
}

.input-file {
  width: 100%;
  padding: 10px;
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  color: #f3f4f6;
  font-size: 0.875rem;
  cursor: pointer;
}

.input-file:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-range {
  width: 100%;
  height: 6px;
  background: #374151;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.input-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.input-range::-webkit-slider-thumb:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.input-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.input-range::-moz-range-thumb:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.input-range:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
