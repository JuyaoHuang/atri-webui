<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { CharacterFormPayload, Character } from '@/types/character'
import { resolveAvatarUrl } from '@/utils/avatar'

const props = withDefaults(defineProps<{
  mode: 'create' | 'edit'
  initialCharacter?: Character | null
  submitting?: boolean
}>(), {
  initialCharacter: null,
  submitting: false
})

const emit = defineEmits<{
  submit: [payload: CharacterFormPayload, avatarFile: File | null]
  cancel: []
}>()

const activeTab = ref<'identity' | 'behavior' | 'system'>('identity')
const tabs = [
  { id: 'identity', label: '身份', icon: 'i-solar:user-circle-bold-duotone' },
  { id: 'behavior', label: '问候', icon: 'i-solar:chat-round-line-bold-duotone' },
  { id: 'system', label: '设定', icon: 'i-solar:settings-bold-duotone' }
] as const

const name = ref('')
const description = ref('')
const greeting = ref('')
const systemPrompt = ref('')
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

const isEditMode = computed(() => props.mode === 'edit')
const customNamePattern = /^[\p{L}\p{N}]+$/u
const hasValidName = computed(() => customNamePattern.test(name.value.trim()))
const nameHint = computed(() => {
  if (!name.value.trim()) {
    return '角色名会直接作为 CUSTOM 角色的 persona 文件名。'
  }

  if (hasValidName.value) {
    return '允许任意语言的字母和数字。'
  }

  return '角色名仅允许字母和数字，不能包含空格、标点或特殊符号。'
})
const currentAvatar = computed(() => {
  return avatarPreview.value
    || resolveAvatarUrl(props.initialCharacter?.avatar, props.initialCharacter?.avatarUrl)
})

watch(
  () => props.initialCharacter,
  (character) => {
    name.value = character?.name || ''
    description.value = character?.description || ''
    greeting.value = character?.greeting || ''
    systemPrompt.value = character?.systemPrompt || ''
    avatarFile.value = null
    avatarPreview.value = null
    activeTab.value = 'identity'
  },
  { immediate: true }
)

const handleAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    return
  }

  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    avatarPreview.value = typeof reader.result === 'string' ? reader.result : null
  }
  reader.readAsDataURL(file)
}

