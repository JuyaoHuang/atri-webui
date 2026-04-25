<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Button from '@/components/airi-ui/Button.vue'
import { useUserStore } from '@/stores/user'
import { consumeAuthRedirect } from '@/utils/authRedirect'

type CallbackState = 'loading' | 'error' | 'disabled'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const state = ref<CallbackState>('loading')
const message = ref('Completing sign-in...')

onMounted(async () => {
  const disabled = firstQueryValue(route.query.auth) === 'disabled'
  if (disabled) {
    state.value = 'disabled'
    message.value = 'Authentication is disabled for this deployment.'
    await userStore.initializeAuth(true)
    return
  }

  const oauthError = firstQueryValue(route.query.error)
  if (oauthError) {
    state.value = 'error'
    message.value = firstQueryValue(route.query.detail) || oauthError
    return
  }

  const token = firstQueryValue(route.query.token)
  if (!token) {
    state.value = 'error'
    message.value = 'Missing authentication token.'
    return
  }

  try {
    await userStore.completeLogin(token, {
      username: firstQueryValue(route.query.username) || 'github-user',
      avatar_url: firstQueryValue(route.query.avatar_url)
    })
    await router.replace(consumeAuthRedirect('/'))
  } catch (error) {
    state.value = 'error'
    message.value = error instanceof Error ? error.message : String(error)
  }
})

function firstQueryValue(value: unknown): string | null {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : null
  }
  return typeof value === 'string' ? value : null
}

async function goToLogin() {
  await router.replace('/login')
}

async function goHome() {
  await router.replace('/')
}
</script>

<template>
  <main class="callback-page">
    <section class="callback-panel">
      <div class="callback-mark" :class="state">
        <div v-if="state === 'loading'" i-solar:refresh-bold-duotone class="animate-spin" />
        <div v-else-if="state === 'disabled'" i-solar:shield-minimalistic-bold-duotone />
        <div v-else i-solar:close-circle-bold-duotone />
      </div>

      <div class="callback-copy">
        <p class="callback-kicker">
          GitHub OAuth
        </p>
        <h1>
          {{ state === 'loading' ? 'Signing in' : state === 'disabled' ? 'Local mode' : 'Sign-in failed' }}
        </h1>
        <p>{{ message }}</p>
      </div>

      <Button
        v-if="state === 'error'"
        block
        icon="i-solar:login-3-bold-duotone"
        label="Back to sign in"
        @click="goToLogin"
      />

      <Button
        v-else-if="state === 'disabled'"
        block
        variant="secondary"
        icon="i-solar:home-2-bold-duotone"
        label="Continue locally"
        @click="goHome"
      />
    </section>
  </main>
</template>

<style scoped>
.callback-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-color);
}

.callback-panel {
  width: min(100%, 26rem);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1px solid rgb(0 129 179 / 0.12);
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: rgb(255 255 255 / 0.72);
  box-shadow: 0 18px 48px rgb(0 71 102 / 0.12);
  backdrop-filter: blur(18px);
}

.callback-mark {
  width: 3.25rem;
  height: 3.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: #0071a0;
  background: rgb(152 236 255 / 0.28);
  font-size: 1.75rem;
}

.callback-mark.error {
  color: rgb(185 28 28);
  background: rgb(254 226 226 / 0.82);
}

.callback-mark.disabled {
  color: rgb(82 82 82);
  background: rgb(245 245 245 / 0.86);
}

.callback-copy {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.callback-kicker {
  color: rgb(0 129 179 / 0.78);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: uppercase;
}

.callback-copy h1 {
  margin: 0;
  color: rgb(23 23 23);
  font-size: 1.75rem;
  font-weight: 500;
  letter-spacing: 0;
}

.callback-copy p {
  margin: 0;
  color: rgb(82 82 82);
  line-height: 1.6;
}

.dark .callback-panel {
  border-color: rgb(152 236 255 / 0.14);
  background: rgb(0 0 0 / 0.34);
  box-shadow: 0 18px 48px rgb(0 0 0 / 0.28);
}

.dark .callback-mark {
  color: #c5fcff;
  background: rgb(0 71 102 / 0.44);
}

.dark .callback-mark.error {
  color: rgb(252 165 165);
  background: rgb(127 29 29 / 0.24);
}

.dark .callback-mark.disabled {
  color: rgb(212 212 212);
  background: rgb(38 38 38 / 0.72);
}

.dark .callback-copy h1 {
  color: rgb(245 245 245);
}

.dark .callback-copy p {
  color: rgb(212 212 212);
}
</style>
