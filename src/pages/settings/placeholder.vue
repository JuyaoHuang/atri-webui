<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="placeholder-page">
    <div class="icon">🚧</div>
    <h2>{{ route.meta.title }}</h2>
    <p class="status">此功能正在开发中，敬请期待</p>
    <p class="phase-info">预计在 {{ route.meta.phase }} 实现</p>
  </div>
</template>

<style scoped>
.placeholder-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.status {
  color: #666;
  margin-bottom: 0.5rem;
}

.phase-info {
  color: #999;
  font-size: 0.875rem;
}
</style>
