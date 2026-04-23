<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <RouterLink
    to="/" flex="~"
    w-max items-center gap-2 px-2 text-nowrap text-2xl outline-none
  >
    <div
      class="header-link-icon"
    >
      <div i-solar:settings-bold-duotone text-xl />
    </div>
    <div translate-y="[2px]" font-quicksand font-semibold>
      <span>ATRI</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.header-link-icon {
  display: flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(23 23 23 / 0.05);
  border-radius: 0.75rem;
  background: rgb(23 23 23 / 0.05);
  color: rgb(68 119 245);
  transition: all 0.3s ease-in-out;
}

.dark .header-link-icon {
  border-color: rgb(245 245 245 / 0.08);
  background: rgb(245 245 245 / 0.08);
  color: rgb(184 208 255);
}
</style>
