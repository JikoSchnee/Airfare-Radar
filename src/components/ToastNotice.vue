<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <div class="rounded-2xl border border-sky-300/30 bg-slate-950/90 px-4 py-3 shadow-2xl backdrop-blur">
    <p class="text-xs uppercase tracking-[0.28em] text-sky-300">降价动态</p>
    <p class="mt-2 text-sm leading-6 text-slate-100">{{ message }}</p>
  </div>
</template>
