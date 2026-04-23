<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

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
</script>

<template>
  <div class="settings-page">
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
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.settings-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e5e5e5;
  padding: 2rem 0;
  overflow-y: auto;
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.menu {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: #f5f5f5;
  color: #333;
}

.menu-item.active {
  background: #e3f2fd;
  color: #1976d2;
  border-left-color: #1976d2;
}

.menu-item .icon {
  font-size: 1.25rem;
  margin-right: 0.75rem;
}

.menu-item .title {
  flex: 1;
  font-size: 0.9rem;
}

.menu-item .badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: #ffa726;
  color: white;
  border-radius: 10px;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-page {
    flex-direction: column;
  }

  .settings-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e5e5;
  }
}
</style>
