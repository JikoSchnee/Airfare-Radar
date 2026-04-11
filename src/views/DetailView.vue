<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useFlightsStore } from '@/stores/flights';
import PriceTrendChart from '@/components/PriceTrendChart.vue';

const route = useRoute();
const flightsStore = useFlightsStore();

const flight = computed(() =>
  flightsStore.flights.find((item) => item.id === route.params.id),
);

const discountText = computed(() =>
  flight.value ? `${(flight.value.discountRate * 10).toFixed(1)}折` : '',
);

const otaLink = computed(() => {
  if (!flight.value) {
    return '#';
  }

  const params = new URLSearchParams({
    from: flight.value.departure.code,
    to: flight.value.destination.code,
    flight: flight.value.flightNumber,
    fare: String(flight.value.price),
  });

  return `https://example.com/ota/book?${params.toString()}`;
});
</script>

<template>
  <section v-if="flight" class="space-y-6">
    <RouterLink
      to="/dashboard"
      class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
    >
      ← 返回看板
    </RouterLink>

    <div class="rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8">
      <p class="text-sm uppercase tracking-[0.3em] text-skyline/80">机票详情</p>
      <h2 class="mt-3 text-3xl font-semibold text-white sm:text-4xl">
        {{ flight.departure.city }} → {{ flight.destination.city }}
      </h2>
      <p class="mt-3 text-slate-300">
        {{ flight.airline }} · {{ flight.flightNumber }} · {{ discountText }} · 更新于
        {{ flight.lastUpdated }}
      </p>

      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <div class="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
          <p class="text-sm text-slate-400">出发地</p>
          <p class="mt-2 text-2xl font-semibold text-white">{{ flight.departure.city }}</p>
          <p class="mt-1 text-slate-300">{{ flight.departure.code }} · {{ flight.departure.time }}</p>
        </div>
        <div class="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
          <p class="text-sm text-slate-400">目的地</p>
          <p class="mt-2 text-2xl font-semibold text-white">{{ flight.destination.city }}</p>
          <p class="mt-1 text-slate-300">{{ flight.destination.code }} · {{ flight.destination.time }}</p>
        </div>
        <div class="rounded-3xl border border-accent/30 bg-accent/10 p-5">
          <p class="text-sm text-orange-100">实时价格</p>
          <p class="mt-2 text-4xl font-bold text-white">¥{{ flight.price }}</p>
          <p class="mt-1 text-slate-300 line-through">¥{{ flight.originalPrice }}</p>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap gap-3">
        <a
          :href="otaLink"
          target="_blank"
          rel="noreferrer noopener"
          class="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          去 OTA 平台抢票
        </a>
        <span class="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          模拟跳转链接，仅用于演示抢票流程
        </span>
      </div>
    </div>

    <PriceTrendChart :flight="flight" />
  </section>

  <section v-else class="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center">
    <p class="text-sm uppercase tracking-[0.3em] text-slate-400">机票详情</p>
    <h2 class="mt-3 text-3xl font-semibold text-white">未找到对应机票</h2>
    <RouterLink
      to="/dashboard"
      class="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
    >
      返回看板
    </RouterLink>
  </section>
</template>
