import { computed, onUnmounted, ref } from 'vue'

export function useAudioLevel() {
  const volumeLevel = ref(0)
  const history = ref<number[]>([])
  const threshold = ref(0.12)
  const error = ref<string | null>(null)

  let audioContext: AudioContext | undefined
  let analyser: AnalyserNode | undefined
  let source: MediaStreamAudioSourceNode | undefined
  let animationFrame: number | undefined

  const normalizedVolume = computed(() => Math.min(1, Math.max(0, volumeLevel.value / 100)))
  const isSpeech = computed(() => normalizedVolume.value >= threshold.value)

  async function start(stream: MediaStream) {
    stop()
    error.value = null
    try {
      audioContext = new AudioContext({ latencyHint: 'interactive' })
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.75
      source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        if (!analyser) {
          return
        }
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (const value of data) {
          const centered = (value - 128) / 128
          sum += centered * centered
        }
        const rms = Math.sqrt(sum / data.length)
        volumeLevel.value = Math.min(100, Math.round(rms * 180))
        history.value = [...history.value.slice(-95), Math.min(1, rms * 2.5)]
        animationFrame = requestAnimationFrame(tick)
      }
      tick()
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      stop()
    }
  }

  function stop() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = undefined
    }
    try {
      source?.disconnect()
    } catch {
      // The node may already be disconnected when the stream is torn down.
    }
    source = undefined
    analyser = undefined
    if (audioContext) {
      void audioContext.close()
      audioContext = undefined
    }
    volumeLevel.value = 0
  }

  onUnmounted(() => {
    stop()
  })

  return {
    volumeLevel,
    normalizedVolume,
    threshold,
    history,
    isSpeech,
    error,
    start,
    stop
  }
}
