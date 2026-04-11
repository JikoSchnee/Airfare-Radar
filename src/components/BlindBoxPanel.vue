<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useFlightsStore } from '@/stores/flights';
import type { FlightTicket } from '@/types/flight';

const props = withDefaults(defineProps<{
  compact?: boolean;
}>(), {
  compact: false,
});

const router = useRouter();
const flightsStore = useFlightsStore();
const { flights } = storeToRefs(flightsStore);

const departureCity = ref('');
const isDrawing = ref(false);
const resultFlight = ref<FlightTicket | null>(null);
const showModal = ref(false);
const emptyHint = ref('');
const isCollapsed = ref(props.compact);

const matchedFlights = computed(() => {
  const keyword = departureCity.value.trim().toLowerCase();

  if (!keyword) {
    return [];
  }

  return flights.value.filter((flight) => {
    const departureText = [
      flight.departure.city,
      flight.departure.code,
      `${flight.departure.city}${flight.departure.code}`,
    ]
      .join(' ')
      .toLowerCase();

    return departureText.includes(keyword);
  });
});

const performDraw = () => {
  const candidates = matchedFlights.value;

  if (!candidates.length) {
    emptyHint.value = '没有找到符合该出发地的特价机票，试试输入“上海”“北京”或“广州”。';
    resultFlight.value = null;
    showModal.value = true;
    return;
  }

  const pickedFlight = candidates[Math.floor(Math.random() * candidates.length)];
  resultFlight.value = pickedFlight;
  emptyHint.value = '';
  showModal.value = true;
};

const startDraw = () => {
  if (isDrawing.value || !departureCity.value.trim()) {
    return;
  }

  isDrawing.value = true;
  showModal.value = false;

  window.setTimeout(() => {
    performDraw();
    isDrawing.value = false;
  }, 1100);
};

const closeModal = () => {
  showModal.value = false;
};

const openDetail = () => {
  if (!resultFlight.value) {
    return;
  }

  showModal.value = false;
  router.push(`/detail/${resultFlight.value.id}`);
};

const discountText = computed(() =>
  resultFlight.value ? `${(resultFlight.value.discountRate * 10).toFixed(1)}折` : '',
);
</script>

