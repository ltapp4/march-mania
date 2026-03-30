<template>
  <v-app>
    <v-app-bar class="app-bar" elevation="0">
      <template #prepend>
        <v-icon color="#ffb74d">mdi-basketball</v-icon>
      </template>

      <v-app-bar-title class="app-bar__title">March Mania</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <BracketPage />
    </v-main>
  </v-app>
</template>

<script setup>
import BracketPage from '@/components/bracket/BracketPage.vue'
</script>

<style scoped>
.app-bar {
  background: rgba(6, 12, 25, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.app-bar__title {
  color: #ffcc86;
  font-weight: 900;
  letter-spacing: 0.04em;
}
</style>
