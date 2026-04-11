<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { airportCoordinates } from '@/data/airportCoordinates';
import { useFlightsStore } from '@/stores/flights';
import type { FlightTicket } from '@/types/flight';

const flightsStore = useFlightsStore();
const { flights } = storeToRefs(flightsStore);

interface MappedFlight extends FlightTicket {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

const buildRoutePath = (flight: MappedFlight) => {
  const startX = flight.from.x;
  const startY = flight.from.y;
  const endX = flight.to.x;
  const endY = flight.to.y;
  const midX = (startX + endX) / 2;
  const distance = Math.abs(endX - startX);
  const arcLift = Math.max(5, Math.min(18, distance * 0.22));
  const controlY = Math.max(8, Math.min(startY, endY) - arcLift);

  return `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`;
};

const mappedFlights = computed<MappedFlight[]>(() =>
  flights.value
    .map((flight) => {
      const from = airportCoordinates[flight.departure.code];
      const to = airportCoordinates[flight.destination.code];

      if (!from || !to) {
        return null;
      }

      return {
        ...flight,
        from,
        to,
      };
    })
    .filter((item): item is MappedFlight => item !== null),
);

const airportStats = computed(() => {
  const map = new Map<string, { code: string; city: string; x: number; y: number; departures: number; arrivals: number }>();

  for (const flight of mappedFlights.value) {
    const fromKey = flight.departure.code;
    const toKey = flight.destination.code;

    if (!map.has(fromKey)) {
      map.set(fromKey, {
        code: fromKey,
        city: flight.departure.city,
        x: flight.from.x,
        y: flight.from.y,
        departures: 0,
        arrivals: 0,
      });
    }

    if (!map.has(toKey)) {
      map.set(toKey, {
        code: toKey,
        city: flight.destination.city,
        x: flight.to.x,
        y: flight.to.y,
        departures: 0,
        arrivals: 0,
      });
    }

    map.get(fromKey)!.departures += 1;
    map.get(toKey)!.arrivals += 1;
  }

  return [...map.values()].sort((left, right) => right.departures + right.arrivals - (left.departures + left.arrivals));
});
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(22rem,0.85fr)]">
    <div class="rounded-[34px] border border-white/10 bg-white/5 p-5 sm:p-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-skyline/80">票据地图</p>
          <h2 class="mt-3 text-3xl font-semibold text-white">当前票池已全部投放到地图上。</h2>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            每条航线都会显示为一根连接线，圆点表示机场位置。你现在看到的是当前票据数据的路线视图，不再是占位页。
          </p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
          已映射航线 <span class="font-semibold text-white">{{ mappedFlights.length }}</span> 条
        </div>
      </div>

      <div class="relative mt-6 aspect-[1.45/1] overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))]">
        <div class="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-50" />

        <div class="absolute inset-0 opacity-90">
          <div class="absolute left-[7%] top-[17%] h-[56%] w-[35%] rounded-[46%] border border-sky-100/10 bg-slate-200/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]" />
          <div class="absolute left-[34%] top-[11%] h-[66%] w-[47%] rounded-[48%] border border-sky-100/10 bg-slate-200/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]" />
          <div class="absolute left-[79%] top-[21%] h-[22%] w-[14%] rounded-[45%] border border-sky-100/10 bg-slate-200/5" />
          <div class="absolute left-[57%] top-[74%] h-[18%] w-[16%] rounded-[48%] border border-sky-100/10 bg-slate-200/5" />
        </div>

        <svg class="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="routeLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(125,211,252,0.9)" />
              <stop offset="100%" stop-color="rgba(251,191,36,0.9)" />
            </linearGradient>
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            v-for="flight in mappedFlights"
            :key="flight.id"
            :d="buildRoutePath(flight)"
            stroke="url(#routeLine)"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            opacity="0.88"
            filter="url(#routeGlow)"
          />
        </svg>

        <div
          v-for="airport in airportStats"
          :key="airport.code"
          class="absolute -translate-x-1/2 -translate-y-1/2"
          :style="{ left: `${airport.x}%`, top: `${airport.y}%` }"
        >
          <div class="relative">
            <div class="absolute inset-0 rounded-full bg-sky-300/35 blur-md" />
            <div class="relative h-3.5 w-3.5 rounded-full border border-white/80 bg-sky-200 shadow-[0_0_0_7px_rgba(56,189,248,0.14)]" />
          </div>
          <div class="mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-slate-950/88 px-2.5 py-1 text-[11px] text-slate-100 shadow-xl">
            {{ airport.city }} {{ airport.code }}
          </div>
        </div>
      </div>
    </div>

    <aside class="space-y-4">
      <div class="rounded-[32px] border border-white/10 bg-white/5 p-5">
        <p class="text-sm uppercase tracking-[0.28em] text-skyline/80">路线清单</p>
        <div class="mt-4 space-y-3">
          <div
            v-for="flight in mappedFlights"
            :key="`route-${flight.id}`"
            class="rounded-[22px] border border-white/10 bg-slate-950/65 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-white">
                  {{ flight.departure.city }} → {{ flight.destination.city }}
                </p>
                <p class="mt-1 text-xs text-slate-400">
                  {{ flight.airline }} · {{ flight.flightNumber }}
                </p>
              </div>
              <p class="text-lg font-semibold text-white">¥{{ flight.price }}</p>
            </div>
            <div class="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span class="rounded-full border border-white/10 px-2 py-1">{{ flight.departure.code }}</span>
              <span class="rounded-full border border-white/10 px-2 py-1">{{ flight.destination.code }}</span>
              <span class="rounded-full border border-white/10 px-2 py-1">{{ (flight.discountRate * 10).toFixed(1) }}折</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-[24px] border border-white/10 bg-slate-900/80 p-4">
          <p class="text-xs text-slate-400">机场节点</p>
          <p class="mt-2 text-3xl font-semibold text-white">{{ airportStats.length }}</p>
        </div>
        <div class="rounded-[24px] border border-white/10 bg-slate-900/80 p-4">
          <p class="text-xs text-slate-400">票据航线</p>
          <p class="mt-2 text-3xl font-semibold text-white">{{ mappedFlights.length }}</p>
        </div>
      </div>
    </aside>
  </section>
</template>