<template>
  <section
    class="relative overflow-hidden rounded-[32px] border border-white/10"
    :class="compact ? 'bg-slate-950/78 p-5' : 'bg-white/5 px-6 py-8 sm:px-8 lg:px-10'"
  >
    <div
      class="absolute inset-x-0 top-0"
      :class="compact ? 'h-32 bg-gradient-to-b from-cyan-400/10 to-transparent' : 'h-56 bg-gradient-to-b from-sky-400/10 to-transparent'"
    />

    <div class="relative space-y-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p
            class="text-sm uppercase tracking-[0.32em]"
            :class="compact ? 'text-cyan-300' : 'text-sky-300'"
          >
            机票盲盒
          </p>
          <h2
            class="mt-3 font-semibold text-white"
            :class="compact ? 'text-2xl leading-8' : 'text-4xl sm:text-5xl'"
          >
            输入出发地，随机抽一张特价票。
          </h2>
          <p
            v-if="!isCollapsed"
            class="mt-3 text-slate-300"
            :class="compact ? 'text-sm leading-6' : 'max-w-xl text-sm leading-7 sm:text-base'"
          >
            支持模糊匹配出发地，像“上海”“上海浦东”“北京”都能识别，并从当前票池里随机抽取一张符合条件的低价机票。
          </p>
        </div>

        <button
          type="button"
          class="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          @click="isCollapsed = !isCollapsed"
        >
          {{ isCollapsed ? '展开盲盒' : '收起盲盒' }}
        </button>
      </div>

      <div
        v-if="isCollapsed"
        class="flex justify-center py-2"
      >
        <div
          class="ticket-mark"
          :class="{ 'ticket-mark--shake': isDrawing }"
        >
          <div class="ticket-mark__outline" />
          <div class="ticket-mark__stub ticket-mark__stub--left" />
          <div class="ticket-mark__stub ticket-mark__stub--right" />
          <div class="ticket-mark__shine" />
          <div class="ticket-mark__question">?</div>
        </div>
      </div>

      <div
        v-else
        :class="compact ? 'space-y-5' : 'grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'"
      >
        <div class="space-y-5">
          <div class="grid gap-4 rounded-[28px] border border-white/10 bg-slate-900/55 p-5">
            <label class="block">
              <span class="mb-2 block text-sm text-slate-300">出发地</span>
              <input
                v-model="departureCity"
                type="text"
                placeholder="例如：上海、北京、广州"
                class="w-full rounded-2xl border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 focus:border-skyline focus:ring-skyline"
              />
            </label>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm text-slate-400">
                当前匹配
                <span class="font-semibold text-white">{{ matchedFlights.length }}</span>
                条机票
              </p>
              <button
                type="button"
                class="rounded-full bg-[linear-gradient(90deg,#22d3ee,#a855f7,#f59e0b,#ef4444)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isDrawing || !departureCity.trim()"
                @click="startDraw"
              >
                {{ isDrawing ? '抽取中...' : '立即抽取' }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <div
            class="ticket-mark"
            :class="[
              compact ? 'ticket-mark--compact' : 'ticket-mark--large',
              { 'ticket-mark--shake': isDrawing },
            ]"
          >
            <div class="ticket-mark__outline" />
            <div class="ticket-mark__stub ticket-mark__stub--left" />
            <div class="ticket-mark__stub ticket-mark__stub--right" />
            <div class="ticket-mark__shine" />
            <div class="ticket-mark__question">?</div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="w-full max-w-lg rounded-[32px] border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-8">
        <template v-if="resultFlight">
          <p class="text-sm uppercase tracking-[0.3em] text-amber-300">抽取结果</p>
          <h3 class="mt-4 text-3xl font-semibold text-white">
            {{ resultFlight.departure.city }} → {{ resultFlight.destination.city }}
          </h3>
          <p class="mt-3 text-slate-300">
            {{ resultFlight.airline }} · {{ resultFlight.flightNumber }} · {{ discountText }}
          </p>

          <div class="mt-6 grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 md:grid-cols-2">
            <div>
              <p class="text-sm text-slate-400">出发</p>
              <p class="mt-2 text-2xl font-semibold text-white">{{ resultFlight.departure.city }}</p>
              <p class="mt-1 text-slate-300">{{ resultFlight.departure.code }} · {{ resultFlight.departure.time }}</p>
            </div>
            <div>
              <p class="text-sm text-slate-400">到达</p>
              <p class="mt-2 text-2xl font-semibold text-white">{{ resultFlight.destination.city }}</p>
              <p class="mt-1 text-slate-300">{{ resultFlight.destination.code }} · {{ resultFlight.destination.time }}</p>
            </div>
          </div>

          <div class="mt-6 flex items-end justify-between gap-4">
            <div>
              <p class="text-sm text-slate-400">抽中价格</p>
              <p class="mt-2 text-5xl font-bold text-white">¥{{ resultFlight.price }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-slate-400">原价</p>
              <p class="mt-2 text-lg text-slate-300 line-through">¥{{ resultFlight.originalPrice }}</p>
            </div>
          </div>

          <div class="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              @click="openDetail"
            >
              查看详情
            </button>
            <button
              type="button"
              class="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              @click="closeModal"
            >
              再抽一次
            </button>
          </div>
        </template>

        <template v-else>
          <p class="text-sm uppercase tracking-[0.3em] text-amber-300">暂无结果</p>
          <h3 class="mt-4 text-3xl font-semibold text-white">这次没有抽到合适机票</h3>
          <p class="mt-4 text-slate-300">{{ emptyHint }}</p>
          <button
            type="button"
            class="mt-8 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            @click="closeModal"
          >
            重新输入
          </button>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ticket-mark {
  position: relative;
  width: 14rem;
  height: 8rem;
  transform-origin: center center;
}

.ticket-mark--compact {
  width: 11rem;
  height: 6.4rem;
}

.ticket-mark--large {
  width: 18rem;
  height: 10.2rem;
}

.ticket-mark--shake {
  animation: ticket-shake 0.85s ease-in-out infinite;
}

.ticket-mark__outline {
  position: absolute;
  inset: 0;
  border-radius: 1.9rem;
  background:
    linear-gradient(#020617, #020617) padding-box,
    linear-gradient(120deg, #22d3ee, #a855f7, #f97316, #eab308, #22d3ee) border-box;
  border: 3px solid transparent;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 14px 36px rgba(34, 211, 238, 0.12),
    0 20px 52px rgba(168, 85, 247, 0.12);
}

.ticket-mark__stub {
  position: absolute;
  top: 50%;
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 9999px;
  background: #020617;
  border: 2px solid rgba(255, 255, 255, 0.08);
  transform: translateY(-50%);
}

.ticket-mark__stub--left {
  left: -0.68rem;
}

.ticket-mark__stub--right {
  right: -0.68rem;
}

.ticket-mark__shine {
  position: absolute;
  inset: 1rem 1.4rem;
  border-radius: 1.25rem;
  background:
    linear-gradient(135deg, rgba(34, 211, 238, 0.14), transparent 28%, rgba(168, 85, 247, 0.12) 55%, transparent 72%, rgba(249, 115, 22, 0.12));
}

.ticket-mark__question {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(2.3rem, 4vw, 4rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  background: linear-gradient(180deg, #22d3ee, #a855f7 40%, #f97316 72%, #eab308);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 24px rgba(168, 85, 247, 0.18);
}

@keyframes ticket-shake {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }

  20% {
    transform: rotate(-3deg) scale(1.01);
  }

  40% {
    transform: rotate(3deg) scale(1.02);
  }

  60% {
    transform: rotate(-2deg) scale(1.01);
  }

  80% {
    transform: rotate(2deg) scale(1.02);
  }
}
</style>
