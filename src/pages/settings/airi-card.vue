<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { toast } from 'vue-sonner'

import { getApiErrorMessage } from '@/api/client'
import CharacterForm from '@/components/character/CharacterForm.vue'
import CharacterList from '@/components/character/CharacterList.vue'
import { useCharactersStore } from '@/stores/characters'
import type { Character, CharacterExportPayload, CharacterFormPayload } from '@/types/character'
import { resolveAvatarUrl } from '@/utils/avatar'

const charactersStore = useCharactersStore()

const searchQuery = ref('')
const sortOption = ref<'nameAsc' | 'nameDesc' | 'updatedDesc'>('nameAsc')
const importInput = ref<HTMLInputElement | null>(null)

const showDetailDialog = ref(false)
const showFormDialog = ref(false)
const deleteCandidateId = ref<string | null>(null)
const editingCharacterId = ref<string | null>(null)

onMounted(async () => {
  await charactersStore.fetchCharacters()
})

const filteredCharacters = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const source = [...charactersStore.characters]

  const scoped = query
    ? source.filter(character =>
        character.name.toLowerCase().includes(query)
        || (character.description || '').toLowerCase().includes(query)
        || (character.greeting || '').toLowerCase().includes(query))
    : source

  if (sortOption.value === 'nameAsc') {
    return scoped.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
  }

  if (sortOption.value === 'nameDesc') {
    return scoped.sort((left, right) => right.name.localeCompare(left.name, 'zh-CN'))
  }

  return scoped.sort((left, right) => {
    const leftTime = left.updatedAt || left.createdAt || ''
    const rightTime = right.updatedAt || right.createdAt || ''
    return rightTime.localeCompare(leftTime)
  })
})

const detailCharacterId = ref<string | null>(null)

const detailCharacter = computed(() => {
  if (!detailCharacterId.value) {
    return null
  }

  return charactersStore.details[detailCharacterId.value]
    || charactersStore.characters.find(item => item.id === detailCharacterId.value)
    || null
})

const detailTabs = computed(() => {
  const character = detailCharacter.value
  if (!character) {
    return []
  }

  const tabs = []

  if (character.description) {
    tabs.push({ id: 'description', label: '简介', icon: 'i-solar:document-text-linear' })
  }
  if (character.greeting) {
    tabs.push({ id: 'greeting', label: '问候', icon: 'i-solar:chat-round-line-linear' })
  }
  tabs.push({ id: 'prompt', label: '设定', icon: 'i-solar:settings-linear' })
  return tabs
})

const activeDetailTab = ref<'description' | 'greeting' | 'prompt'>('description')

watch(detailTabs, (tabs) => {
  if (!tabs.some(tab => tab.id === activeDetailTab.value)) {
    activeDetailTab.value = (tabs[0]?.id as 'description' | 'greeting' | 'prompt' | undefined) || 'prompt'
  }
})

const openDetail = async (characterId: string) => {
  detailCharacterId.value = characterId
  activeDetailTab.value = 'description'
  showDetailDialog.value = true

  try {
    await charactersStore.fetchCharacterDetail(characterId)
  } catch (error) {
    console.error(error)
    toast.error('加载角色详情失败')
  }
}

const openCreateDialog = () => {
  editingCharacterId.value = null
  showDetailDialog.value = false
  showFormDialog.value = true
}

const openEditDialog = async (characterId: string) => {
  editingCharacterId.value = characterId
  showFormDialog.value = true
  showDetailDialog.value = false

  try {
    await charactersStore.fetchCharacterDetail(characterId)
  } catch (error) {
    console.error(error)
    toast.error('加载角色详情失败')
  }
}

const editingCharacter = computed(() => {
  if (!editingCharacterId.value) {
    return null
  }

  return charactersStore.details[editingCharacterId.value]
    || charactersStore.characters.find(item => item.id === editingCharacterId.value)
    || null
})

const handleActivate = (characterId: string) => {
  charactersStore.setActiveCharacter(characterId)
  toast.success('已切换当前角色')
}

const handleDeleteRequest = (characterId: string) => {
  deleteCandidateId.value = characterId
}

