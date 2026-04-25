<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useTTSStore } from '@/stores/tts'

const audioPlayer = useAudioPlayer()
const ttsStore = useTTSStore()
const route = useRoute()

const shouldShow = computed(() => {
  const hasPlayerState = audioPlayer.current.value || audioPlayer.queue.value.length > 0 || audioPlayer.error.value
  const hiddenOnHome = route.path === '/' && !ttsStore.showPlayerOnHome
  return ttsStore.moduleEnabled && !hiddenOnHome && Boolean(hasPlayerState)
})

const previewText = computed(() => {
  const text = audioPlayer.current.value?.text || ''
  return text.length > 42 ? `${text.slice(0, 42)}...` : text
})

const rangeMax = computed(() => Math.max(audioPlayer.duration.value, 1))
const progressStyle = computed(() => ({
  '--tts-progress': `${audioPlayer.progress.value}%`
}))

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00'
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function handleSeek(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(value)) {
    audioPlayer.seek(value)
  }
}
</script>

<template>
  <div v-if="shouldShow" class="tts-player">
    <div class="tts-player__main">
      <div class="tts-player__status">
        <div class="tts-player__icon" :class="{ 'tts-player__icon--active': audioPlayer.isPlaying.value }">
          <div v-if="audioPlayer.isPlaying.value" class="i-solar:soundwave-bold-duotone" />
          <div v-else class="i-solar:volume-loud-bold-duotone" />
        </div>
        <div class="tts-player__copy">
          <span class="tts-player__label">{{ audioPlayer.isPlaying.value ? 'Speaking' : 'Speech ready' }}</span>
          <span class="tts-player__text">{{ audioPlayer.error.value || previewText || 'Waiting for audio' }}</span>
        </div>
      </div>

      <div class="tts-player__actions">
        <button
          v-if="audioPlayer.isPlaying.value"
          class="tts-player__button"
          type="button"
          title="Pause"
          @click="audioPlayer.pause"
        >
          <div class="i-solar:pause-bold-duotone" />
        </button>
        <button
          v-else
          class="tts-player__button"
          type="button"
          title="Play"
          @click="audioPlayer.resume"
        >
          <div class="i-solar:play-bold-duotone" />
        </button>
        <button class="tts-player__button" type="button" title="Stop" @click="audioPlayer.stop">
          <div class="i-solar:stop-bold-duotone" />
        </button>
      </div>
    </div>

    <div class="tts-player__timeline">
      <span class="tts-player__time">{{ formatTime(audioPlayer.currentTime.value) }}</span>
      <input
        class="tts-player__range"
        type="range"
        min="0"
        :max="rangeMax"
        step="0.1"
        :value="audioPlayer.currentTime.value"
        :disabled="!audioPlayer.canSeek.value"
        :style="progressStyle"
        aria-label="Speech playback position"
        @input="handleSeek"
      >
      <span class="tts-player__time">{{ formatTime(audioPlayer.duration.value) }}</span>
    </div>

    <div v-if="audioPlayer.queue.value.length > 0" class="tts-player__queue">
      {{ audioPlayer.queue.value.length }} queued
    </div>
  </div>
</template>

<style scoped>
.tts-player {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 40;
  display: flex;
  width: min(26.5rem, calc(100vw - 2.5rem));
  min-height: 5.8rem;
  flex-direction: column;
  align-items: stretch;
  gap: 0.65rem;
  border: 1px solid rgb(255 255 255 / 0.82);
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.88);
  padding: 0.75rem;
  box-shadow:
    0 18px 45px rgb(0 129 179 / 0.16),
    inset 0 1px 0 rgb(255 255 255 / 0.94);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.tts-player__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  min-width: 0;
}

.tts-player__status {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
}

.tts-player__icon {
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 0.85rem;
  color: #0071a0;
  background: rgb(152 236 255 / 0.34);
  font-size: 1.25rem;
}

.tts-player__icon--active {
  color: white;
  background: linear-gradient(135deg, #0081b3, #33cfe6);
}

.tts-player__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.tts-player__label {
  color: #0071a0;
  font-size: 0.82rem;
  font-weight: 800;
}

.tts-player__text {
  overflow: hidden;
  color: rgb(0 0 0 / 0.58);
  font-size: 0.76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tts-player__actions {
  display: flex;
  flex: 0 0 auto;
  gap: 0.35rem;
}

.tts-player__button {
  display: flex;
  width: 2.15rem;
  height: 2.15rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(0 129 179 / 0.16);
  border-radius: 0.7rem;
  color: #0071a0;
  background: rgb(255 255 255 / 0.72);
  font-size: 1rem;
  transition: transform 120ms ease, background 120ms ease;
}

.tts-player__button:hover {
  background: rgb(152 236 255 / 0.24);
  transform: translateY(-1px);
}

.tts-player__timeline {
  display: grid;
  grid-template-columns: 2.4rem minmax(0, 1fr) 2.4rem;
  align-items: center;
  gap: 0.5rem;
}

.tts-player__time {
  color: rgb(0 113 160 / 0.7);
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-align: center;
}

.tts-player__range {
  --tts-progress: 0%;
  width: 100%;
  height: 0.55rem;
  border-radius: 999px;
  background:
    linear-gradient(
      90deg,
      #0081b3 0%,
      #33cfe6 var(--tts-progress),
      rgb(0 129 179 / 0.12) var(--tts-progress),
      rgb(0 129 179 / 0.12) 100%
    );
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.tts-player__range:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.tts-player__range::-webkit-slider-thumb {
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid white;
  border-radius: 999px;
  background: #0081b3;
  box-shadow: 0 4px 12px rgb(0 129 179 / 0.28);
  appearance: none;
  -webkit-appearance: none;
}

.tts-player__range::-moz-range-thumb {
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid white;
  border-radius: 999px;
  background: #0081b3;
  box-shadow: 0 4px 12px rgb(0 129 179 / 0.28);
}

.tts-player__queue {
  align-self: flex-end;
  color: rgb(0 129 179 / 0.62);
  font-size: 0.68rem;
  line-height: 1;
}

.dark .tts-player {
  border-color: rgb(41 189 226 / 0.22);
  background: rgb(0 34 45 / 0.88);
  box-shadow: 0 18px 45px rgb(0 0 0 / 0.28);
}

.dark .tts-player__label {
  color: #c5fcff;
}

.dark .tts-player__text {
  color: rgb(255 255 255 / 0.62);
}

.dark .tts-player__button {
  border-color: rgb(152 236 255 / 0.18);
  color: #c5fcff;
  background: rgb(0 71 102 / 0.52);
}

.dark .tts-player__time,
.dark .tts-player__queue {
  color: rgb(197 252 255 / 0.66);
}

.dark .tts-player__range {
  background:
    linear-gradient(
      90deg,
      #c5fcff 0%,
      #33cfe6 var(--tts-progress),
      rgb(197 252 255 / 0.16) var(--tts-progress),
      rgb(197 252 255 / 0.16) 100%
    );
}

.dark .tts-player__range::-webkit-slider-thumb {
  border-color: rgb(0 34 45);
  background: #c5fcff;
}

.dark .tts-player__range::-moz-range-thumb {
  border-color: rgb(0 34 45);
  background: #c5fcff;
}
</style>
