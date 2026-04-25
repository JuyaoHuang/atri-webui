<template>
  <div class="airi-test-dummy-marker inline-block size-6">
    <div class="marker" />
  </div>
</template>

<style scoped>
.airi-test-dummy-marker {
  position: relative;
  filter: drop-shadow(0 4px 12px rgb(185 185 185 / 0.2));
}

.airi-test-dummy-marker .marker {
  position: absolute;
  inset: 0;
  background: conic-gradient(#ffeb3b 0deg 90deg, #000 90deg 180deg, #ffeb3b 180deg 270deg, #000 270deg 360deg);
  border-radius: 50%;
  animation: airi-test-dummy-spin 9s linear infinite;
}

.dark .airi-test-dummy-marker {
  filter: drop-shadow(0 4px 12px rgb(0 0 0 / 0.2));
}

@keyframes airi-test-dummy-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
