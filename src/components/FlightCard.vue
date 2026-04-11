<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFlightsStore } from '@/stores/flights';
import type { FlightTicket } from '@/types/flight';

const props = defineProps<{
  flight: FlightTicket;
}>();

const router = useRouter();
const flightsStore = useFlightsStore();

const ticketTone = computed(() => {
  if (props.flight.discountRate < 0.2) {
    return {
      border: 'border-rose-400/80',
      accent: 'text-rose-700',
      chip: 'bg-rose-100 text-rose-700 border-rose-300',
      punch: 'bg-rose-300/70',
      line: 'border-rose-300/70',
    };
  }

  if (props.flight.discountRate < 0.5) {
    return {
      border: 'border-sky-500/75',
      accent: 'text-sky-700',
      chip: 'bg-sky-100 text-sky-700 border-sky-300',
      punch: 'bg-sky-300/70',
      line: 'border-sky-300/70',
    };
  }

  return {
    border: 'border-stone-400/80',
    accent: 'text-stone-700',
    chip: 'bg-stone-200 text-stone-700 border-stone-300',
    punch: 'bg-stone-300/70',
    line: 'border-stone-300/80',
  };
});

const discountText = computed(() => `${(props.flight.discountRate * 10).toFixed(1)}折`);
const savings = computed(() => props.flight.originalPrice - props.flight.price);
const isSubscribed = computed(() => flightsStore.subscriptions.includes(props.flight.id));
const routeModeText = computed(() => (props.flight.isDirect ? '直飞航线' : '经停航线'));

const openDetail = () => {
  router.push(`/detail/${props.flight.id}`);
};

const toggleReminder = async (event: MouseEvent) => {
  event.stopPropagation();
  await flightsStore.toggleSubscription(props.flight.id);
};
</script>

<template>
  <article
    class="group relative grid cursor-pointer overflow-hidden rounded-[30px] border-2 bg-[#f6ecd7] text-slate-900 shadow-ticket transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_30px_80px_rgba(8,17,31,0.35)] lg:grid-cols-[1.45fr_0.85fr]"
    :class="ticketTone.border"
    @click="openDetail"
  >
    <div class="pointer-events-none absolute inset-y-0 left-[68%] hidden border-l-2 border-dashed lg:block" :class="ticketTone.line" />

    <div class="relative p-6 sm:p-7">
      <div class="absolute left-0 top-10 h-8 w-4 -translate-x-1/2 rounded-r-full bg-slate-950/90" />
      <div class="absolute bottom-10 left-0 h-8 w-4 -translate-x-1/2 rounded-r-full bg-slate-950/90" />

      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-[11px] uppercase tracking-[0.38em] text-slate-500">特价登机联</p>
          <h3 class="mt-3 text-xl font-semibold tracking-[0.08em] text-slate-900">
            {{ flight.airline }}
          </h3>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white/75 text-lg text-stone-600 transition hover:scale-105 hover:bg-white"
            :class="isSubscribed ? 'border-amber-400 bg-amber-100 text-amber-600' : ''"
            :aria-pressed="isSubscribed"
            :title="isSubscribed ? '已开启降价提醒' : '开启降价提醒'"
            @click="toggleReminder"
          >
            {{ isSubscribed ? '🔔' : '🔕' }}
          </button>
          <span
            class="rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em]"
            :class="ticketTone.chip"
          >
            {{ discountText }}
          </span>
        </div>
      </div>

      <div class="mt-6 grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <p class="font-serif text-3xl font-bold leading-none text-slate-900 sm:text-4xl">
            {{ flight.departure.city }}
          </p>
          <p class="mt-2 text-sm uppercase tracking-[0.32em]" :class="ticketTone.accent">
            {{ flight.departure.code }}
          </p>
          <p class="mt-4 text-sm text-slate-600">起飞时间</p>
          <p class="text-lg font-semibold text-slate-800">{{ flight.departure.time }}</p>
        </div>

        <div class="flex flex-col items-center justify-center text-center">
          <p class="text-xs uppercase tracking-[0.36em] text-slate-500">{{ routeModeText }}</p>
          <p class="mt-3 text-2xl" :class="ticketTone.accent">✈</p>
          <p class="mt-3 rounded-full border border-slate-300 px-3 py-1 text-xs tracking-[0.26em] text-slate-600">
            {{ flight.flightNumber }}
          </p>
        </div>

        <div class="sm:text-right">
          <p class="font-serif text-3xl font-bold leading-none text-slate-900 sm:text-4xl">
            {{ flight.destination.city }}
          </p>
          <p class="mt-2 text-sm uppercase tracking-[0.32em]" :class="ticketTone.accent">
            {{ flight.destination.code }}
          </p>
          <p class="mt-4 text-sm text-slate-600">到达时间</p>
          <p class="text-lg font-semibold text-slate-800">{{ flight.destination.time }}</p>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        <span class="rounded-full border border-stone-300 bg-white/60 px-3 py-1 text-xs tracking-[0.14em] text-stone-700">
          {{ flight.isDirect ? '直飞' : '经停' }}
        </span>
        <span
          v-for="tag in flight.tags"
          :key="tag"
          class="rounded-full border border-stone-300 bg-white/60 px-3 py-1 text-xs tracking-[0.14em] text-stone-700"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div class="relative flex flex-col justify-between border-t-2 p-6 lg:border-l-0 lg:border-t-0 lg:p-7" :class="ticketTone.line">
      <div class="absolute right-0 top-10 h-8 w-4 translate-x-1/2 rounded-l-full bg-slate-950/90" />
      <div class="absolute bottom-10 right-0 h-8 w-4 translate-x-1/2 rounded-l-full bg-slate-950/90" />

      <div>
        <p class="text-[11px] uppercase tracking-[0.38em] text-slate-500">票价</p>
        <div class="mt-4 flex items-end gap-3">
          <span class="text-4xl font-bold leading-none text-slate-900">¥{{ flight.price }}</span>
          <span class="pb-1 text-sm text-slate-500 line-through">¥{{ flight.originalPrice }}</span>
        </div>
        <p class="mt-3 text-sm text-slate-600">立省 ¥{{ savings }}</p>
      </div>

      <div class="mt-8 space-y-4">
        <div class="rounded-2xl border border-black/10 bg-black/5 p-4">
          <p class="text-[11px] uppercase tracking-[0.28em] text-slate-500">最近更新</p>
          <p class="mt-2 text-base font-medium text-slate-800">{{ flight.lastUpdated }}</p>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :class="ticketTone.punch" />
            <span class="text-xs uppercase tracking-[0.3em] text-slate-500">点击查看详情</span>
          </div>
          <span class="text-sm font-semibold" :class="ticketTone.accent">查看票价 →</span>
        </div>
      </div>
    </div>
  </article>
</template>
