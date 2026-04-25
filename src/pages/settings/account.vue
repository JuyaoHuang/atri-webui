<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import Button from '@/components/airi-ui/Button.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const nickname = ref(userStore.settings.nickname)
const avatar = ref(userStore.settings.avatar)

const dirty = computed(() => {
  return nickname.value !== userStore.settings.nickname || avatar.value !== userStore.settings.avatar
})

const sessionTitle = computed(() => {
  if (!userStore.authEnabled) {
    return 'Local session'
  }
  return userStore.isAuthenticated ? 'GitHub session' : 'Signed out'
})

const sessionDetail = computed(() => {
  if (!userStore.authEnabled) {
    return 'Authentication is disabled'
  }
  return userStore.auth.user?.username || 'Authentication is required'
})

const avatarPreview = computed(() => userStore.avatarUrl)
const signedInLabel = computed(() => {
  if (!userStore.auth.signedInAt) {
    return null
  }
  return new Date(userStore.auth.signedInAt).toLocaleString()
})

onMounted(async () => {
  await userStore.initializeAuth()
  nickname.value = userStore.settings.nickname
  avatar.value = userStore.settings.avatar
})

function saveLocalProfile() {
  userStore.updateSettings({
    nickname: nickname.value.trim() || 'user',
    avatar: avatar.value.trim() || '1.jpg'
  })
}

function resetLocalProfile() {
  userStore.resetSettings()
  nickname.value = userStore.settings.nickname
  avatar.value = userStore.settings.avatar
}

async function signIn() {
  await router.push({ path: '/login', query: { redirect: '/settings/account' } })
}

async function signOut() {
  await userStore.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="account-page">
    <section class="account-panel account-summary">
      <div class="account-avatar">
        <img
          v-if="avatarPreview"
          :src="avatarPreview"
          :alt="userStore.displayName"
        >
        <div v-else>
          {{ userStore.displayName.slice(0, 2) }}
        </div>
      </div>

      <div class="account-summary__copy">
        <p class="account-kicker">
          {{ sessionTitle }}
        </p>
        <h2>{{ userStore.displayName }}</h2>
        <p>{{ sessionDetail }}</p>
        <p v-if="signedInLabel" class="account-signed-in">
          Signed in {{ signedInLabel }}
        </p>
      </div>

      <div class="account-summary__actions">
        <Button
          v-if="userStore.authEnabled && userStore.isAuthenticated"
          variant="secondary"
          icon="i-solar:logout-3-bold-duotone"
          label="Sign out"
          :loading="userStore.auth.loading"
          @click="signOut"
        />
        <Button
          v-else-if="userStore.authEnabled"
          icon="i-solar:login-3-bold-duotone"
          label="Sign in"
          :loading="userStore.auth.loading"
          @click="signIn"
        />
      </div>
    </section>

    <section class="account-panel">
      <div class="section-heading">
        <div i-solar:user-id-bold-duotone />
        <div>
          <h2>Local profile</h2>
          <p>Used for local mode and chat display.</p>
        </div>
      </div>

      <div class="profile-grid">
        <label>
          <span>Display name</span>
          <input v-model="nickname" type="text" autocomplete="nickname">
        </label>

        <label>
          <span>Avatar file</span>
          <input v-model="avatar" type="text" autocomplete="off">
        </label>
      </div>

      <div class="profile-actions">
        <Button
          variant="secondary"
          icon="i-solar:restart-bold-duotone"
          label="Reset"
          @click="resetLocalProfile"
        />
        <Button
          icon="i-solar:diskette-bold-duotone"
          label="Save"
          :disabled="!dirty"
          @click="saveLocalProfile"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.account-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 3rem;
}

.account-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1px solid rgb(0 129 179 / 0.12);
  border-radius: 0.5rem;
  padding: 1rem;
  background: rgb(255 255 255 / 0.66);
  backdrop-filter: blur(16px);
}

.account-summary {
  flex-direction: row;
  align-items: center;
}

.account-avatar {
  width: 4rem;
  height: 4rem;
  flex: 0 0 auto;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: white;
  background: linear-gradient(135deg, #0081b3, #63d9dc);
  font-weight: 600;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-summary__copy {
  min-width: 0;
  flex: 1;
}

.account-kicker {
  margin: 0 0 0.25rem;
  color: rgb(0 129 179 / 0.78);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: uppercase;
}

.account-summary__copy h2,
.section-heading h2 {
  margin: 0;
  color: rgb(23 23 23);
  font-size: 1.2rem;
  font-weight: 500;
  letter-spacing: 0;
}

.account-summary__copy p,
.section-heading p {
  margin: 0;
  color: rgb(82 82 82);
  line-height: 1.5;
}

.account-summary__copy .account-signed-in {
  margin-top: 0.25rem;
  color: rgb(115 115 115);
  font-size: 0.875rem;
}

.account-summary__actions,
.profile-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-heading > div:first-child {
  flex: 0 0 auto;
  color: #0071a0;
  font-size: 1.6rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.profile-grid label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.4rem;
  color: rgb(82 82 82);
  font-size: 0.875rem;
}

.profile-grid input {
  width: 100%;
  border: 1px solid rgb(0 129 179 / 0.14);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: rgb(23 23 23);
  background: rgb(255 255 255 / 0.76);
  outline: none;
}

.profile-grid input:focus {
  border-color: rgb(0 129 179 / 0.42);
  box-shadow: 0 0 0 3px rgb(152 236 255 / 0.28);
}

.dark .account-panel {
  border-color: rgb(152 236 255 / 0.14);
  background: rgb(0 0 0 / 0.3);
}

.dark .account-summary__copy h2,
.dark .section-heading h2 {
  color: rgb(245 245 245);
}

.dark .account-summary__copy p,
.dark .section-heading p,
.dark .profile-grid label {
  color: rgb(212 212 212);
}

.dark .account-summary__copy .account-signed-in {
  color: rgb(163 163 163);
}

.dark .profile-grid input {
  border-color: rgb(152 236 255 / 0.16);
  color: rgb(245 245 245);
  background: rgb(38 38 38 / 0.74);
}

@media (max-width: 640px) {
  .account-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .account-summary__actions,
  .profile-actions {
    width: 100%;
    justify-content: stretch;
  }

  .account-summary__actions :deep(button),
  .profile-actions :deep(button) {
    flex: 1;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
