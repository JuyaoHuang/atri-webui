<script setup lang="ts">
import { computed } from 'vue'

import Button from '@/components/airi-ui/Button.vue'
import Callout from '@/components/airi-ui/Callout.vue'
import FieldCheckbox from '@/components/airi-ui/FieldCheckbox.vue'
import FieldRange from '@/components/airi-ui/FieldRange.vue'
import SelectTab from '@/components/airi-ui/SelectTab.vue'
import AiriColorPalette from './AiriColorPalette.vue'
import AiriSection from './AiriSection.vue'
import ModelSelectorDialog from './ModelSelectorDialog.vue'
import { useLive2dStore } from '@/stores/live2d'

const props = withDefaults(defineProps<{
  palette: string[]
  settingsClass?: string | string[]
  allowExtractColors?: boolean
}>(), {
  allowExtractColors: true,
})

defineEmits<{
  (e: 'extractColorsFromModel'): void
}>()

const live2dStore = useLive2dStore()

const SECTION_ICONS = {
  scale: 'i-solar:scale-bold-duotone',
  palette: 'i-solar:magic-stick-3-bold-duotone',
  parameters: 'i-solar:settings-bold-duotone',
  expressions: 'i-solar:face-scan-circle-bold-duotone',
} as const

const activeModel = computed(() => live2dStore.activeModel)
const parameterGroups = computed(() => [
  {
    title: 'Head Rotation',
    items: [
      { key: 'angleX', label: 'Angle X', min: -30, max: 30, step: 0.1 },
      { key: 'angleY', label: 'Angle Y', min: -30, max: 30, step: 0.1 },
      { key: 'angleZ', label: 'Angle Z', min: -30, max: 30, step: 0.1 },
    ],
  },
  {
    title: 'Eyes',
    items: [
      { key: 'leftEyeOpen', label: 'Left Eye Open/Close', min: 0, max: 1, step: 0.01 },
      { key: 'rightEyeOpen', label: 'Right Eye Open/Close', min: 0, max: 1, step: 0.01 },
      { key: 'leftEyeSmile', label: 'Left Eye Smiling', min: 0, max: 1, step: 0.01 },
      { key: 'rightEyeSmile', label: 'Right Eye Smiling', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    title: 'Eyebrows',
    items: [
      { key: 'leftEyebrowLR', label: 'Left eyebrow Left/Right', min: -1, max: 1, step: 0.01 },
      { key: 'rightEyebrowLR', label: 'Right eyebrow Left/Right', min: -1, max: 1, step: 0.01 },
      { key: 'leftEyebrowY', label: 'Left Eyebrow Y', min: -1, max: 1, step: 0.01 },
      { key: 'rightEyebrowY', label: 'Right Eyebrow Y', min: -1, max: 1, step: 0.01 },
      { key: 'leftEyebrowAngle', label: 'Left Eyebrow Angle', min: -1, max: 1, step: 0.01 },
      { key: 'rightEyebrowAngle', label: 'Right Eyebrow Angle', min: -1, max: 1, step: 0.01 },
      { key: 'leftEyebrowForm', label: 'Left Eyebrow Form', min: -1, max: 1, step: 0.01 },
      { key: 'rightEyebrowForm', label: 'Right Eyebrow Form', min: -1, max: 1, step: 0.01 },
    ],
  },
  {
    title: 'Mouth',
    items: [
      { key: 'mouthOpen', label: 'Mouth Open/Close', min: 0, max: 1, step: 0.01 },
      { key: 'mouthForm', label: 'Mouth Form', min: -1, max: 1, step: 0.01 },
    ],
  },
  {
    title: 'Face',
    items: [
      { key: 'cheek', label: 'Cheek', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    title: 'Body',
    items: [
      { key: 'bodyAngleX', label: 'Body rotation X', min: -10, max: 10, step: 0.1 },
      { key: 'bodyAngleY', label: 'Body rotation Y', min: -10, max: 10, step: 0.1 },
      { key: 'bodyAngleZ', label: 'Body rotation Z', min: -10, max: 10, step: 0.1 },
      { key: 'breath', label: 'Breath', min: 0, max: 1, step: 0.01 },
    ],
  },
])

const settingsClassList = computed(() => {
  if (!props.settingsClass) {
    return []
  }

  return typeof props.settingsClass === 'string' ? [props.settingsClass] : props.settingsClass
})

async function handleModelPick(modelId: string | undefined) {
  if (!modelId) {
    return
  }
  live2dStore.setActiveModel(modelId)
}

function toggleExpression(name: string) {
  live2dStore.toggleExpression(name)
}
</script>

<template>
  <div
    :class="[
      'flex flex-col gap-2',
      'z-10 overflow-y-scroll p-2',
      ...settingsClassList,
    ]"
  >
    <Callout label="我们支持 2D 模型">
      <p>
        点击 <strong>选择模型</strong> 从目录中导入不同格式的模型，目前仅支持
        <code>.zip</code>（Live2D）。
      </p>
      <p>
        AIRI 使用的是由 Live2D Inc. 开发的 2D 模型框架，这里沿用相同的展示与设置方式。
      </p>
    </Callout>
    <div class="flex flex-wrap gap-2">
      <ModelSelectorDialog :selected-model-id="live2dStore.activeModelId" @pick="handleModelPick">
        <Button variant="secondary">
          选择模型
        </Button>
      </ModelSelectorDialog>
    </div>
    <AiriSection
      title="缩放与位置"
      :section-icon="SECTION_ICONS.scale"
      :expand="true"
      size="sm"
      inner-class="rounded-xl bg-white/80 dark:bg-black/75 backdrop-blur-lg"
    >
      <FieldRange v-model="live2dStore.scale" as="div" :min="0.1" :max="3" :step="0.01" label="缩放">
        <template #label>
          <div flex items-center>
            <div>缩放</div>
            <button px-2 text-xs outline-none title="Reset value to default" @click="() => live2dStore.setScale(1)">
              <div i-solar:forward-linear transform-scale-x--100 text="neutral-500 dark:text-neutral-400" />
            </button>
          </div>
        </template>
      </FieldRange>
      <FieldRange v-model="live2dStore.position.x" as="div" :min="-3000" :max="3000" :step="1" label="X">
        <template #label>
          <div flex items-center>
            <div>X</div>
            <button px-2 text-xs outline-none title="Reset value to default" @click="() => live2dStore.setPosition({ x: 0 })">
              <div i-solar:forward-linear transform-scale-x--100 text="neutral-500 dark:text-neutral-400" />
            </button>
          </div>
        </template>
      </FieldRange>
      <FieldRange v-model="live2dStore.position.y" as="div" :min="-3000" :max="3000" :step="1" label="Y">
        <template #label>
          <div flex items-center>
            <div>Y</div>
            <button px-2 text-xs outline-none title="Reset value to default" @click="() => live2dStore.setPosition({ y: 0 })">
              <div i-solar:forward-linear transform-scale-x--100 text="neutral-500 dark:text-neutral-400" />
            </button>
          </div>
        </template>
      </FieldRange>
    </AiriSection>
    <AiriSection
      v-if="allowExtractColors"
      title="从模型提取主题颜色"
      :section-icon="SECTION_ICONS.palette"
      :expand="false"
      size="sm"
      inner-class="rounded-xl bg-white/80 dark:bg-black/75 backdrop-blur-lg"
    >
      <AiriColorPalette class="mb-4 mt-2" :colors="palette.map(hex => ({ hex, name: hex }))" />
      <Button variant="secondary" :disabled="!activeModel" @click="$emit('extractColorsFromModel')">
        提取
      </Button>
    </AiriSection>
    <AiriSection
      title="Parameters"
      :section-icon="SECTION_ICONS.parameters"
      :expand="false"
      size="sm"
      inner-class="rounded-xl bg-white/80 dark:bg-black/75 backdrop-blur-lg"
    >
      <FieldCheckbox
        v-model="live2dStore.disableFocus"
        label="禁用 Live2D 模型的鼠标追踪"
        placement="right"
      />
      <FieldRange
        v-model="live2dStore.renderScale"
        as="div"
        :min="0.5"
        :max="2"
        :step="0.25"
        label="渲染精度"
      />
      <div class="flex flex-col gap-4">
        <div class="text-sm font-medium">帧率</div>
        <SelectTab v-model="live2dStore.maxFps" :options="[
          { value: 0, label: '∞' },
          { value: 60, label: '60' },
          { value: 30, label: '30' },
        ]" size="sm" />
      </div>
      <FieldCheckbox v-model="live2dStore.autoBlinkEnabled" label="Auto Blink" placement="right" />
      <FieldCheckbox v-model="live2dStore.forceAutoBlinkEnabled" label="Force Auto Blink (fallback timer)" placement="right" />
      <FieldCheckbox v-model="live2dStore.shadowEnabled" label="Shadow" placement="right" />
      <Button variant="secondary" class="mt-4 w-full" @click="live2dStore.resetModelParameters()">
        Reset To Default Parameters
      </Button>
      <Button variant="secondary" class="mt-2 w-full" @click="live2dStore.clearModelCache()">
        Clear Model Cache
      </Button>
      <div
        v-for="group in parameterGroups"
        :key="group.title"
        class="parameter-group"
      >
        <div class="parameter-group__title">{{ group.title }}</div>
        <FieldRange
          v-for="item in group.items"
          :key="String(item.key)"
          v-model="live2dStore.modelParameters[item.key as keyof typeof live2dStore.modelParameters]"
          as="div"
          :min="item.min"
          :max="item.max"
          :step="item.step"
          :label="item.label"
        >
          <template #label>
            <div flex items-center>
              <div>{{ item.label }}</div>
              <button px-2 text-xs outline-none title="Reset value to default" @click="live2dStore.setModelParameter(item.key as never, 0 as never)">
                <div i-solar:forward-linear transform-scale-x--100 text="neutral-500 dark:text-neutral-400" />
              </button>
            </div>
          </template>
        </FieldRange>
      </div>
    </AiriSection>
    <AiriSection
      title="Expressions"
      :section-icon="SECTION_ICONS.expressions"
      :expand="false"
      size="sm"
      inner-class="rounded-xl bg-white/80 dark:bg-black/75 backdrop-blur-lg"
    >
      <template v-if="activeModel?.expressions?.length">
        <FieldCheckbox
          v-for="expression in activeModel.expressions"
          :key="expression"
          :model-value="live2dStore.activeExpressions.includes(expression)"
          :label="expression"
          placement="right"
          @update:model-value="toggleExpression(expression)"
        />
        <div class="airi-expression-actions">
          <Button variant="secondary" @click="live2dStore.saveExpressionDefaults()">
            Save Expression Defaults
          </Button>
          <Button variant="secondary" @click="live2dStore.resetAllExpressions()">
            Reset All Expressions
          </Button>
        </div>
      </template>
      <div v-else class="airi-empty-text">
        No expressions available for this model.
      </div>
    </AiriSection>
  </div>
</template>

<style scoped>
.parameter-group {
  margin-top: 1rem;
}

.parameter-group__title {
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(115 115 115);
}

.airi-expression-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
}

.airi-empty-text {
  color: rgb(115 115 115);
  font-size: 0.875rem;
}

.dark .parameter-group__title,
.dark .airi-empty-text {
  color: rgb(163 163 163);
}
</style>
