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
      <div class="app-icon-wrap">
        <img src="/icon/icon.svg" alt="ATRI" class="header-link-logo" />
      </div>
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

.app-icon-wrap {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  overflow: hidden;
}

.header-link-logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }


.dark .header-link-icon {
  border-color: rgb(245 245 245 / 0.08);
  background: rgb(245 245 245 / 0.08);
  color: rgb(184 208 255);
}
</style>