const confirmDelete = async () => {
  if (!deleteCandidateId.value) {
    return
  }

  try {
    await charactersStore.deleteCharacter(deleteCandidateId.value)
    if (detailCharacterId.value === deleteCandidateId.value) {
      showDetailDialog.value = false
      detailCharacterId.value = null
    }
    toast.success('角色已删除')
  } catch (error) {
    console.error(error)
    toast.error('删除角色失败')
  } finally {
    deleteCandidateId.value = null
  }
}

const handleFormSubmit = async (payload: CharacterFormPayload, avatarFile: File | null) => {
  try {
    const isEditing = Boolean(editingCharacterId.value)
    const requestPayload = {
      name: payload.name,
      greeting: payload.greeting || undefined,
      description: payload.description || undefined,
      system_prompt: payload.systemPrompt
    }

    const character = editingCharacterId.value
      ? await charactersStore.updateCharacter(editingCharacterId.value, requestPayload, avatarFile)
      : await charactersStore.createCharacter(requestPayload, avatarFile)

    showFormDialog.value = false
    editingCharacterId.value = null

    await charactersStore.fetchCharacterDetail(character.id, true)
    toast.success(isEditing ? '角色已更新' : '角色已创建')
  } catch (error) {
    console.error(error)
    toast.error(`保存角色失败：${getApiErrorMessage(error)}`)
  }
}

const triggerImport = () => {
  importInput.value?.click()
}

const dataUrlToFile = async (dataUrl: string, filename: string) => {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type || 'image/png' })
}

const fileToDataUrl = (file: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('FileReader result is not a string'))
      }
    }
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

const fetchAvatarDataUrl = async (character: Character) => {
  const avatarSrc = resolveAvatarUrl(character.avatar, character.avatarUrl)
  if (!avatarSrc) {
    return null
  }

  const response = await fetch(avatarSrc)
  if (!response.ok) {
    return null
  }

  return fileToDataUrl(await response.blob())
}

const downloadJson = (filename: string, payload: CharacterExportPayload) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const handleExport = async (characterId: string) => {
  try {
    const detail = await charactersStore.fetchCharacterDetail(characterId, true)
    const avatarDataUrl = await fetchAvatarDataUrl(detail)

    downloadJson(`${detail.id}.json`, {
      character_id: detail.id,
      name: detail.name,
      greeting: detail.greeting,
      description: detail.description,
      system_prompt: detail.systemPrompt || '',
      avatar: detail.avatar || null,
      avatar_url: detail.avatarUrl || null,
      avatar_data_url: avatarDataUrl
    })

    toast.success('角色卡已导出')
  } catch (error) {
    console.error(error)
    toast.error('导出角色失败')
  }
}

const handleImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    return
  }

  try {
    const raw = JSON.parse(await file.text()) as Partial<CharacterExportPayload>
    if (!raw.name || !raw.system_prompt) {
      throw new Error('角色文件缺少必要字段')
    }

    const avatarFile = raw.avatar_data_url
      ? await dataUrlToFile(raw.avatar_data_url, raw.avatar || `${raw.name}.png`)
      : null

    await charactersStore.createCharacter({
      character_id: raw.character_id,
      name: raw.name,
      greeting: raw.greeting || undefined,
      description: raw.description || undefined,
      system_prompt: raw.system_prompt
    }, avatarFile)

    toast.success('角色卡已导入')
  } catch (error) {
    console.error(error)
    toast.error('导入角色失败，请检查 JSON 格式')
  } finally {
    (event.target as HTMLInputElement).value = ''
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-xl p-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="relative min-w-[220px] flex-1">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <div i-solar:magnifer-line-duotone class="text-neutral-500 dark:text-neutral-400" />
        </div>
        <input
          v-model="searchQuery"
          type="search"
          class="w-full rounded-xl border border-neutral-200 bg-white/80 p-2.5 pl-10 text-sm outline-none transition focus:border-[#0081b3]/40 dark:border-neutral-700 dark:bg-[#031821]/88"
          placeholder="搜索角色名称、简介或问候语"
        >
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-[#0071a0]/72 dark:text-[#c5fcff]/70">排序：</span>
        <select
          v-model="sortOption"
          class="rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm outline-none transition focus:border-[#0081b3]/40 dark:border-neutral-700 dark:bg-[#031821]/88"
        >
          <option value="nameAsc">名称 A-Z</option>
          <option value="nameDesc">名称 Z-A</option>
          <option value="updatedDesc">最近更新</option>
        </select>
      </div>
    </div>

    <CharacterList
      :characters="filteredCharacters"
      :active-character-id="charactersStore.activeCharacterId"
      :selected-character-id="detailCharacterId"
      @open="openDetail"
      @edit="openEditDialog"
      @delete="handleDeleteRequest"
      @export="handleExport"
      @activate="handleActivate"
    >
      <template #prefix>
        <button
          class="group flex min-h-[248px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#98ecff]/52 bg-white/44 p-6 text-center text-[#0071a0] backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#0081b3]/45 hover:bg-white/72 dark:border-[#29bde2]/24 dark:bg-[#02212b]/60 dark:text-[#c5fcff]"
          @click="triggerImport"
        >
          <div i-solar:upload-square-line-duotone class="text-5xl text-[#29bde2]" />
          <div class="text-base font-medium">
            导入角色卡
          </div>
          <p class="text-sm text-[#0071a0]/68 dark:text-[#c5fcff]/70">
            从 JSON 文件恢复角色信息和可选头像。
          </p>
        </button>

        <button
          class="group flex min-h-[248px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#98ecff]/52 bg-[#98ecff]/18 p-6 text-center text-[#0071a0] backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#0081b3]/45 hover:bg-[#98ecff]/26 dark:border-[#29bde2]/24 dark:bg-[#083644]/66 dark:text-[#c5fcff]"
          @click="openCreateDialog"
        >
          <div i-solar:add-square-line-duotone class="text-5xl text-[#0081b3] dark:text-[#c5fcff]" />
          <div class="text-base font-medium">
            创建角色卡
          </div>
          <p class="text-sm text-[#0071a0]/68 dark:text-[#c5fcff]/70">
            新建一个会写回后端 Persona 的自定义角色。
          </p>
        </button>
      </template>
    </CharacterList>

    <input
      ref="importInput"
      type="file"
      accept="application/json"
      class="hidden"
      @change="handleImport"
    >

    <Teleport to="body">
      <div
        v-if="showDetailDialog && detailCharacter"
        class="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
        @click.self="showDetailDialog = false"
      >
        <div class="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[1.75rem] border border-white/20 bg-white/88 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#041a22]/94">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="h-18 w-18 overflow-hidden rounded-[1.75rem] border border-white/35 bg-[#98ecff]/18 dark:border-white/10 dark:bg-[#29bde2]/12">
                <img
                  v-if="resolveAvatarUrl(detailCharacter.avatar, detailCharacter.avatarUrl)"
                  :src="resolveAvatarUrl(detailCharacter.avatar, detailCharacter.avatarUrl)!"
                  :alt="detailCharacter.name"
                  class="h-full w-full object-cover"
                >
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center text-3xl text-[#0081b3] dark:text-[#c5fcff]"
                >
                  {{ detailCharacter.name.slice(0, 1) }}
                </div>
              </div>

              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="bg-gradient-to-r from-[#0081b3] to-[#29bde2] bg-clip-text text-2xl font-normal text-transparent dark:from-[#c5fcff] dark:to-[#29bde2]">
                    {{ detailCharacter.name }}
                  </h2>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] tracking-[0.12em] uppercase"
                    :class="detailCharacter.isSystem
                      ? 'bg-[#0081b3]/10 text-[#0081b3] dark:bg-[#98ecff]/12 dark:text-[#c5fcff]'
                      : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300'"
                  >
                    {{ detailCharacter.isSystem ? 'System' : 'Custom' }}
                  </span>
                </div>
                <p class="mt-2 text-sm text-[#0071a0]/72 dark:text-[#c5fcff]/70">
                  {{ detailCharacter.description || '还没有填写角色简介。' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                class="rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm text-neutral-700 transition hover:bg-white dark:border-neutral-700 dark:bg-white/6 dark:text-neutral-200 dark:hover:bg-white/10"
                @click="showDetailDialog = false"
              >
                关闭
              </button>
              <button
                class="rounded-xl border border-white/30 bg-white/80 px-3 py-2 text-sm text-[#0071a0] transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-[#c5fcff] dark:hover:bg-white/14"
                @click="openEditDialog(detailCharacter.id)"
              >
                编辑
              </button>
              <button
                class="rounded-xl bg-[#0081b3] px-3 py-2 text-sm text-white transition hover:bg-[#0071a0] dark:bg-[#c5fcff] dark:text-[#063a49] dark:hover:bg-[#d8fbff]"
                @click="handleActivate(detailCharacter.id)"
              >
                设为当前
              </button>
            </div>
          </div>

          <div class="mt-6 border-b border-neutral-200/80 dark:border-neutral-700/70">
            <div class="flex flex-wrap gap-1">
              <button
                v-for="tab in detailTabs"
                :key="tab.id"
                class="flex items-center gap-1 rounded-t-xl px-4 py-2 text-sm transition"
                :class="activeDetailTab === tab.id
                  ? 'border-b-2 border-[#0081b3] text-[#0081b3] dark:border-[#c5fcff] dark:text-[#c5fcff]'
                  : 'text-neutral-500 hover:text-[#0071a0] dark:text-neutral-400 dark:hover:text-[#c5fcff]'"
                @click="activeDetailTab = tab.id as 'description' | 'greeting' | 'prompt'"
              >
                <div :class="tab.icon" />
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="mt-5 rounded-2xl border border-white/22 bg-white/55 p-5 shadow-inner dark:border-white/6 dark:bg-[#031821]/88">
            <div v-if="activeDetailTab === 'description'" class="text-sm leading-7 text-[#0071a0] dark:text-[#d8fbff]">
              {{ detailCharacter.description || '还没有填写简介。' }}
            </div>
            <div v-else-if="activeDetailTab === 'greeting'" class="text-sm leading-7 text-[#0071a0] dark:text-[#d8fbff]">
              {{ detailCharacter.greeting || '还没有填写初始问候语。' }}
            </div>
            <div v-else class="whitespace-pre-wrap text-sm leading-7 text-[#0071a0] dark:text-[#d8fbff]">
              {{ detailCharacter.systemPrompt || '还没有加载到系统提示词。' }}
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showFormDialog"
        class="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
        @click.self="showFormDialog = false"
      >
        <div class="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[1.75rem] border border-white/20 bg-white/90 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#041a22]/94">
          <CharacterForm
            :mode="editingCharacter ? 'edit' : 'create'"
            :initial-character="editingCharacter"
            :submitting="charactersStore.submitting"
            @submit="handleFormSubmit"
            @cancel="showFormDialog = false"
          />
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="deleteCandidateId"
        class="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
        @click.self="deleteCandidateId = null"
      >
        <div class="w-full max-w-md rounded-[1.75rem] border border-white/20 bg-white/92 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#041a22]/94">
          <div class="flex items-start gap-3">
            <div class="rounded-2xl bg-rose-500/12 p-3 text-rose-500 dark:text-rose-200">
              <div i-solar:trash-bin-trash-bold-duotone text-2xl />
            </div>
            <div>
              <h3 class="text-lg text-[#0071a0] dark:text-[#f0fcff]">
                删除角色卡
              </h3>
              <p class="mt-2 text-sm leading-6 text-[#0071a0]/72 dark:text-[#c5fcff]/70">
                确认删除这个角色卡吗？这会移除角色 Persona 文件以及后端托管头像。
              </p>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-2">
            <button
              class="rounded-xl border border-neutral-200 bg-white/80 px-4 py-2 text-sm text-neutral-700 transition hover:bg-white dark:border-neutral-700 dark:bg-white/6 dark:text-neutral-200 dark:hover:bg-white/10"
              @click="deleteCandidateId = null"
            >
              取消
            </button>
            <button
              class="rounded-xl bg-rose-500 px-4 py-2 text-sm text-white transition hover:bg-rose-600"
              @click="confirmDelete"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div
      v-motion
      pointer-events-none
      fixed bottom-0 right--6 top="[calc(100dvh-15rem)]" z--1
      size-60
      flex items-center justify-center
      text="neutral-200/50 dark:neutral-600/20"
      :initial="{ scale: 0.9, opacity: 0, x: 20 }"
      :enter="{ scale: 1, opacity: 1, x: 0 }"
      :duration="500"
    >
      <div text="60" i-solar:emoji-funny-square-bold-duotone />
    </div>
  </div>
</template>
