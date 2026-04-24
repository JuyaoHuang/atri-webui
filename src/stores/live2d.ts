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
}

export interface Live2DState extends Live2DPreferences {
  models: Live2DModel[]
  loading: boolean
  uploading: boolean
  expressionRequest: Live2DExpressionRequest
}

const STORAGE_KEY = 'atri-live2d-settings'
const DEFAULT_PREFERENCES: Live2DPreferences = {
  enabled: false,
  activeModelId: null,
  position: { x: 0, y: 0 },
  scale: 1
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
      scale: parsed.scale ?? DEFAULT_PREFERENCES.scale
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
      }
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
          scale: this.scale
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

    requestExpression(name: string | null) {
      const activeModel = this.models.find(model => model.id === this.activeModelId)
      const matchedExpression = !name || !activeModel
        ? null
        : activeModel.expressions.find(expression => expression.toLowerCase() === name.toLowerCase()) || null

      this.expressionRequest = {
        name: matchedExpression,
        token: Date.now()
      }
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
