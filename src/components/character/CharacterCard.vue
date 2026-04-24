<script setup lang="ts">
import { computed } from 'vue'

import type { Character } from '@/types/character'
import { resolveAvatarUrl } from '@/utils/avatar'

const props = defineProps<{
  character: Character
  isActive: boolean
  isSelected: boolean
}>()

const emit = defineEmits<{
  open: [characterId: string]
  edit: [characterId: string]
  delete: [characterId: string]
  export: [characterId: string]
  activate: [characterId: string]
}>()

const avatarSrc = computed(() => resolveAvatarUrl(props.character.avatar, props.character.avatarUrl))

const updatedLabel = computed(() => {
  const value = props.character.updatedAt || props.character.createdAt
  if (!value) {
    return '未记录时间'
  }

  return new Date(value).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-2xl border border-[#98ecff]/35 bg-white/68 p-4 shadow-[0_20px_50px_rgba(0,129,179,0.08)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-[#98ecff]/55 hover:shadow-[0_28px_60px_rgba(0,129,179,0.14)] dark:border-[#29bde2]/22 dark:bg-[#022c38]/72 dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
    :class="{
      'ring-1 ring-[#0081b3]/25 dark:ring-[#c5fcff]/20': isSelected,
      'border-[#0081b3]/42 bg-[#98ecff]/24 dark:border-[#98ecff]/28 dark:bg-[#0a4152]/78': isActive
    }"
    @click="emit('open', character.id)"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-80"
      style="background:
        radial-gradient(circle at top right, rgba(152,236,255,0.45), transparent 34%),
        linear-gradient(135deg, rgba(255,255,255,0.24), rgba(152,236,255,0.08));"
    />

    <div class="relative z-1 flex flex-col gap-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex flex-1 items-start gap-3">
          <div class="relative h-13 w-13 shrink-0 overflow-hidden rounded-2xl border border-white/40 bg-[#98ecff]/24 shadow-inner dark:border-white/10 dark:bg-[#29bde2]/16">
            <img
              v-if="avatarSrc"
              :src="avatarSrc"
              :alt="character.name"
              class="h-full w-full object-cover"
            >
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-lg font-semibold text-[#0081b3] dark:text-[#c5fcff]"
            >
              {{ character.name.slice(0, 1) }}
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="truncate text-base font-medium text-[#0071a0] dark:text-[#f0fcff]">
                {{ character.name }}
              </h3>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] tracking-[0.12em] uppercase"
                :class="character.isSystem
                  ? 'bg-[#0081b3]/10 text-[#0081b3] dark:bg-[#98ecff]/12 dark:text-[#c5fcff]'
                  : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300'"
              >
                {{ character.isSystem ? 'System' : 'Custom' }}
              </span>
            </div>

            <p class="mt-1 line-clamp-2 text-sm text-[#0071a0]/78 dark:text-[#c5fcff]/76">
              {{ character.description || '还没有为这个角色填写简介。' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
          <button
            class="rounded-xl border border-white/30 bg-white/70 p-2 text-[#0071a0] transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-[#c5fcff] dark:hover:bg-white/14"
            title="导出角色"
            @click.stop="emit('export', character.id)"
          >
            <div i-solar:export-line-duotone text-base />
          </button>
          <button
            class="rounded-xl border border-white/30 bg-white/70 p-2 text-[#0071a0] transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-[#c5fcff] dark:hover:bg-white/14"
            title="编辑角色"
            @click.stop="emit('edit', character.id)"
          >
            <div i-solar:pen-2-line-duotone text-base />
          </button>
          <button
            class="rounded-xl border border-rose-300/45 bg-rose-50/80 p-2 text-rose-500 transition hover:bg-rose-100 dark:border-rose-300/18 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/18"
            title="删除角色"
            :disabled="character.isSystem"
            :class="{ 'cursor-not-allowed opacity-50': character.isSystem }"
            @click.stop="emit('delete', character.id)"
          >
            <div i-solar:trash-bin-trash-line-duotone text-base />
          </button>
        </div>
      </div>

      <div class="rounded-2xl border border-white/35 bg-white/58 p-3 text-sm text-[#0071a0] shadow-inner dark:border-white/8 dark:bg-[#041f28]/62 dark:text-[#d8fbff]">
        <div class="mb-1 text-[11px] tracking-[0.14em] text-[#0081b3]/68 uppercase dark:text-[#98ecff]/60">
          Greeting
        </div>
        <p class="line-clamp-3 leading-6">
          {{ character.greeting || '这个角色还没有设置初始问候语。' }}
        </p>
      </div>

      <div class="flex items-center justify-between gap-3">
        <div class="text-xs text-[#0071a0]/62 dark:text-[#98ecff]/64">
          最近更新：{{ updatedLabel }}
        </div>

        <button
          class="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition"
          :class="isActive
            ? 'bg-[#0081b3] text-white shadow-[0_10px_24px_rgba(0,129,179,0.22)] dark:bg-[#c5fcff] dark:text-[#063a49]'
            : 'bg-[#0081b3]/10 text-[#0081b3] hover:bg-[#0081b3]/16 dark:bg-[#98ecff]/12 dark:text-[#c5fcff] dark:hover:bg-[#98ecff]/18'"
          @click.stop="emit('activate', character.id)"
        >
          <div :class="isActive ? 'i-solar:check-circle-bold-duotone' : 'i-solar:play-circle-line-duotone'" text-base />
          {{ isActive ? '当前角色' : '设为当前' }}
        </button>
      </div>
    </div>
  </article>
</template>
