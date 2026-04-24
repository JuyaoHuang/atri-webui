<script setup lang="ts">
import { Application } from '@pixi/app'
import { extensions } from '@pixi/extensions'
import { InteractionManager } from '@pixi/interaction'
import { Ticker, TickerPlugin } from '@pixi/ticker'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Live2DModel } from 'pixi-live2d-display/cubism4'

import type { Live2DExpressionRequest, Live2DPosition } from '@/types/live2d'

interface Props {
  modelUrl?: string | null
  position?: Live2DPosition
  scale?: number
  expressionRequest?: Live2DExpressionRequest | null
  maxFps?: number
  resolution?: number
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelUrl: null,
  position: () => ({ x: 0, y: 0 }),
  scale: 1,
  expressionRequest: null,
  maxFps: 60,
  resolution: 2,
  emptyText: '当前没有可渲染的 Live2D 模型。'
})

const emit = defineEmits<{
  error: [message: string]
  loaded: []
}>()

let pixiExtensionsRegistered = false

const containerRef = ref<HTMLDivElement | null>(null)
const app = ref<Application | null>(null)
const model = ref<Live2DModel | null>(null)
const canvasReady = ref(false)
const width = ref(0)
const height = ref(0)
const initialModelWidth = ref(1)
const initialModelHeight = ref(1)
let resizeObserver: ResizeObserver | null = null

const hasModel = computed(() => Boolean(props.modelUrl))

const resolveMaxFps = (value: number) => {
  if (!value || value <= 0) {
    return 0
  }

  return Math.max(1, Math.round(value))
}

const registerPixiExtensions = () => {
  if (pixiExtensionsRegistered) {
    return
  }

  Live2DModel.registerTicker(Ticker)
  extensions.add(TickerPlugin)
  extensions.add(InteractionManager)
  pixiExtensionsRegistered = true
}

const createPixiApp = async () => {
  if (!containerRef.value || app.value) {
    return
  }

  registerPixiExtensions()

  const nextApp = new Application({
    width: Math.max(1, width.value) * props.resolution,
    height: Math.max(1, height.value) * props.resolution,
    backgroundAlpha: 0,
    preserveDrawingBuffer: true,
    autoDensity: false,
    resolution: 1
  })

  nextApp.ticker.maxFPS = resolveMaxFps(props.maxFps)
  nextApp.stage.scale.set(props.resolution)
  nextApp.view.style.width = '100%'
  nextApp.view.style.height = '100%'
  nextApp.view.style.display = 'block'
  nextApp.view.style.pointerEvents = 'auto'

  containerRef.value.appendChild(nextApp.view)
  app.value = nextApp
  canvasReady.value = true
}

const destroyModel = () => {
  if (!model.value || !app.value) {
    return
  }

  try {
    app.value.stage.removeChild(model.value as never)
    model.value.destroy()
  } catch (error) {
    console.warn('卸载 Live2D 模型失败:', error)
  } finally {
    model.value = null
  }
}

const destroyPixi = () => {
  destroyModel()
  if (app.value) {
    app.value.destroy(true)
    app.value = null
  }
  canvasReady.value = false
}

const applyTransform = () => {
  if (!model.value || width.value <= 0 || height.value <= 0) {
    return
  }

  const fittedScale = Math.min(
    (width.value * 0.72) / initialModelWidth.value,
    (height.value * 0.92) / initialModelHeight.value
  )
  const resolvedScale = Math.max(fittedScale * props.scale * 1.85, 0.01)

  model.value.scale.set(resolvedScale, resolvedScale)
  model.value.anchor.set(0.5, 1)
  model.value.x = (width.value / 2) + props.position.x
  model.value.y = height.value + props.position.y
}

const handleResize = () => {
  if (containerRef.value) {
    width.value = containerRef.value.clientWidth
    height.value = containerRef.value.clientHeight
  }

  if (app.value && width.value > 0 && height.value > 0) {
    app.value.renderer.resize(width.value * props.resolution, height.value * props.resolution)
    app.value.stage.scale.set(props.resolution)
  }

  applyTransform()
}

const loadModel = async () => {
  if (!app.value) {
    return
  }

  destroyModel()

  if (!props.modelUrl) {
    return
  }

  try {
    const loadedModel = await Live2DModel.from(props.modelUrl) as Live2DModel
    if (!app.value) {
      loadedModel.destroy()
      return
    }

    initialModelWidth.value = Math.max(loadedModel.width, 1)
    initialModelHeight.value = Math.max(loadedModel.height, 1)

    loadedModel.anchor.set(0.5, 1)
    app.value.stage.addChild(loadedModel as never)
    model.value = loadedModel
    applyTransform()
    emit('loaded')
  } catch (error) {
    console.error('加载 Live2D 模型失败:', error)
    emit('error', error instanceof Error ? error.message : '加载 Live2D 模型失败')
  }
}

const applyExpression = async () => {
  if (!model.value) {
    return
  }

  const expressionName = props.expressionRequest?.name
  if (!expressionName) {
    const motionManager = (model.value.internalModel as { motionManager?: { resetExpression?: () => void } }).motionManager
    motionManager?.resetExpression?.()
    return
  }

  try {
    await model.value.expression(expressionName)
  } catch (error) {
    console.warn('切换 Live2D 表情失败:', error)
  }
}

onMounted(async () => {
  await nextTick()
  handleResize()
  await createPixiApp()
  await loadModel()

  resizeObserver = new ResizeObserver(() => {
    handleResize()
  })

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  destroyPixi()
})

watch(() => props.modelUrl, async () => {
  await loadModel()
})

watch(
  () => [props.position.x, props.position.y, props.scale, props.resolution, props.maxFps],
  () => {
    if (app.value) {
      app.value.ticker.maxFPS = resolveMaxFps(props.maxFps)
    }
    handleResize()
  },
)

watch(() => props.expressionRequest?.token, async () => {
  await applyExpression()
})
</script>

<template>
  <div ref="containerRef" class="live2d-canvas">
    <div v-if="!hasModel" class="live2d-empty-state">
      <div class="empty-orb" />
      <p>{{ emptyText }}</p>
    </div>
  </div>
</template>

<style scoped>
.live2d-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.live2d-empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: rgb(0 129 179 / 0.68);
  text-align: center;
  pointer-events: none;
}

.empty-orb {
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 999px;
  background:
    radial-gradient(circle at 35% 35%, rgb(255 255 255 / 0.95), transparent 45%),
    radial-gradient(circle at center, rgb(152 236 255 / 0.68), rgb(0 129 179 / 0.16));
  box-shadow:
    0 24px 40px rgb(0 129 179 / 0.12),
    inset 0 1px 0 rgb(255 255 255 / 0.8);
}

.dark .live2d-empty-state {
  color: rgb(197 252 255 / 0.8);
}

.dark .empty-orb {
  background:
    radial-gradient(circle at 35% 35%, rgb(197 252 255 / 0.72), transparent 45%),
    radial-gradient(circle at center, rgb(41 189 226 / 0.58), rgb(0 51 69 / 0.12));
  box-shadow:
    0 24px 40px rgb(0 0 0 / 0.24),
    inset 0 1px 0 rgb(197 252 255 / 0.24);
}
</style>
