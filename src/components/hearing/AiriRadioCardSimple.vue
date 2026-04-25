<script setup lang="ts">
defineProps<{
  id: string
  name: string
  value: string
  title: string
  description?: string
}>()

const modelValue = defineModel<string>({ required: true })
</script>

<template>
  <label
    :key="id"
    class="airi-radio-card-simple relative block min-h-28 w-full min-w-0 cursor-pointer items-start overflow-hidden rounded-xl border-2 border-solid p-4 text-left transition-all duration-200 ease-in-out"
    :class="[
      modelValue === value
        ? 'border-primary-100 bg-primary-50 dark:border-primary-900 dark:bg-primary-900/20 hover:border-primary-500/30 dark:hover:border-primary-400/30'
        : 'border-neutral-100 bg-white dark:border-neutral-900 dark:bg-neutral-900/20 hover:border-primary-500/30 dark:hover:border-primary-400/30',
      modelValue === value ? 'airi-radio-card-simple-active' : '',
    ]"
  >
    <input
      v-model="modelValue"
      :checked="modelValue === value"
      type="radio"
      :name="name"
      :value="value"
      class="absolute opacity-0"
    >
    <div
      class="absolute left-2 top-2 size-5 rounded-full border-2 border-neutral-300 transition-all duration-200 ease-in-out dark:border-neutral-600"
      :class="modelValue === value ? 'border-primary-500 dark:border-primary-400' : ''"
    >
      <div
        class="absolute left-1/2 top-1/2 size-3 rounded-full bg-primary-500 transition-all duration-200 ease-in-out -translate-x-1/2 -translate-y-1/2 dark:bg-primary-400"
        :class="modelValue === value ? 'opacity-100' : 'opacity-0'"
      />
    </div>
    <div class="flex min-h-16 w-full flex-col items-start justify-center pb-2 pl-5 pr-4 pt-2">
      <span
        class="font-normal text-md transition-all duration-200 ease-in-out"
        :class="modelValue === value
          ? 'text-neutral-700 dark:text-neutral-300'
          : 'text-neutral-500 dark:text-neutral-500'"
      >
        {{ title }}
      </span>
      <span
        v-if="description"
        class="line-clamp-2 text-xs transition-all duration-200 ease-in-out"
        :class="modelValue === value
          ? 'text-neutral-600 dark:text-neutral-400'
          : 'text-neutral-400 dark:text-neutral-600'"
        :title="description"
      >
        {{ description }}
      </span>
    </div>
    <div class="airi-radio-card-simple-dots absolute inset-0 z--1" />

    <div v-if="$slots.topRight" class="absolute right-2 top-2 z-10">
      <slot name="topRight" />
    </div>
    <div v-if="$slots.bottomRight" class="absolute bottom-2 right-2 z-10">
      <slot name="bottomRight" />
    </div>
  </label>
</template>

<style scoped>
.airi-radio-card-simple::before {
  --at-apply: 'bg-gradient-to-r from-primary-500/0 to-primary-500/0 dark:from-primary-400/0 dark:to-primary-400/0';
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 25%;
  height: 100%;
  transition: all 0.35s ease-in-out;
  mask-image: linear-gradient(120deg, white 100%);
  opacity: 0;
}

.airi-radio-card-simple:hover::before {
  --at-apply: 'bg-gradient-to-r from-primary-500/20 via-primary-500/10 to-transparent dark:from-primary-400/20 dark:via-primary-400/10 dark:to-transparent';
  width: 85%;
  opacity: 1;
}

.airi-radio-card-simple-active::before {
  --at-apply: 'bg-gradient-to-r from-primary-500/20 via-primary-500/10 to-transparent dark:from-primary-400/20 dark:via-primary-400/10 dark:to-transparent';
  width: 85%;
  opacity: 0.5;
}

.airi-radio-card-simple-dots {
  --at-apply: 'bg-dotted-[neutral-200/80] dark:bg-dotted-[neutral-700/50]';
  background-size: 10px 10px;
  mask-image: linear-gradient(165deg, white 30%, transparent 50%);
}

.airi-radio-card-simple-active .airi-radio-card-simple-dots {
  --at-apply: 'bg-dotted-[primary-300/50] dark:bg-dotted-[primary-200/20]';
}
</style>
