<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuItems = [
  { path: '/settings/account', title: '账户设置', icon: '👤', phase: 'Phase 11', status: 'developing' },
  { path: '/settings/airi-card', title: '角色卡管理', icon: '🎭', phase: 'Phase 7', status: 'developing' },
  { path: '/settings/modules/consciousness', title: 'LLM 配置', icon: '🧠', phase: 'Phase 7', status: 'developing' },
  { path: '/settings/modules/speech', title: 'TTS 配置', icon: '🔊', phase: 'Phase 10', status: 'developing' },
  { path: '/settings/modules/hearing', title: 'ASR 配置', icon: '🎤', phase: 'Phase 9', status: 'developing' },
  { path: '/settings/modules/vision', title: '视觉模块', icon: '👁️', phase: 'Future', status: 'developing' },
  { path: '/settings/scene', title: '场景设置', icon: '🎨', phase: 'Phase 6', status: 'active' },
  { path: '/settings/models', title: '模型管理', icon: '🤖', phase: 'Phase 8', status: 'developing' },
  { path: '/settings/providers', title: 'Provider 配置', icon: '⚙️', phase: 'Phase 9-10', status: 'developing' },
  { path: '/settings/data', title: '数据管理', icon: '💾', phase: 'Future', status: 'developing' },
  { path: '/settings/connection', title: '连接设置', icon: '🔌', phase: 'Phase 6', status: 'developing' },
  { path: '/settings/system', title: '系统设置', icon: '🛠️', phase: 'Phase 6', status: 'developing' }
]

const isActive = (path: string) => {
  return route.path === path
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="settings-page">
    <!-- 返回主页按钮 -->
    <button
      @click="goHome"
      class="back-btn"
      title="返回主页"
      aria-label="返回主页"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </button>

    <!-- 侧边栏导航 -->
    <aside class="settings-sidebar">
      <h2 class="sidebar-title">设置</h2>
      <nav class="menu">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="title">{{ item.title }}</span>
          <span v-if="item.status === 'developing'" class="badge">开发中</span>
        </router-link>
      </nav>
    </aside>

    <!-- 内容区域 -->
    <main class="settings-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.settings-page {
  position: relative;
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(250, 250, 252, 0.95) 0%, rgba(245, 247, 250, 0.98) 100%);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
}

.back-btn {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

.back-btn:active {
  transform: translateY(0) scale(0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.settings-sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  padding: 2rem 0;
  overflow-y: auto;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
}

.sidebar-title {
  font-size: 1.75rem;
  font-weight: 600;
  padding: 0 1.5rem;
  margin-bottom: 2rem;
  color: rgba(0, 0, 0, 0.85);
  letter-spacing: -0.02em;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 0.75rem;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  color: rgba(0, 0, 0, 0.6);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  border-left: 3px solid transparent;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(170, 59, 255, 0.08) 0%, rgba(192, 132, 252, 0.08) 100%);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:hover {
  color: rgba(0, 0, 0, 0.85);
  transform: translateX(4px);
}

.menu-item:hover::before {
  opacity: 1;
}

.menu-item.active {
  background: linear-gradient(135deg, rgba(170, 59, 255, 0.12) 0%, rgba(192, 132, 252, 0.12) 100%);
  color: rgb(170, 59, 255);
  border-left-color: rgb(170, 59, 255);
  box-shadow: 0 4px 16px rgba(170, 59, 255, 0.15);
}

.menu-item .icon {
  font-size: 1.25rem;
  margin-right: 0.875rem;
  z-index: 1;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:hover .icon {
  transform: scale(1.1);
}

.menu-item .title {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
  z-index: 1;
  letter-spacing: -0.01em;
}

.menu-item .badge {
  font-size: 0.6875rem;
  padding: 0.25rem 0.625rem;
  background: linear-gradient(135deg, rgba(255, 167, 38, 0.9) 0%, rgba(255, 152, 0, 0.9) 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(255, 167, 38, 0.3);
  letter-spacing: 0.02em;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: transparent;
}

/* 自定义滚动条 */
.settings-sidebar::-webkit-scrollbar {
  width: 6px;
}

.settings-sidebar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 3px;
}

.settings-sidebar::-webkit-scrollbar-thumb {
  background: rgba(170, 59, 255, 0.2);
  border-radius: 3px;
  transition: background 0.3s;
}

.settings-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(170, 59, 255, 0.4);
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  .settings-page {
    background: linear-gradient(135deg, rgba(22, 23, 29, 0.95) 0%, rgba(28, 30, 38, 0.98) 100%);
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.85);
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.95);
  }

  .settings-sidebar {
    background: rgba(30, 32, 40, 0.7);
    border-right-color: rgba(255, 255, 255, 0.08);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
  }

  .sidebar-title {
    color: rgba(255, 255, 255, 0.9);
  }

  .menu-item {
    color: rgba(255, 255, 255, 0.6);
  }

  .menu-item::before {
    background: linear-gradient(135deg, rgba(192, 132, 252, 0.12) 0%, rgba(170, 59, 255, 0.12) 100%);
  }

  .menu-item:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .menu-item.active {
    background: linear-gradient(135deg, rgba(192, 132, 252, 0.18) 0%, rgba(170, 59, 255, 0.18) 100%);
    color: rgb(192, 132, 252);
    border-left-color: rgb(192, 132, 252);
    box-shadow: 0 4px 16px rgba(192, 132, 252, 0.25);
  }

  .settings-sidebar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }

  .settings-sidebar::-webkit-scrollbar-thumb {
    background: rgba(192, 132, 252, 0.2);
  }

  .settings-sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(192, 132, 252, 0.4);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-page {
    flex-direction: column;
  }

  .back-btn {
    top: 1rem;
    right: 1rem;
    width: 44px;
    height: 44px;
  }

  .settings-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 1.5rem 0;
  }

  .sidebar-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .settings-content {
    padding: 1.5rem;
  }
}
</style>
