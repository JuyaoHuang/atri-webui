<script setup lang="ts">
import AiriAlert from './AiriAlert.vue'

defineProps<{
  title?: string
  error?: unknown
}>()
</script>

<template>
  <AiriAlert type="error">
    <template #title>
      {{ title || 'Error occurred' }}
    </template>
    <template v-if="error" #content>
      <pre class="whitespace-pre-wrap break-all">{{ String(error) }}</pre>
    </template>
  </AiriAlert>
</template>
