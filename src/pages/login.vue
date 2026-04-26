<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Button from '@/components/airi-ui/Button.vue'
import { useUserStore } from '@/stores/user'
import { normalizeAuthRedirect, saveAuthRedirect } from '@/utils/authRedirect'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const githubLoginIcon = 'i-solar:login-3-bold-duotone'
const localHomeIcon = 'i-solar:home-2-bold-duotone'

const redirectTarget = computed(() => normalizeAuthRedirect(route.query.redirect))
const authMessage = computed(() => {
  if (route.query.reason === 'expired') {
    return 'Login has expired. Please sign in again.'
  }
  return userStore.auth.error
})

onMounted(async () => {
  await userStore.initializeAuth()
  if (userStore.authEnabled && userStore.isAuthenticated) {
    await router.replace(redirectTarget.value)
  }
})

async function signIn() {
  saveAuthRedirect(redirectTarget.value)
  await userStore.startGitHubLogin()
}

async function continueLocal() {
  await router.replace(redirectTarget.value)
}
</script>

<template>
  <main class="login-page">
    <section class="login-panel">
      <div class="login-mark">
        <div i-solar:user-circle-bold-duotone />
      </div>

      <div class="login-copy">
        <p class="login-kicker">
          ATRI account
        </p>
        <h1>Sign in</h1>
        <p>
          {{ userStore.authEnabled
            ? 'Use the configured GitHub account to continue.'
            : 'Authentication is disabled for this local deployment.' }}
        </p>
      </div>

      <div v-if="authMessage" class="login-alert">
        <div i-solar:danger-circle-bold-duotone />
        <span>{{ authMessage }}</span>
      </div>

      <Button
        v-if="userStore.authEnabled"
        block
        :icon="githubLoginIcon"
        label="Continue with GitHub"
        :loading="userStore.auth.loading"
        @click="signIn"
      />

      <Button
        v-else
        block
        variant="secondary"
        :icon="localHomeIcon"
        label="Continue locally"
        :loading="userStore.auth.loading"
        @click="continueLocal"
      />
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-color);
}

.login-panel {
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

.login-mark {
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

.login-copy {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.login-kicker {
  color: rgb(0 129 179 / 0.78);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: uppercase;
}

.login-copy h1 {
  margin: 0;
  color: rgb(23 23 23);
  font-size: 1.75rem;
  font-weight: 500;
  letter-spacing: 0;
}

.login-copy p {
  margin: 0;
  color: rgb(82 82 82);
  line-height: 1.6;
}

.login-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: rgb(185 28 28);
  background: rgb(254 242 242 / 0.8);
  font-size: 0.875rem;
}

.dark .login-panel {
  border-color: rgb(152 236 255 / 0.14);
  background: rgb(0 0 0 / 0.34);
  box-shadow: 0 18px 48px rgb(0 0 0 / 0.28);
}

.dark .login-mark {
  color: #c5fcff;
  background: rgb(0 71 102 / 0.44);
}

.dark .login-copy h1 {
  color: rgb(245 245 245);
}

.dark .login-copy p {
  color: rgb(212 212 212);
}

.dark .login-alert {
  color: rgb(252 165 165);
  background: rgb(127 29 29 / 0.24);
}
</style>
