import type { RouteRecordRaw } from 'vue-router'

import { createRouter, createWebHistory } from 'vue-router'

interface SettingsMetaConfig {
  order: number
  title: string
  description: string
  icon: string
  phase: string
  status: 'active' | 'developing'
}

function createSettingsMeta(config: SettingsMetaConfig) {
  return {
    title: config.title,
    subtitle: '设置',
    description: config.description,
    icon: config.icon,
    phase: config.phase,
    status: config.status,
    settingsEntry: true,
    order: config.order,
  }
}

const settingsChildren: RouteRecordRaw[] = [
  {
    path: 'account',
    component: () => import('@/pages/settings/placeholder.vue'),
    meta: createSettingsMeta({
      order: 1,
      title: '账户设置',
      description: '管理账户、登录状态与个人资料偏好。',
      icon: 'i-solar:user-circle-bold-duotone',
      phase: 'Phase 11',
      status: 'developing',
    }),
  },
  {
    path: 'airi-card',
    component: () => import('@/pages/settings/airi-card.vue'),
    meta: createSettingsMeta({
      order: 2,
      title: '角色卡管理',
      description: '创建、编辑、导入导出角色卡，并管理角色头像与提示词。',
      icon: 'i-solar:card-bold-duotone',
      phase: 'Phase 7',
      status: 'active',
    }),
  },
  {
    path: 'modules/consciousness',
    component: () => import('@/pages/settings/placeholder.vue'),
    meta: createSettingsMeta({
      order: 3,
      title: 'LLM 配置',
      description: '管理模型推理、提示词和认知模块参数。',
      icon: 'i-solar:cpu-bolt-bold-duotone',
      phase: 'Phase 7',
      status: 'developing',
    }),
  },
  {
    path: 'modules/speech',
    component: () => import('@/pages/settings/placeholder.vue'),
    meta: createSettingsMeta({
      order: 4,
      title: 'TTS 配置',
      description: '设置语音合成模型、音色与输出行为。',
      icon: 'i-solar:soundwave-bold-duotone',
      phase: 'Phase 10',
      status: 'developing',
    }),
  },
  {
    path: 'modules/hearing',
    component: () => import('@/pages/settings/placeholder.vue'),
    meta: createSettingsMeta({
      order: 5,
      title: 'ASR 配置',
      description: '调整语音识别链路、输入设备与转写策略。',
      icon: 'i-solar:microphone-3-bold-duotone',
      phase: 'Phase 9',
      status: 'developing',
    }),
  },
  {
    path: 'modules/vision',
    component: () => import('@/pages/settings/placeholder.vue'),
    meta: createSettingsMeta({
      order: 6,
      title: '视觉模块',
      description: '配置视觉感知能力、图像输入与扩展能力。',
      icon: 'i-solar:eye-bold-duotone',
      phase: 'Future',
      status: 'developing',
    }),
  },
  {
    path: 'scene',
    component: () => import('@/pages/settings/scene.vue'),
    meta: createSettingsMeta({
      order: 7,
      title: '场景设置',
      description: '自定义聊天背景、透明度和模糊效果。',
      icon: 'i-solar:armchair-2-bold-duotone',
      phase: 'Phase 6',
      status: 'active',
    }),
  },
  {
    path: 'models',
    component: () => import('@/pages/settings/models.vue'),
    meta: createSettingsMeta({
      order: 8,
      title: '角色模型',
      description: '启用 Live2D 舞台、管理模型资源，并调整模型在主页中的位置与尺寸。',
      icon: 'i-solar:database-bold-duotone',
      phase: 'Phase 8',
      status: 'active',
    }),
  },
  {
    path: 'providers',
    component: () => import('@/pages/settings/placeholder.vue'),
    meta: createSettingsMeta({
      order: 9,
      title: 'Provider 配置',
      description: '管理模型服务商、密钥和路由策略。',
      icon: 'i-solar:server-square-cloud-bold-duotone',
      phase: 'Phase 9-10',
      status: 'developing',
    }),
  },
  {
    path: 'data',
    component: () => import('@/pages/settings/placeholder.vue'),
    meta: createSettingsMeta({
      order: 10,
      title: '数据管理',
      description: '查看缓存、资源文件和持久化数据状态。',
      icon: 'i-solar:database-bold-duotone',
      phase: 'Future',
      status: 'developing',
    }),
  },
  {
    path: 'connection',
    component: () => import('@/pages/settings/placeholder.vue'),
    meta: createSettingsMeta({
      order: 11,
      title: '连接设置',
      description: '管理连接端点、网络状态与设备联通性。',
      icon: 'i-solar:server-square-cloud-bold-duotone',
      phase: 'Phase 6',
      status: 'developing',
    }),
  },
  {
    path: 'system',
    component: () => import('@/pages/settings/placeholder.vue'),
    meta: createSettingsMeta({
      order: 12,
      title: '系统设置',
      description: '集中管理系统偏好、交互行为和实验选项。',
      icon: 'i-solar:settings-bold-duotone',
      phase: 'Phase 6',
      status: 'developing',
    }),
  },
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/index.vue'),
  },
  {
    path: '/settings',
    component: () => import('@/pages/settings/index.vue'),
    meta: {
      title: '设置',
      description: '管理账户、角色、模块、场景和系统偏好。',
      icon: 'i-solar:settings-bold-duotone',
    },
    children: settingsChildren,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
