<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import AirportMultiSelect, { type AirportSelection } from '@/components/AirportMultiSelect.vue';
import BlindBoxPanel from '@/components/BlindBoxPanel.vue';
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
  selectedApiProvider,
  airlineOptions,
  isLoading,
  dataSourceLabel,
  lastError,
  hasSearchedRealFlights,
  searchDraft,
} = storeToRefs(flightsStore);

const isFilterCollapsed = ref(false);

const addOrigin = (value: AirportSelection) => {
  flightsStore.updateSearchDraft({
    ...searchDraft.value,
    origins: [...searchDraft.value.origins, value],
  });
};

const removeOrigin = (id: string) => {
  flightsStore.updateSearchDraft({
    ...searchDraft.value,
    origins: searchDraft.value.origins.filter((item) => item.id !== id),
  });
};

const addDestination = (value: AirportSelection) => {
  flightsStore.updateSearchDraft({
    ...searchDraft.value,
    destinations: [...searchDraft.value.destinations, value],
  });
};

const removeDestination = (id: string) => {
  flightsStore.updateSearchDraft({
    ...searchDraft.value,
    destinations: searchDraft.value.destinations.filter((item) => item.id !== id),
  });
};

const primaryRouteLabel = computed(() => {
  const fromLabel = searchDraft.value.origins[0]?.label ?? '未选择';
  const toLabel = searchDraft.value.destinations[0]?.label ?? '未选择';
  return `${fromLabel} → ${toLabel}`;
});

const selectedAirportsSummary = computed(() => ({
  origins: searchDraft.value.origins.length,
  destinations: searchDraft.value.destinations.length,
}));

const submitSearch = async () => {
  const fromId = searchDraft.value.origins[0]?.id;
  const toId = searchDraft.value.destinations[0]?.id;

  if (!fromId || !toId) {
    return;
  }

  await flightsStore.searchRealFlights({
    fromId,
    toId,
    adults: Number(searchDraft.value.adults),
    children: Number(searchDraft.value.children),
    cabinClass: searchDraft.value.cabinClass,
    departDate: searchDraft.value.departDate,
    returnDate: searchDraft.value.returnDate,
    currency_code: searchDraft.value.currency_code,
    provider: selectedApiProvider.value,
  });
};

onMounted(async () => {
  flightsStore.startSimulation();

  if (!hasSearchedRealFlights.value) {
    await submitSearch();
  }
});

onBeforeUnmount(() => {
  flightsStore.stopSimulation();
});
</script>

