<script setup lang="ts">
import { computed } from 'vue'

import TransitionBidirectional from './TransitionBidirectional.vue'

type ButtonVariant = 'primary' | 'secondary' | 'secondary-muted' | 'danger' | 'caution' | 'pure' | 'ghost'
type ButtonTheme = 'default'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  toggled?: boolean
  icon?: string
  label?: string
  disabled?: boolean
  loading?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: 'rounded' | 'pill' | 'square'
  theme?: ButtonTheme
  block?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  toggled: false,
  variant: 'primary',
  disabled: false,
  loading: false,
  size: 'md',
  shape: 'pill',
  theme: 'default',
  block: false,
})

const isDisabled = computed(() => props.disabled || props.loading)

const variantClasses: Record<ButtonVariant, Record<ButtonTheme, {
  default: string[]
  nonToggled?: string
  toggled?: string
}>> = {
  primary: {
    default: {
      default: [
        'rounded-lg',
        'backdrop-blur-md',
        'bg-primary-500/15 hover:bg-primary-500/20 active:bg-primary-500/30 dark:bg-primary-700/30 dark:hover:bg-primary-700/40 dark:active:bg-primary-700/30',
        'focus:ring-primary-300/60 dark:focus:ring-primary-600/30',
        'border-2 border-solid border-primary-500/5 dark:border-primary-900/40',
        'text-primary-950 dark:text-primary-100',
        'focus:ring-2',
      ],
    },
  },
  secondary: {
    default: {
      default: [
        'rounded-lg',
        'backdrop-blur-md',
        'bg-neutral-100/55 hover:bg-neutral-400/20 active:bg-neutral-400/30 dark:bg-neutral-700/60 dark:hover:bg-neutral-700/80 dark:active:bg-neutral-700/60',
        'focus:ring-neutral-300/30 dark:focus:ring-neutral-600/60 dark:focus:ring-neutral-600/30',
        'border-2 border-solid border-neutral-300/30 dark:border-neutral-700/30',
        'text-neutral-950 dark:text-neutral-100',
        'focus:ring-2',
      ],
    },
  },
  'secondary-muted': {
    default: {
      default: [
        'rounded-lg',
        'backdrop-blur-md',
        'hover:bg-neutral-50/50 active:bg-neutral-50/90 hover:dark:bg-neutral-800/50 active:dark:bg-neutral-800/90',
        'border-2 border-solid border-neutral-100/60 dark:border-neutral-800/30',
        'focus:ring-2 focus:ring-neutral-300/30 dark:focus:ring-neutral-600/60 dark:focus:ring-neutral-600/30',
      ],
      nonToggled: 'bg-neutral-50/70 dark:bg-neutral-800/70 text-neutral-500 dark:text-neutral-400',
      toggled: 'bg-white/90 dark:bg-neutral-500/70 ring-neutral-300/30 dark:ring-neutral-600/60 ring-2 dark:ring-neutral-600/30 text-primary-500 dark:text-primary-100',
    },
  },
  danger: {
    default: {
      default: [
        'rounded-lg',
        'backdrop-blur-md',
        'bg-red-500/15 hover:bg-red-500/20 active:bg-red-500/30 dark:bg-red-700/30 dark:hover:bg-red-700/40 dark:active:bg-red-700/30',
        'focus:ring-2 focus:ring-red-300/30 dark:focus:ring-red-600/60 dark:focus:ring-red-600/30',
        'border-2 border-solid border-red-200/30 dark:border-red-900/30',
        'text-red-950 dark:text-red-100',
      ],
    },
  },
  caution: {
    default: {
      default: [
        'rounded-lg',
        'backdrop-blur-md',
        'bg-amber-400/20 hover:bg-amber-400/25 active:bg-amber-400/35 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:active:bg-amber-500/35',
        'focus:ring-2 focus:ring-amber-300/40 dark:focus:ring-amber-400/40',
        'border-2 border-solid border-amber-300/40 dark:border-amber-500/40',
        'text-amber-900 dark:text-amber-50',
      ],
    },
  },
  pure: {
    default: {
      default: [
        'bg-transparent',
        'text-neutral-900 dark:text-neutral-50',
        '!px-0 !py-0',
      ],
    },
  },
  ghost: {
    default: {
      default: [
        'bg-transparent',
        'hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50',
        'text-neutral-500 dark:text-neutral-400',
        'focus:ring-2 focus:ring-neutral-300/30 dark:focus:ring-neutral-600/30',
      ],
    },
  },
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: props.shape === 'pill'
    ? 'px-3 py-1.5 text-xs'
    : props.shape === 'square'
      ? 'p-2 text-xs'
      : 'px-4 py-2 text-sm',
  md: props.shape === 'pill'
    ? 'px-4 py-2 text-sm'
    : props.shape === 'square'
      ? 'p-3 text-sm'
      : 'px-5 py-3 text-base',
  lg: props.shape === 'pill'
    ? 'px-6 py-3 text-base'
    : props.shape === 'square'
      ? 'p-4 text-base'
      : 'px-6 py-3 text-base',
}

const baseClasses = computed(() => {
  const variant = variantClasses[props.variant] || variantClasses.primary
  const theme = variant[props.theme] || variant.default

  return [
    'font-medium outline-none',
    'transition-all duration-200 ease-in-out',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'backdrop-blur-md',
    props.block ? 'w-full' : '',
    sizeClasses[props.size],
    theme.default,
    props.toggled ? theme.toggled || '' : theme.nonToggled || '',
    { 'opacity-50 cursor-not-allowed': isDisabled.value },
    'focus:ring-2',
  ]
})
</script>

<template>
  <button
    :disabled="isDisabled"
    :class="baseClasses"
  >
    <div class="flex flex-row items-center justify-center gap-2">
      <TransitionBidirectional
        from-class="opacity-0 mr-0! w-0!"
        active-class="transition-[width,margin] ease-in-out overflow-hidden transition-100"
      >
        <div v-if="loading || icon" class="w-4">
          <div v-if="loading" class="airi-button-spinner h-4 w-4" />
          <div v-else-if="icon" class="h-4 w-4" :class="icon" />
        </div>
      </TransitionBidirectional>
      <span v-if="label">{{ label }}</span>
      <slot v-else />
    </div>
  </button>
</template>

<style scoped>
.airi-button-spinner {
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: airi-button-spin 0.7s linear infinite;
}

@keyframes airi-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
