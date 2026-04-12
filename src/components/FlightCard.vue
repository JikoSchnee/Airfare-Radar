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
    class="group relative cursor-pointer overflow-hidden rounded-[28px] border-2 bg-[#f6ecd7] text-slate-900 shadow-ticket transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_30px_80px_rgba(8,17,31,0.35)] lg:grid lg:min-h-[16rem] lg:grid-cols-[minmax(0,1.45fr)_minmax(11.5rem,0.85fr)] lg:rounded-[30px]"
    :class="ticketTone.border"
    @click="openDetail"
  >
    <div class="pointer-events-none absolute inset-x-8 top-[62%] border-t-2 border-dashed lg:inset-y-0 lg:left-[68%] lg:right-auto lg:top-0 lg:w-0 lg:border-l-2 lg:border-t-0" :class="ticketTone.line" />

    <div class="relative p-4 sm:p-5 lg:p-[clamp(1rem,2vw,1.75rem)]">
      <div class="absolute left-10 top-0 h-4 w-8 -translate-y-1/2 rounded-b-full bg-slate-950/90 lg:left-0 lg:top-10 lg:h-8 lg:w-4 lg:-translate-x-1/2 lg:translate-y-0 lg:rounded-b-none lg:rounded-r-full" />
      <div class="absolute right-10 top-0 h-4 w-8 -translate-y-1/2 rounded-b-full bg-slate-950/90 lg:left-0 lg:right-auto lg:bottom-10 lg:top-auto lg:h-8 lg:w-4 lg:-translate-x-1/2 lg:translate-y-0 lg:rounded-b-none lg:rounded-r-full" />

      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-[11px] uppercase tracking-[0.38em] text-slate-500">特价登机联</p>
          <h3 class="mt-2 text-base font-semibold tracking-[0.08em] text-slate-900 sm:text-lg lg:mt-3 lg:text-[clamp(1rem,1.6vw,1.25rem)]">
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

      <div class="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 lg:mt-6 lg:items-end lg:gap-[clamp(0.5rem,1.5vw,1rem)]">
        <div>
          <p class="font-serif text-[clamp(1.35rem,7vw,2rem)] font-bold leading-none text-slate-900 lg:text-[clamp(1.4rem,3vw,2.25rem)]">
            {{ flight.departure.city }}
          </p>
          <p class="mt-1.5 text-xs uppercase tracking-[0.28em] sm:text-sm sm:tracking-[0.32em]" :class="ticketTone.accent">
            {{ flight.departure.code }}
          </p>
          <p class="mt-3 text-xs text-slate-600 sm:text-sm">起飞时间</p>
          <p class="text-sm font-semibold text-slate-800 sm:text-base lg:text-[clamp(0.9rem,1.6vw,1.125rem)]">{{ flight.departure.time }}</p>
        </div>

        <div class="flex flex-col items-center justify-center text-center">
          <p class="text-[10px] uppercase tracking-[0.28em] text-slate-500 sm:text-xs sm:tracking-[0.36em]">{{ routeModeText }}</p>
          <p class="mt-2 text-xl sm:text-2xl" :class="ticketTone.accent">✈</p>
          <p class="mt-2 rounded-full border border-slate-300 px-2.5 py-1 text-[10px] tracking-[0.22em] text-slate-600 sm:mt-3 sm:px-3 sm:text-xs sm:tracking-[0.26em]">
            {{ flight.flightNumber }}
          </p>
        </div>

        <div class="text-right">
          <p class="font-serif text-[clamp(1.35rem,7vw,2rem)] font-bold leading-none text-slate-900 lg:text-[clamp(1.4rem,3vw,2.25rem)]">
            {{ flight.destination.city }}
          </p>
          <p class="mt-1.5 text-xs uppercase tracking-[0.28em] sm:text-sm sm:tracking-[0.32em]" :class="ticketTone.accent">
            {{ flight.destination.code }}
          </p>
          <p class="mt-3 text-xs text-slate-600 sm:text-sm">到达时间</p>
          <p class="text-sm font-semibold text-slate-800 sm:text-base lg:text-[clamp(0.9rem,1.6vw,1.125rem)]">{{ flight.destination.time }}</p>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2 lg:mt-6">
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

    <div class="relative flex flex-col justify-between border-t-2 p-4 sm:p-5 lg:border-l-2 lg:border-t-0 lg:p-[clamp(1rem,2vw,1.75rem)]" :class="ticketTone.line">
      <div class="absolute left-10 top-0 h-4 w-8 -translate-y-1/2 rounded-b-full bg-slate-950/90 lg:left-auto lg:right-0 lg:top-10 lg:h-8 lg:w-4 lg:translate-x-1/2 lg:translate-y-0 lg:rounded-b-none lg:rounded-l-full" />
      <div class="absolute right-10 top-0 h-4 w-8 -translate-y-1/2 rounded-b-full bg-slate-950/90 lg:bottom-10 lg:right-0 lg:top-auto lg:h-8 lg:w-4 lg:translate-x-1/2 lg:translate-y-0 lg:rounded-b-none lg:rounded-l-full" />

      <div>
        <p class="text-[11px] uppercase tracking-[0.38em] text-slate-500">票价</p>
        <div class="mt-3 flex items-end gap-3 lg:mt-4">
          <span class="text-[clamp(1.8rem,9vw,2.4rem)] font-bold leading-none text-slate-900 lg:text-[clamp(1.7rem,3.2vw,2.25rem)]">¥{{ flight.price }}</span>
          <span class="pb-1 text-sm text-slate-500 line-through">¥{{ flight.originalPrice }}</span>
        </div>
        <p class="mt-3 text-sm text-slate-600">立省 ¥{{ savings }}</p>
      </div>

      <div class="mt-5 space-y-4 lg:mt-8">
        <div class="rounded-2xl border border-black/10 bg-black/5 p-4">
          <p class="text-[11px] uppercase tracking-[0.28em] text-slate-500">最近更新</p>
          <p class="mt-2 text-sm font-medium text-slate-800 sm:text-base">{{ flight.lastUpdated }}</p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
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
