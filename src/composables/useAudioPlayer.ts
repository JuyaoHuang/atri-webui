import { computed, ref } from 'vue'

import { useTTSStore } from '@/stores/tts'

interface QueueItem {
  id: string
  text: string
  url: string
  source: 'auto' | 'manual' | 'test'
}

interface EnqueueOptions {
  source?: QueueItem['source']
  voiceId?: string
}

const queue = ref<QueueItem[]>([])
const current = ref<QueueItem | null>(null)
const isPlaying = ref(false)
const error = ref<string | null>(null)
let audio: HTMLAudioElement | null = null

function ensureAudio() {
  if (!audio && typeof Audio !== 'undefined') {
    audio = new Audio()
    audio.onended = () => finishCurrent()
    audio.onerror = () => {
      error.value = 'Audio playback failed'
      finishCurrent()
    }
  }
  return audio
}

function revokeItem(item: QueueItem | null) {
  if (item?.url) {
    URL.revokeObjectURL(item.url)
  }
}

function errorMessage(value: unknown): string {
  return value instanceof Error ? value.message : String(value)
}

async function playNext() {
  if (current.value || queue.value.length === 0) {
    return
  }

  const item = queue.value.shift()
  if (!item) {
    return
  }

  const player = ensureAudio()
  if (!player) {
    revokeItem(item)
    error.value = 'Audio playback is not available in this environment'
    return
  }

  const ttsStore = useTTSStore()
  current.value = item
  player.src = item.url
  player.volume = Math.min(1, Math.max(0, ttsStore.outputVolume))

  try {
    await player.play()
    isPlaying.value = true
  } catch (playbackError) {
    error.value = errorMessage(playbackError)
    finishCurrent()
  }
}

function finishCurrent() {
  const finished = current.value
  current.value = null
  isPlaying.value = false
  revokeItem(finished)
  void playNext()
}

export function useAudioPlayer() {
  const ttsStore = useTTSStore()

  async function enqueueText(text: string, options: EnqueueOptions = {}) {
    const normalizedText = text.trim()
    if (!normalizedText) {
      return
    }

    error.value = null
    await ttsStore.ensureLoaded()

    const blob = await ttsStore.synthesize({
      text: normalizedText,
      provider: ttsStore.config.tts_model,
      voice_id: options.voiceId
    })
    const item: QueueItem = {
      id: `tts_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      text: normalizedText,
      source: options.source || 'manual',
      url: URL.createObjectURL(blob)
    }
    queue.value.push(item)
    await playNext()
  }

  function pause() {
    if (!audio || !current.value) {
      return
    }
    audio.pause()
    isPlaying.value = false
  }

  async function resume() {
    if (!audio || !current.value) {
      await playNext()
      return
    }
    try {
      await audio.play()
      isPlaying.value = true
    } catch (playbackError) {
      error.value = errorMessage(playbackError)
    }
  }

  function stop() {
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    revokeItem(current.value)
    queue.value.forEach(revokeItem)
    current.value = null
    queue.value = []
    isPlaying.value = false
  }

  return {
    queue: computed(() => queue.value),
    current: computed(() => current.value),
    isPlaying: computed(() => isPlaying.value),
    isBusy: computed(() => isPlaying.value || Boolean(current.value) || ttsStore.synthesizing),
    error: computed(() => error.value || ttsStore.error),
    enqueueText,
    pause,
    resume,
    stop
  }
}