<template>
  <section class="space-y-8">
    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.72fr)_minmax(21rem,0.88fr)]">
      <div class="space-y-6">
        <div class="rounded-[32px] border border-white/10 bg-white/5 p-5 sm:p-6">
          <p class="text-sm uppercase tracking-[0.3em] text-skyline/80">AirFare Radar</p>
          <h2 class="mt-3 text-3xl font-semibold text-white sm:text-4xl">中文地名搜索、可折叠筛选、票据地图联动。</h2>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            首页现在默认使用学习数据源。筛选器不用时可以收起成一条摘要带，地图页会直接同步当前票池中的全部路线。
          </p>
        </div>

        <div class="overflow-hidden rounded-[32px] border border-white/10 bg-white/5">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              <p class="text-sm uppercase tracking-[0.28em] text-skyline/80">筛选模块</p>
              <h3 class="mt-2 text-2xl font-semibold text-white">
                {{ isFilterCollapsed ? '已缩成一条摘要带' : '展开筛选与搜索条件' }}
              </h3>
              <p class="mt-2 text-sm text-slate-300">
                {{ primaryRouteLabel }} · 出发 {{ selectedAirportsSummary.origins }} 个 · 目的地 {{ selectedAirportsSummary.destinations }} 个
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                @click="isFilterCollapsed = !isFilterCollapsed"
              >
                {{ isFilterCollapsed ? '展开筛选器' : '收起为一条' }}
              </button>
              <button
                type="button"
                class="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isLoading || !searchDraft.origins.length || !searchDraft.destinations.length"
                @click="submitSearch"
              >
                {{ isLoading ? '搜索中...' : '搜索真实机票' }}
              </button>
            </div>
          </div>

          <div
            v-if="isFilterCollapsed"
            class="grid gap-4 px-5 py-4 sm:grid-cols-4 sm:px-6"
          >
            <div class="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
              <p class="text-xs text-slate-400">查询路线</p>
              <p class="mt-2 text-sm font-semibold text-white">{{ primaryRouteLabel }}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
              <p class="text-xs text-slate-400">出发日期</p>
              <p class="mt-2 text-sm font-semibold text-white">{{ searchDraft.departDate || '未设置' }}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
              <p class="text-xs text-slate-400">数据源</p>
              <p class="mt-2 text-sm font-semibold text-white">{{ dataSourceLabel }}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
              <p class="text-xs text-slate-400">票据数量</p>
              <p class="mt-2 text-sm font-semibold text-white">{{ filteredFlights.length }} 条</p>
            </div>
          </div>

          <div
            v-else
            class="space-y-5 px-5 py-5 sm:px-6"
          >
            <div class="grid gap-4 lg:grid-cols-2">
              <AirportMultiSelect
                :selected-items="searchDraft.origins"
                label="出发地"
                placeholder="输入上海、上海浦东、北京等地名"
                @add="addOrigin"
                @remove="removeOrigin"
              />
              <AirportMultiSelect
                :selected-items="searchDraft.destinations"
                label="目的地"
                placeholder="输入北京、东京、曼谷等地名"
                @add="addDestination"
                @remove="removeDestination"
              />
            </div>

            <div class="grid gap-4 lg:grid-cols-4">
              <label class="block">
                <span class="mb-2 block text-sm text-slate-300">出发日期</span>
                <input
                  v-model="searchDraft.departDate"
                  type="date"
                  class="w-full rounded-2xl border-white/10 bg-slate-950/60 px-4 py-3 text-white focus:border-skyline focus:ring-skyline"
                />
              </label>

              <label class="block">
                <span class="mb-2 block text-sm text-slate-300">返回日期</span>
                <input
                  v-model="searchDraft.returnDate"
                  type="date"
                  class="w-full rounded-2xl border-white/10 bg-slate-950/60 px-4 py-3 text-white focus:border-skyline focus:ring-skyline"
                />
              </label>

              <label class="block">
                <span class="mb-2 block text-sm text-slate-300">舱位</span>
                <select
                  v-model="searchDraft.cabinClass"
                  class="w-full rounded-2xl border-white/10 bg-slate-950/60 px-4 py-3 text-white focus:border-skyline focus:ring-skyline"
                >
                  <option value="ECONOMY">经济舱</option>
                  <option value="PREMIUM_ECONOMY">高端经济舱</option>
                  <option value="BUSINESS">商务舱</option>
                  <option value="FIRST">头等舱</option>
                </select>
              </label>

              <div class="grid grid-cols-2 gap-3">
                <label class="block">
                  <span class="mb-2 block text-sm text-slate-300">成人</span>
                  <input
                    v-model.number="searchDraft.adults"
                    type="number"
                    min="1"
                    max="9"
                    class="w-full rounded-2xl border-white/10 bg-slate-950/60 px-4 py-3 text-white focus:border-skyline focus:ring-skyline"
                  />
                </label>
                <label class="block">
                  <span class="mb-2 block text-sm text-slate-300">儿童</span>
                  <input
                    v-model.number="searchDraft.children"
                    type="number"
                    min="0"
                    max="9"
                    class="w-full rounded-2xl border-white/10 bg-slate-950/60 px-4 py-3 text-white focus:border-skyline focus:ring-skyline"
                  />
                </label>
              </div>
            </div>

            <div class="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
              <p class="text-sm text-slate-300">当前实际查询组合</p>
              <p class="mt-2 text-lg font-semibold text-white">{{ primaryRouteLabel }}</p>
              <p class="mt-1 text-xs text-slate-400">真实 API 请求默认使用每侧第一个选中的机场，其他选中机场保留在筛选池中方便切换。</p>
            </div>
          </div>
        </div>

        <div
          v-if="lastError"
          class="rounded-[24px] border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-50"
        >
          {{ lastError }}
        </div>

        <div class="grid gap-4 rounded-[32px] border border-white/10 bg-white/5 p-5 lg:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr] lg:items-end">
          <label class="block">
            <span class="mb-2 block text-sm text-slate-300">模糊搜索城市或目的地</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="例如：东京、北京、上海"
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
          <p class="text-lg text-white">当前条件下没有匹配结果</p>
          <p class="mt-2 text-sm text-slate-400">可以尝试更换城市、机场组合、日期或放宽筛选条件。</p>
        </div>

        <div v-else class="grid gap-5">
          <FlightCard
            v-for="flight in filteredFlights"
            :key="flight.id"
            :flight="flight"
          />
        </div>
      </div>

      <aside class="space-y-4">
        <BlindBoxPanel compact />

        <div class="rounded-[32px] border border-white/10 bg-white/5 p-5">
          <p class="text-sm uppercase tracking-[0.3em] text-skyline/80">数据源选择</p>
          <h3 class="mt-3 text-2xl font-semibold text-white">默认已切到学习数据</h3>
          <p class="mt-3 text-sm leading-6 text-slate-300">
            右侧可以随时切换到 AeroDataBox、Booking.com 或示例数据。学习采集器默认读取本地样例，更适合当前的产品演示。
          </p>

          <div class="mt-5 grid gap-3">
            <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <input
                v-model="selectedApiProvider"
                type="radio"
                value="learning"
                class="mt-1 border-white/20 bg-slate-900 text-sky-400 focus:ring-skyline"
              />
              <div>
                <p class="text-sm font-semibold text-white">学习采集器</p>
                <p class="mt-1 text-xs leading-5 text-slate-400">默认选项，读取本地样例或你自建的学习接口。</p>
              </div>
            </label>

            <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <input
                v-model="selectedApiProvider"
                type="radio"
                value="aerodatabox"
                class="mt-1 border-white/20 bg-slate-900 text-sky-400 focus:ring-skyline"
              />
              <div>
                <p class="text-sm font-semibold text-white">AeroDataBox API</p>
                <p class="mt-1 text-xs leading-5 text-slate-400">真实航班时刻与动态，票价为参考估算。</p>
              </div>
            </label>

            <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <input
                v-model="selectedApiProvider"
                type="radio"
                value="booking"
                class="mt-1 border-white/20 bg-slate-900 text-sky-400 focus:ring-skyline"
              />
              <div>
                <p class="text-sm font-semibold text-white">Booking.com API</p>
                <p class="mt-1 text-xs leading-5 text-slate-400">真实 OTA 票价搜索，适合对比价格参考。</p>
              </div>
            </label>

            <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <input
                v-model="selectedApiProvider"
                type="radio"
                value="mock"
                class="mt-1 border-white/20 bg-slate-900 text-sky-400 focus:ring-skyline"
              />
              <div>
                <p class="text-sm font-semibold text-white">示例数据</p>
                <p class="mt-1 text-xs leading-5 text-slate-400">用于兜底演示，不消耗接口额度。</p>
              </div>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-[24px] border border-white/10 bg-slate-900/80 p-4">
            <p class="text-xs text-slate-400">当前数据源</p>
            <p class="mt-2 text-lg font-semibold text-white">{{ dataSourceLabel }}</p>
          </div>
          <div class="rounded-[24px] border border-white/10 bg-slate-900/80 p-4">
            <p class="text-xs text-slate-400">接口状态</p>
            <p class="mt-2 text-lg font-semibold text-white">{{ isLoading ? '搜索中' : '待命' }}</p>
          </div>
          <div class="rounded-[24px] border border-white/10 bg-slate-900/80 p-4">
            <p class="text-xs text-slate-400">当前票源</p>
            <p class="mt-2 text-3xl font-semibold text-white">{{ flights.length }}</p>
          </div>
          <div class="rounded-[24px] border border-rose-400/30 bg-rose-500/10 p-4">
            <p class="text-xs text-rose-100">2 折以下</p>
            <p class="mt-2 text-3xl font-semibold text-white">{{ superDeals.length }}</p>
          </div>
          <div class="rounded-[24px] border border-sky-400/30 bg-sky-500/10 p-4">
            <p class="text-xs text-sky-100">平均折扣</p>
            <p class="mt-2 text-3xl font-semibold text-white">{{ (averageDiscount * 10).toFixed(1) }}折</p>
          </div>
          <div class="rounded-[24px] border border-amber-400/30 bg-amber-500/10 p-4">
            <p class="text-xs text-amber-100">提醒订阅</p>
            <p class="mt-2 text-3xl font-semibold text-white">{{ subscriptions.length }}</p>
          </div>
        </div>

        <div
          v-if="cheapestFlight"
          class="rounded-[28px] border border-accent/30 bg-gradient-to-br from-accent/15 via-orange-500/8 to-transparent p-5"
        >
          <p class="text-sm uppercase tracking-[0.28em] text-orange-200">当前最低价</p>
          <h3 class="mt-3 text-xl font-semibold text-white">
            {{ cheapestFlight.departure.city }} → {{ cheapestFlight.destination.city }}
          </h3>
          <p class="mt-2 text-sm text-slate-200">
            {{ cheapestFlight.airline }} · {{ cheapestFlight.flightNumber }}
          </p>
          <p class="mt-1 text-xs text-slate-400">更新于 {{ cheapestFlight.lastUpdated }}</p>
          <p class="mt-4 text-4xl font-bold text-white">¥{{ cheapestFlight.price }}</p>
        </div>
      </aside>
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
