import { defineStore } from 'pinia'

import { live2dApi } from '@/api/live2d'
import type { Live2DModelResponse } from '@/api/types'
import type { Live2DExpressionRequest, Live2DModel, Live2DPosition } from '@/types/live2d'
import { extractLive2dExpression } from '@/utils/live2dExpression'

interface Live2DPreferences {
  enabled: boolean
  activeModelId: string | null
  position: Live2DPosition
  scale: number
  disableFocus: boolean
  idleAnimationEnabled: boolean
  autoBlinkEnabled: boolean
  forceAutoBlinkEnabled: boolean
  shadowEnabled: boolean
  maxFps: number
  renderScale: number
  modelParameters: Live2DModelParameters
  savedExpressionDefaults: string[]
}

export interface Live2DModelParameters {
  angleX: number
  angleY: number
  angleZ: number
  leftEyeOpen: number
  rightEyeOpen: number
  leftEyeSmile: number
  rightEyeSmile: number
  leftEyebrowLR: number
  rightEyebrowLR: number
  leftEyebrowY: number
  rightEyebrowY: number
  leftEyebrowAngle: number
  rightEyebrowAngle: number
  leftEyebrowForm: number
  rightEyebrowForm: number
  mouthOpen: number
  mouthForm: number
  cheek: number
  bodyAngleX: number
  bodyAngleY: number
  bodyAngleZ: number
  breath: number
}

export interface Live2DState extends Live2DPreferences {
  models: Live2DModel[]
  loading: boolean
  uploading: boolean
  expressionRequest: Live2DExpressionRequest
  activeExpressions: string[]
}

const STORAGE_KEY = 'atri-live2d-settings'
const DEFAULT_MODEL_PARAMETERS: Live2DModelParameters = {
  angleX: 0,
  angleY: 0,
  angleZ: 0,
  leftEyeOpen: 1,
  rightEyeOpen: 1,
  leftEyeSmile: 0,
  rightEyeSmile: 0,
  leftEyebrowLR: 0,
  rightEyebrowLR: 0,
  leftEyebrowY: 0,
  rightEyebrowY: 0,
  leftEyebrowAngle: 0,
  rightEyebrowAngle: 0,
  leftEyebrowForm: 0,
  rightEyebrowForm: 0,
  mouthOpen: 0,
  mouthForm: 0,
  cheek: 0,
  bodyAngleX: 0,
  bodyAngleY: 0,
  bodyAngleZ: 0,
  breath: 0
}

const DEFAULT_PREFERENCES: Live2DPreferences = {
  enabled: false,
  activeModelId: null,
  position: { x: 0, y: 0 },
  scale: 1,
  disableFocus: false,
  idleAnimationEnabled: true,
  autoBlinkEnabled: true,
  forceAutoBlinkEnabled: false,
  shadowEnabled: true,
  maxFps: 0,
  renderScale: 2,
  modelParameters: { ...DEFAULT_MODEL_PARAMETERS },
  savedExpressionDefaults: []
}

