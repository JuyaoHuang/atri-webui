<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="placeholder-page">
    <div class="placeholder-content">
      <div class="icon-wrapper">
        <div class="icon">🚧</div>
        <div class="icon-glow"></div>
      </div>
      <h2 class="title">{{ route.meta.title }}</h2>
      <p class="status">此功能正在开发中，敬请期待</p>
      <div class="phase-badge">
        <span class="phase-text">{{ route.meta.phase }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  padding: 3rem;
  background: transparent;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 480px;
  text-align: center;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-wrapper {
  position: relative;
  margin-bottom: 2rem;
}

.icon {
  font-size: 5rem;
  animation: float 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.icon-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(170, 59, 255, 0.2) 0%, transparent 70%);
  filter: blur(20px);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: rgba(0, 0, 0, 0.85);
  letter-spacing: -0.02em;
}

.status {
  font-size: 1.125rem;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.phase-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, rgba(170, 59, 255, 0.12) 0%, rgba(192, 132, 252, 0.12) 100%);
  border: 1px solid rgba(170, 59, 255, 0.3);
  border-radius: 24px;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(170, 59, 255, 0.15);
}

.phase-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(170, 59, 255);
  letter-spacing: 0.02em;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, rgba(170, 59, 255, 0.8) 0%, rgba(192, 132, 252, 0.8) 100%);
  border-radius: 2px;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  .title {
    color: rgba(255, 255, 255, 0.9);
  }

  .status {
    color: rgba(255, 255, 255, 0.5);
  }

  .phase-badge {
    background: linear-gradient(135deg, rgba(192, 132, 252, 0.18) 0%, rgba(170, 59, 255, 0.18) 100%);
    border-color: rgba(192, 132, 252, 0.4);
    box-shadow: 0 4px 16px rgba(192, 132, 252, 0.25);
  }

  .phase-text {
    color: rgb(192, 132, 252);
  }

  .progress-bar {
    background: rgba(255, 255, 255, 0.08);
  }

  .progress-fill {
    background: linear-gradient(90deg, rgba(192, 132, 252, 0.8) 0%, rgba(170, 59, 255, 0.8) 100%);
  }

  .icon-glow {
    background: radial-gradient(circle, rgba(192, 132, 252, 0.3) 0%, transparent 70%);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .placeholder-page {
    padding: 2rem 1.5rem;
    min-height: 400px;
  }

  .icon {
    font-size: 4rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .status {
    font-size: 1rem;
  }
}
</style>
