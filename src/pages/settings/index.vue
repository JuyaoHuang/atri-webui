<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

import HeaderLink from '@/components/layouts/HeaderLink.vue'
import PageHeader from '@/components/layouts/PageHeader.vue'
import IconItem from '@/components/menu/IconItem.vue'
import RippleGrid from '@/components/ui/RippleGrid.vue'
import { useRippleGridState } from '@/composables/useRippleGridState'

const route = useRoute()
const router = useRouter()
const { lastClickedIndex, setLastClickedIndex } = useRippleGridState('/settings')

const isSettingsHome = computed(() => route.path === '/settings')
const pageTitle = computed(() => (route.meta.title as string | undefined) || '')
const pageSubtitle = computed(() => route.meta.subtitle as string | undefined)
const disableBackButton = computed(() => Boolean(route.meta.disableBackButton))
const fallbackRoute = computed(() => (isSettingsHome.value ? '/' : '/settings'))

const settingsEntries = computed(() => {
  return router
    .getRoutes()
    .filter(currentRoute => currentRoute.meta?.settingsEntry)
    .sort((a, b) => Number(a.meta.order ?? 0) - Number(b.meta.order ?? 0))
    .map(currentRoute => ({
      title: (currentRoute.meta.title as string | undefined) || '',
      description: (currentRoute.meta.description as string | undefined) || '',
      icon: currentRoute.meta.icon as string | undefined,
      to: currentRoute.path,
    }))
})
</script>

<template>
  <div
    :style="{
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingRight: 'env(safe-area-inset-right, 0px)',
      paddingLeft: 'env(safe-area-inset-left, 0px)',
    }"
    class="h-full w-full flex flex-col"
  >
    <div
      class="hidden w-full gap-2 bg-$bg-color px-0 py-1 sm:block md:px-3 md:py-3"
    >
      <HeaderLink />
    </div>

    <div class="mx-auto flex min-h-0 w-full flex-1 flex-col px-3 py-0 md:py-0 xl:max-w-screen-2xl xl:px-4 2xl:max-w-screen-2xl">
      <PageHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
        :disable-back-button="disableBackButton"
        :fallback-route="fallbackRoute"
      />

      <div
        id="settings-scroll-container"
        class="relative min-h-0 flex-1 overflow-y-auto scrollbar-none"
      >
        <div v-if="isSettingsHome" flex="~ col gap-4" font-normal>
          <div pb-12>
            <RippleGrid
              :items="settingsEntries"
              :get-key="item => item.to"
              :columns="1"
              :origin-index="lastClickedIndex"
              @item-click="({ globalIndex }) => setLastClickedIndex(globalIndex)"
            >
              <template #item="{ item }">
                <IconItem
                  :title="item.title"
                  :description="item.description"
                  :icon="item.icon"
                  :to="item.to"
                />
              </template>
            </RippleGrid>
          </div>

          <div
            v-motion
            pointer-events-none
            fixed bottom-0 right--10 top="[calc(100dvh-12rem)]" z--1
            size-60
            flex items-center justify-center
            text="neutral-200/50 dark:neutral-600/20"
            :initial="{ scale: 0.9, opacity: 0, rotate: 180 }"
            :enter="{ scale: 1, opacity: 1, rotate: 0 }"
            :duration="500"
          >
            <div v-motion text="60" i-solar:settings-bold-duotone />
          </div>
        </div>

        <RouterView v-else />
      </div>
    </div>
  </div>
</template>