function loadPreferences(): Live2DPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...DEFAULT_PREFERENCES }
    }

    const parsed = JSON.parse(raw) as Partial<Live2DPreferences>
    return {
      enabled: parsed.enabled ?? DEFAULT_PREFERENCES.enabled,
      activeModelId: parsed.activeModelId ?? DEFAULT_PREFERENCES.activeModelId,
      position: {
        x: parsed.position?.x ?? DEFAULT_PREFERENCES.position.x,
        y: parsed.position?.y ?? DEFAULT_PREFERENCES.position.y
      },
      scale: parsed.scale ?? DEFAULT_PREFERENCES.scale,
      disableFocus: parsed.disableFocus ?? DEFAULT_PREFERENCES.disableFocus,
      idleAnimationEnabled: parsed.idleAnimationEnabled ?? DEFAULT_PREFERENCES.idleAnimationEnabled,
      autoBlinkEnabled: parsed.autoBlinkEnabled ?? DEFAULT_PREFERENCES.autoBlinkEnabled,
      forceAutoBlinkEnabled: parsed.forceAutoBlinkEnabled ?? DEFAULT_PREFERENCES.forceAutoBlinkEnabled,
      shadowEnabled: parsed.shadowEnabled ?? DEFAULT_PREFERENCES.shadowEnabled,
      maxFps: parsed.maxFps ?? DEFAULT_PREFERENCES.maxFps,
      renderScale: parsed.renderScale ?? DEFAULT_PREFERENCES.renderScale,
      modelParameters: {
        ...DEFAULT_MODEL_PARAMETERS,
        ...parsed.modelParameters
      },
      savedExpressionDefaults: parsed.savedExpressionDefaults ?? DEFAULT_PREFERENCES.savedExpressionDefaults
    }
  } catch (error) {
    console.error('加载 Live2D 设置失败:', error)
    return { ...DEFAULT_PREFERENCES }
  }
}

function mapModel(model: Live2DModelResponse): Live2DModel {
  return {
    id: model.id,
    name: model.name,
    modelPath: model.model_path,
    modelUrl: model.model_url,
    thumbnailUrl: model.thumbnail_url || undefined,
    expressions: model.expressions || [],
    createdAt: model.created_at,
    isDefault: model.is_default
  }
}

