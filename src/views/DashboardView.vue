<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import FlightCard from '@/components/FlightCard.vue';
import ToastNotice from '@/components/ToastNotice.vue';
import { useFlightsStore } from '@/stores/flights';

const flightsStore = useFlightsStore();
const {
  flights,
  superDeals,
  cheapestFlight,
  averageDiscount,
  filteredFlights,
  subscriptions,
  notifications,
  searchQuery,
  maxPrice,
  directOnly,
  selectedAirline,
  airlineOptions,
} = storeToRefs(flightsStore);

onMounted(() => {
  flightsStore.startSimulation();
});

onBeforeUnmount(() => {
  flightsStore.stopSimulation();
});
</script>

<template>
  <section class="space-y-8">
    <div class="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <div class="rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8">
        <p class="text-sm uppercase tracking-[0.3em] text-skyline/80">实时低价榜</p>
        <h2 class="mt-3 max-w-2xl text-3xl font-semibold text-white sm:text-5xl">
          在别人发现之前，先看到最狠的特价机票。
        </h2>
        <p class="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          AirFare Radar 把分散在各处的闪促票价聚合成一个一眼可读的看板，专注于更大降幅、
          更快比较和更值得出手的路线。
        </p>
      </div>

      <div class="grid gap-4">
        <div class="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
          <p class="text-sm text-slate-400">收录票源</p>
          <p class="mt-2 text-4xl font-semibold text-white">{{ flights.length }}</p>
        </div>
        <div class="rounded-[28px] border border-rose-400/30 bg-rose-500/10 p-5">
          <p class="text-sm text-rose-100">2 折以下</p>
          <p class="mt-2 text-4xl font-semibold text-white">{{ superDeals.length }}</p>
        </div>
        <div class="rounded-[28px] border border-sky-400/30 bg-sky-500/10 p-5">
          <p class="text-sm text-sky-100">平均折扣</p>
          <p class="mt-2 text-4xl font-semibold text-white">
            {{ (averageDiscount * 10).toFixed(1) }}折
          </p>
        </div>
        <div class="rounded-[28px] border border-amber-400/30 bg-amber-500/10 p-5">
          <p class="text-sm text-amber-100">提醒订阅</p>
          <p class="mt-2 text-4xl font-semibold text-white">{{ subscriptions.length }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="cheapestFlight"
      class="flex flex-col gap-4 rounded-[32px] border border-accent/30 bg-gradient-to-r from-accent/15 via-orange-500/8 to-transparent p-6 lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <p class="text-sm uppercase tracking-[0.28em] text-orange-200">当前最低价</p>
        <h3 class="mt-3 text-2xl font-semibold text-white">
          {{ cheapestFlight.departure.city }} → {{ cheapestFlight.destination.city }}
        </h3>
        <p class="mt-2 text-slate-200">
          {{ cheapestFlight.airline }} · {{ cheapestFlight.flightNumber }} · 更新于
          {{ cheapestFlight.lastUpdated }}
        </p>
      </div>
      <div class="text-left lg:text-right">
        <p class="text-sm text-orange-100">实时价格</p>
        <p class="mt-2 text-5xl font-bold text-white">¥{{ cheapestFlight.price }}</p>
      </div>
    </div>

    <div class="grid gap-4 rounded-[32px] border border-white/10 bg-white/5 p-5 lg:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr] lg:items-end">
      <label class="block">
        <span class="mb-2 block text-sm text-slate-300">搜索城市或目的地</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="例如：东京、曼谷、上海"
          class="w-full rounded-2xl border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-skyline focus:ring-skyline"
        />
      </label>

      <label class="block">
        <span class="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>价格上限</span>
          <span class="text-sky-300">¥{{ maxPrice }}</span>
        </span>
        <input
          v-model.number="maxPrice"
          type="range"
          min="200"
          max="2500"
          step="50"
          class="w-full accent-sky-400"
        />
      </label>

      <label class="block">
        <span class="mb-2 block text-sm text-slate-300">航司筛选</span>
        <select
          v-model="selectedAirline"
          class="w-full rounded-2xl border-white/10 bg-slate-950/60 px-4 py-3 text-white focus:border-skyline focus:ring-skyline"
        >
          <option
            v-for="airline in airlineOptions"
            :key="airline"
            :value="airline"
          >
            {{ airline }}
          </option>
        </select>
      </label>

      <label class="flex h-[54px] items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4">
        <input
          v-model="directOnly"
          type="checkbox"
          class="rounded border-white/20 bg-slate-900 text-sky-400 focus:ring-skyline"
        />
        <span class="text-sm text-slate-200">只看直飞</span>
      </label>
    </div>

    <div class="flex items-center justify-between gap-4">
      <p class="text-sm text-slate-400">
        共找到 <span class="font-semibold text-white">{{ filteredFlights.length }}</span> 条符合条件的机票
      </p>
      <p class="text-sm text-slate-400">点击卡片右上角铃铛即可订阅降价提醒</p>
    </div>

    <div
      v-if="!filteredFlights.length"
      class="rounded-[32px] border border-dashed border-white/15 bg-slate-900/50 p-10 text-center"
    >
      <p class="text-lg text-white">当前筛选条件下没有匹配结果</p>
      <p class="mt-2 text-sm text-slate-400">可以尝试放宽价格上限、取消直飞限制，或更换搜索关键词。</p>
    </div>

    <div v-else class="grid gap-5 xl:grid-cols-2">
      <FlightCard
        v-for="flight in filteredFlights"
        :key="flight.id"
        :flight="flight"
      />
    </div>

    <div class="fixed bottom-5 right-5 z-40 flex w-[min(92vw,24rem)] flex-col gap-3">
      <ToastNotice
        v-for="notice in notifications"
        :key="notice.id"
        :message="notice.message"
      />
    </div>
  </section>
</template>
