<script setup lang="ts">
import BackgroundCustomizer from '@/components/settings/BackgroundCustomizer.vue'
</script>

<template>
  <div class="scene-settings">
    <div class="settings-header">
      <div class="header-content">
        <div class="icon-badge">🎨</div>
        <div class="header-text">
          <h2 class="title">场景设置</h2>
          <p class="description">自定义聊天背景，打造专属的聊天环境</p>
        </div>
      </div>
    </div>

    <div class="settings-body">
      <BackgroundCustomizer />
    </div>
  </div>
</template>

<style scoped>
.scene-settings {
  padding: 0;
  animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.settings-header {
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-badge {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  background: linear-gradient(135deg, rgba(170, 59, 255, 0.12) 0%, rgba(192, 132, 252, 0.12) 100%);
  border: 1px solid rgba(170, 59, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(170, 59, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-badge:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 6px 24px rgba(170, 59, 255, 0.25);
}

.header-text {
  flex: 1;
}

.title {
  font-size: 1.75rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 0.375rem;
  letter-spacing: -0.02em;
}

.description {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.5);
  line-height: 1.5;
}

.settings-body {
  padding: 0 2rem 2rem;
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  .settings-header {
    background: linear-gradient(135deg, rgba(30, 32, 40, 0.6) 0%, rgba(30, 32, 40, 0.4) 100%);
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .icon-badge {
    background: linear-gradient(135deg, rgba(192, 132, 252, 0.18) 0%, rgba(170, 59, 255, 0.18) 100%);
    border-color: rgba(192, 132, 252, 0.3);
    box-shadow: 0 4px 16px rgba(192, 132, 252, 0.25);
  }

  .icon-badge:hover {
    box-shadow: 0 6px 24px rgba(192, 132, 252, 0.35);
  }

  .title {
    color: rgba(255, 255, 255, 0.9);
  }

  .description {
    color: rgba(255, 255, 255, 0.5);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-header {
    padding: 1.5rem 1.5rem 1.25rem;
    margin-bottom: 1.5rem;
  }

  .header-content {
    gap: 1rem;
  }

  .icon-badge {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .description {
    font-size: 0.9375rem;
  }

  .settings-body {
    padding: 0 1.5rem 1.5rem;
  }
}
</style>