export const useLive2dStore = defineStore('live2d', {
  state: (): Live2DState => {
    const preferences = loadPreferences()
    return {
      ...preferences,
      models: [],
      loading: false,
      uploading: false,
      expressionRequest: {
        name: null,
        token: 0
      },
      activeExpressions: preferences.savedExpressionDefaults
    }
  },

  getters: {
    activeModel(state): Live2DModel | null {
      return state.models.find(model => model.id === state.activeModelId) || null
    }
  },

  actions: {
    savePreferences() {
      try {
        const payload: Live2DPreferences = {
          enabled: this.enabled,
          activeModelId: this.activeModelId,
          position: this.position,
          scale: this.scale,
          disableFocus: this.disableFocus,
          idleAnimationEnabled: this.idleAnimationEnabled,
          autoBlinkEnabled: this.autoBlinkEnabled,
          forceAutoBlinkEnabled: this.forceAutoBlinkEnabled,
          shadowEnabled: this.shadowEnabled,
          maxFps: this.maxFps,
          renderScale: this.renderScale,
          modelParameters: this.modelParameters,
          savedExpressionDefaults: this.savedExpressionDefaults
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch (error) {
        console.error('保存 Live2D 设置失败:', error)
      }
    },

    ensureActiveModel() {
      const active = this.models.find(model => model.id === this.activeModelId)
      if (active) {
        return
      }

      const fallbackModel = this.models.find(model => model.isDefault) || this.models[0] || null
      this.activeModelId = fallbackModel?.id || null
      this.savePreferences()
    },

    async fetchModels() {
      this.loading = true
      try {
        const response = await live2dApi.list()
        this.models = response.map(mapModel)
        this.ensureActiveModel()
        return this.models
      } catch (error) {
        console.error('获取 Live2D 模型失败:', error)
        this.models = []
        this.activeModelId = null
        return []
      } finally {
        this.loading = false
      }
    },

    async uploadModel(file: File, name?: string) {
      this.uploading = true
      try {
        const response = await live2dApi.upload(file, name)
        const model = mapModel(response)
        const existingIndex = this.models.findIndex(item => item.id === model.id)

        if (existingIndex >= 0) {
          this.models.splice(existingIndex, 1, model)
        } else {
          this.models.unshift(model)
        }

        if (model.isDefault || !this.activeModelId) {
          this.activeModelId = model.id
        }

        this.savePreferences()
        return model
      } finally {
        this.uploading = false
      }
    },

    async renameModel(modelId: string, name: string) {
      const response = await live2dApi.update(modelId, { name })
      const nextModel = mapModel(response)
      const index = this.models.findIndex(model => model.id === modelId)
      if (index >= 0) {
        this.models.splice(index, 1, nextModel)
      }
      if (this.activeModelId === modelId) {
        this.activeModelId = nextModel.id
      }
      this.savePreferences()
      return nextModel
    },

    async deleteModel(modelId: string) {
      await live2dApi.remove(modelId)
      this.models = this.models.filter(model => model.id !== modelId)
      if (this.activeModelId === modelId) {
        this.activeModelId = null
        this.ensureActiveModel()
      }
      this.savePreferences()
    },

    setEnabled(value: boolean) {
      this.enabled = value
      this.savePreferences()
    },

    setActiveModel(modelId: string) {
      this.activeModelId = modelId
      this.savePreferences()
    },

    setScale(value: number) {
      this.scale = value
      this.savePreferences()
    },

    setMaxFps(value: number) {
      this.maxFps = value
      this.savePreferences()
    },

    setRenderScale(value: number) {
      this.renderScale = value
      this.savePreferences()
    },

    setDisableFocus(value: boolean) {
      this.disableFocus = value
      this.savePreferences()
    },

    setIdleAnimationEnabled(value: boolean) {
      this.idleAnimationEnabled = value
      this.savePreferences()
    },

    setAutoBlinkEnabled(value: boolean) {
      this.autoBlinkEnabled = value
      this.savePreferences()
    },

    setForceAutoBlinkEnabled(value: boolean) {
      this.forceAutoBlinkEnabled = value
      this.savePreferences()
    },

    setShadowEnabled(value: boolean) {
      this.shadowEnabled = value
      this.savePreferences()
    },

    setPosition(position: Partial<Live2DPosition>) {
      this.position = {
        ...this.position,
        ...position
      }
      this.savePreferences()
    },

    resetTransform() {
      this.position = { ...DEFAULT_PREFERENCES.position }
      this.scale = DEFAULT_PREFERENCES.scale
      this.savePreferences()
    },

    setModelParameter<K extends keyof Live2DModelParameters>(key: K, value: Live2DModelParameters[K]) {
      this.modelParameters = {
        ...this.modelParameters,
        [key]: value
      }
      this.savePreferences()
    },

    resetModelParameters() {
      this.modelParameters = { ...DEFAULT_MODEL_PARAMETERS }
      this.savePreferences()
    },

    requestExpression(name: string | null) {
      const activeModel = this.models.find(model => model.id === this.activeModelId)
      const matchedExpression = !name || !activeModel
        ? null
        : activeModel.expressions.find(expression => expression.toLowerCase() === name.toLowerCase()) || null

      this.expressionRequest = {
        name: matchedExpression,
        token: Date.now()
      }

      this.activeExpressions = matchedExpression ? [matchedExpression] : []
    },

    toggleExpression(name: string) {
      const isActive = this.activeExpressions.includes(name)
      if (isActive) {
        this.activeExpressions = this.activeExpressions.filter(item => item !== name)
        this.requestExpression(null)
        return
      }

      this.activeExpressions = [name]
      this.requestExpression(name)
    },

    saveExpressionDefaults() {
      this.savedExpressionDefaults = [...this.activeExpressions]
      this.savePreferences()
    },

    resetAllExpressions() {
      this.activeExpressions = [...this.savedExpressionDefaults]
      this.requestExpression(this.activeExpressions[0] || null)
      this.savePreferences()
    },

    clearModelCache() {
      this.resetModelParameters()
      this.resetTransform()
      this.activeExpressions = []
      this.requestExpression(null)
      this.savePreferences()
    },

    parseAndApplyExpression(text: string) {
      const parsed = extractLive2dExpression(text)
      if (parsed.expression) {
        this.requestExpression(parsed.expression)
      }
      return parsed
    }
  }
})
