import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/index.vue')
    },
    {
      path: '/settings',
      component: () => import('@/pages/settings/index.vue'),
      children: [
        {
          path: 'account',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: '账户设置', phase: 'Phase 11', status: 'developing' }
        },
        {
          path: 'airi-card',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: '角色卡管理', phase: 'Phase 7', status: 'developing' }
        },
        {
          path: 'modules/consciousness',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: 'LLM 配置', phase: 'Phase 7', status: 'developing' }
        },
        {
          path: 'modules/speech',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: 'TTS 配置', phase: 'Phase 10', status: 'developing' }
        },
        {
          path: 'modules/hearing',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: 'ASR 配置', phase: 'Phase 9', status: 'developing' }
        },
        {
          path: 'modules/vision',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: '视觉模块', phase: 'Future', status: 'developing' }
        },
        {
          path: 'scene',
          component: () => import('@/pages/settings/scene.vue'),
          meta: { title: '场景设置', phase: 'Phase 6', status: 'active' }
        },
        {
          path: 'models',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: '模型管理', phase: 'Phase 8', status: 'developing' }
        },
        {
          path: 'providers',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: 'Provider 配置', phase: 'Phase 9-10', status: 'developing' }
        },
        {
          path: 'data',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: '数据管理', phase: 'Future', status: 'developing' }
        },
        {
          path: 'connection',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: '连接设置', phase: 'Phase 6', status: 'developing' }
        },
        {
          path: 'system',
          component: () => import('@/pages/settings/placeholder.vue'),
          meta: { title: '系统设置', phase: 'Phase 6', status: 'developing' }
        }
      ]
    }
  ]
})

export default router
