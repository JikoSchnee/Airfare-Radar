<script setup lang="ts">
import { computed, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useFlightsStore } from '@/stores/flights';

const route = useRoute();
const flightsStore = useFlightsStore();

const navItems = [
  { label: '看板', to: '/dashboard', name: 'dashboard' },
  { label: '地图', to: '/map', name: 'map' },
  { label: '盲盒', to: '/blindbox', name: 'blindbox' },
];

const activeName = computed(() => route.name?.toString() ?? 'dashboard');

watch(
  activeName,
  (value) => {
    flightsStore.setActiveRoute(value);
  },
  { immediate: true },
);
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
    <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
      <div class="min-w-0">
        <p class="text-xs uppercase tracking-[0.35em] text-skyline/80">AirFare Radar</p>
        <h1 class="truncate text-lg font-semibold text-white sm:text-xl">
          特价机票发现台
        </h1>
      </div>

      <nav class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          :class="{
            'bg-white text-slate-950 shadow-lg shadow-skyline/10': activeName === item.name,
          }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