const handleSubmit = () => {
  emit('submit', {
    characterId: props.initialCharacter?.id,
    name: name.value.trim(),
    description: description.value.trim(),
    greeting: greeting.value.trim(),
    systemPrompt: systemPrompt.value.trim()
  }, avatarFile.value)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div>
      <h2 class="bg-gradient-to-r from-[#0081b3] to-[#29bde2] bg-clip-text text-2xl font-normal text-transparent dark:from-[#c5fcff] dark:to-[#29bde2]">
        {{ isEditMode ? '编辑角色卡' : '创建角色卡' }}
      </h2>
      <p class="mt-2 text-sm text-[#0071a0]/72 dark:text-[#c5fcff]/70">
        角色资料会写回后端 Persona 文件，新的上传头像会交由后端托管。
      </p>
    </div>

    <div class="border-b border-neutral-200/80 dark:border-neutral-700/70">
      <div class="flex flex-wrap gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex items-center gap-1 rounded-t-xl px-4 py-2 text-sm transition"
          :class="activeTab === tab.id
            ? 'border-b-2 border-[#0081b3] text-[#0081b3] dark:border-[#c5fcff] dark:text-[#c5fcff]'
            : 'text-neutral-500 hover:text-[#0071a0] dark:text-neutral-400 dark:hover:text-[#c5fcff]'"
          @click="activeTab = tab.id"
        >
          <div :class="tab.icon" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'identity'" class="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div class="rounded-2xl border border-[#98ecff]/35 bg-white/60 p-4 backdrop-blur-sm dark:border-[#29bde2]/20 dark:bg-[#062430]/70">
        <div class="mb-3 text-xs tracking-[0.14em] text-[#0081b3]/70 uppercase dark:text-[#98ecff]/62">
          Avatar
        </div>
        <div class="mx-auto flex h-34 w-34 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/35 bg-[#98ecff]/18 shadow-inner dark:border-white/10 dark:bg-[#29bde2]/12">
          <img v-if="currentAvatar" :src="currentAvatar" alt="avatar preview" class="h-full w-full object-cover">
          <div v-else class="text-4xl text-[#0081b3] dark:text-[#c5fcff]">
            {{ (name || '角').slice(0, 1) }}
          </div>
        </div>

        <label class="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#98ecff]/50 bg-white/65 px-4 py-3 text-sm text-[#0071a0] transition hover:border-[#0081b3]/42 hover:bg-white dark:border-[#29bde2]/28 dark:bg-white/6 dark:text-[#c5fcff] dark:hover:bg-white/10">
          <div i-solar:gallery-add-bold-duotone text-base />
          上传头像
          <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleAvatarChange">
        </label>

        <p class="mt-3 text-xs text-[#0071a0]/62 dark:text-[#98ecff]/64">
          支持 PNG / JPG / WEBP，大小限制 2MB。
        </p>
      </div>

      <div class="grid gap-4">
        <label class="flex flex-col gap-2">
          <span class="text-sm text-[#0071a0] dark:text-[#c5fcff]">角色名称</span>
          <input
            v-model="name"
            type="text"
            maxlength="50"
            class="rounded-xl border bg-white/75 px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-[#0081b3]/40 dark:bg-[#031821]/88 dark:text-neutral-100"
            :class="hasValidName || !name.trim()
              ? 'border-neutral-200 dark:border-neutral-700'
              : 'border-rose-300 text-rose-600 focus:border-rose-400 dark:border-rose-400/60 dark:text-rose-300'"
            placeholder="例如：测试 / Atri2"
          >
          <span
            class="text-xs"
            :class="hasValidName || !name.trim()
              ? 'text-[#0071a0]/62 dark:text-[#98ecff]/64'
              : 'text-rose-500 dark:text-rose-300'"
          >
            {{ nameHint }}
          </span>
        </label>

        <label class="flex flex-col gap-2">
          <span class="text-sm text-[#0071a0] dark:text-[#c5fcff]">简介</span>
          <textarea
            v-model="description"
            rows="5"
            maxlength="200"
            class="rounded-xl border border-neutral-200 bg-white/75 px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-[#0081b3]/40 dark:border-neutral-700 dark:bg-[#031821]/88 dark:text-neutral-100"
            placeholder="简要描述角色定位、气质和适合的聊天氛围。"
          />
        </label>
      </div>
    </div>

    <div v-else-if="activeTab === 'behavior'" class="grid gap-4">
      <label class="flex flex-col gap-2">
        <span class="text-sm text-[#0071a0] dark:text-[#c5fcff]">初始问候语</span>
        <textarea
          v-model="greeting"
          rows="6"
          maxlength="500"
          class="rounded-xl border border-neutral-200 bg-white/75 px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-[#0081b3]/40 dark:border-neutral-700 dark:bg-[#031821]/88 dark:text-neutral-100"
          placeholder="第一次进入对话时，角色会怎样开口。"
        />
      </label>
    </div>

    <div v-else class="grid gap-4">
      <label class="flex flex-col gap-2">
        <span class="text-sm text-[#0071a0] dark:text-[#c5fcff]">系统提示词</span>
        <textarea
          v-model="systemPrompt"
          rows="14"
          class="rounded-xl border border-neutral-200 bg-white/75 px-4 py-3 text-sm leading-6 text-neutral-800 outline-none transition focus:border-[#0081b3]/40 dark:border-neutral-700 dark:bg-[#031821]/88 dark:text-neutral-100"
          placeholder="输入角色的人设、说话风格、行为准则等完整设定。"
        />
      </label>
    </div>

    <div class="flex items-center justify-end gap-2">
      <button
        class="rounded-xl border border-neutral-200 bg-white/80 px-4 py-2 text-sm text-neutral-700 transition hover:bg-white dark:border-neutral-700 dark:bg-white/6 dark:text-neutral-200 dark:hover:bg-white/10"
        @click="emit('cancel')"
      >
        取消
      </button>
      <button
        class="rounded-xl bg-[#0081b3] px-4 py-2 text-sm text-white shadow-[0_14px_32px_rgba(0,129,179,0.22)] transition hover:bg-[#0071a0] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#c5fcff] dark:text-[#063a49] dark:hover:bg-[#d8fbff]"
        :disabled="submitting || !name.trim() || !systemPrompt.trim() || !hasValidName"
        @click="handleSubmit"
      >
        {{ submitting ? '保存中...' : isEditMode ? '保存修改' : '创建角色' }}
      </button>
    </div>
  </div>
</template>
