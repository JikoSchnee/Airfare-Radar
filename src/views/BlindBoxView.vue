<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useFlightsStore } from '@/stores/flights';
import type { FlightTicket } from '@/types/flight';

const router = useRouter();
const flightsStore = useFlightsStore();
const { flights } = storeToRefs(flightsStore);

const departureCity = ref('');
const isDrawing = ref(false);
const resultFlight = ref<FlightTicket | null>(null);
const showModal = ref(false);
const emptyHint = ref('');

const matchedFlights = computed(() => {
  const keyword = departureCity.value.trim().toLowerCase();

  if (!keyword) {
    return [];
  }

  return flights.value.filter((flight) => {
    const departureText = `${flight.departure.city} ${flight.departure.code}`.toLowerCase();
    return departureText.includes(keyword);
  });
});

const performDraw = () => {
  const candidates = matchedFlights.value;

  if (!candidates.length) {
    emptyHint.value = '没有找到符合该出发城市的特价机票，试试输入“上海”或“广州”。';
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
  if (isDrawing.value) {
    return;
  }

  isDrawing.value = true;
  showModal.value = false;

  window.setTimeout(() => {
    performDraw();
    isDrawing.value = false;
  }, 1300);
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
  <section class="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 px-6 py-8 sm:px-8 lg:px-10">
    <div class="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-sky-400/10 to-transparent" />

    <div class="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div class="space-y-6">
        <div>
          <p class="text-sm uppercase tracking-[0.34em] text-sky-300">机票盲盒</p>
          <h2 class="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            输入出发地，抽一张说走就走的特价票。
          </h2>
          <p class="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            只要输入你的出发城市，AirFare Radar 就会从当前低价机票池中随机抽出一张符合条件的票，
            适合没有固定目的地、只想捡漏出发的人。
          </p>
        </div>

        <div class="grid gap-4 rounded-[28px] border border-white/10 bg-slate-950/55 p-5 sm:p-6">
          <label class="block">
            <span class="mb-2 block text-sm text-slate-300">出发城市</span>
            <input
              v-model="departureCity"
              type="text"
              placeholder="例如：上海、广州、深圳"
              class="w-full rounded-2xl border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 focus:border-skyline focus:ring-skyline"
            />
          </label>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-slate-400">
              当前匹配
              <span class="font-semibold text-white">{{ matchedFlights.length }}</span>
              条特价票
            </p>
            <button
              type="button"
              class="rounded-full bg-gradient-to-r from-orange-400 to-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isDrawing || !departureCity.trim()"
              @click="startDraw"
            >
              {{ isDrawing ? '抽取中...' : '立即抽取' }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <div class="relative flex h-[22rem] w-full max-w-md items-center justify-center">
          <div class="absolute h-56 w-56 rounded-full bg-orange-400/20 blur-3xl" />

          <div
            class="blindbox-wrapper relative"
            :class="{ 'blindbox-wrapper--shake': isDrawing }"
          >
            <div class="blindbox-lid" :class="{ 'blindbox-lid--open': isDrawing }" />
            <div class="blindbox-body">
              <div class="blindbox-ribbon blindbox-ribbon--vertical" />
              <div class="blindbox-ribbon blindbox-ribbon--horizontal" />
              <div class="blindbox-badge">AIR</div>
              <div class="blindbox-stars">
                <span />
                <span />
                <span />
              </div>
            </div>
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
              再想想
            </button>
          </div>
        </template>

        <template v-else>
          <p class="text-sm uppercase tracking-[0.3em] text-amber-300">暂无结果</p>
          <h3 class="mt-4 text-3xl font-semibold text-white">这次盲盒没有抽到合适机票</h3>
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
.blindbox-wrapper {
  position: relative;
  width: 19rem;
  height: 18rem;
  transform-origin: center bottom;
}

.blindbox-wrapper--shake {
  animation: blindbox-shake 0.8s ease-in-out infinite;
}

.blindbox-body {
  position: absolute;
  inset: 4.5rem 0 0;
  border-radius: 2rem;
  background:
    linear-gradient(135deg, rgba(252, 211, 77, 0.96), rgba(249, 115, 22, 0.92));
  box-shadow:
    0 30px 80px rgba(249, 115, 22, 0.28),
    inset 0 -10px 30px rgba(120, 53, 15, 0.16);
}

.blindbox-lid {
  position: absolute;
  top: 2.5rem;
  left: 50%;
  width: 18rem;
  height: 5.2rem;
  border-radius: 1.8rem;
  background:
    linear-gradient(135deg, rgba(254, 240, 138, 1), rgba(251, 146, 60, 0.94));
  transform: translateX(-50%);
  transform-origin: center bottom;
  box-shadow: 0 20px 35px rgba(249, 115, 22, 0.24);
  transition: transform 0.35s ease;
}

.blindbox-lid--open {
  transform: translateX(-50%) rotate(-8deg) translateY(-0.8rem);
}

.blindbox-ribbon {
  position: absolute;
  background: rgba(255, 251, 235, 0.78);
}

.blindbox-ribbon--vertical {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1.4rem;
  transform: translateX(-50%);
}

.blindbox-ribbon--horizontal {
  left: 0;
  right: 0;
  top: 40%;
  height: 1.2rem;
  transform: translateY(-50%);
}

.blindbox-badge {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  height: 4.8rem;
  width: 4.8rem;
  place-items: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.88);
  color: rgb(124 45 18);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.28em;
  transform: translate(-50%, -50%);
  box-shadow: 0 8px 22px rgba(124, 45, 18, 0.12);
}

.blindbox-stars span {
  position: absolute;
  display: block;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.85);
}

.blindbox-stars span:nth-child(1) {
  top: 1.5rem;
  right: 2rem;
  width: 0.6rem;
  height: 0.6rem;
}

.blindbox-stars span:nth-child(2) {
  bottom: 2.5rem;
  left: 2rem;
  width: 0.8rem;
  height: 0.8rem;
}

.blindbox-stars span:nth-child(3) {
  bottom: 1.6rem;
  right: 3.2rem;
  width: 0.4rem;
  height: 0.4rem;
}

@keyframes blindbox-shake {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }

  20% {
    transform: translateX(-8px) rotate(-3deg);
  }

  40% {
    transform: translateX(8px) rotate(3deg);
  }

  60% {
    transform: translateX(-6px) rotate(-2deg);
  }

  80% {
    transform: translateX(6px) rotate(2deg);
  }
}
</style>
