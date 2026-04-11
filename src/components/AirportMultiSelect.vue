<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { airportOptions, type AirportOption } from '@/data/airportOptions';

export interface AirportSelection {
  id: string;
  label: string;
}

const props = defineProps<{
  label: string;
  placeholder: string;
  selectedItems: AirportSelection[];
}>();

const emit = defineEmits<{
  add: [value: AirportSelection];
  remove: [id: string];
}>();

const rootRef = ref<HTMLElement | null>(null);
const query = ref('');
const isOpen = ref(false);

const selectedIds = computed(() => new Set(props.selectedItems.map((item) => item.id)));

const buildLabel = (option: AirportOption) =>
  `${option.city} · ${option.airport} (${option.code})`;

const matchScore = (option: AirportOption, keyword: string) => {
  if (!keyword) {
    return 0;
  }

  const texts = [option.city, option.airport, option.code, ...option.aliases].map((item) =>
    item.toLowerCase(),
  );

  if (texts.some((item) => item === keyword)) {
    return 3;
  }

  if (texts.some((item) => item.startsWith(keyword))) {
    return 2;
  }

  if (texts.some((item) => item.includes(keyword))) {
    return 1;
  }

  return -1;
};

const suggestions = computed(() => {
  const keyword = query.value.trim().toLowerCase();

  return airportOptions
    .map((option) => ({
      option,
      score: matchScore(option, keyword),
    }))
    .filter(({ score }) => !keyword || score >= 0)
    .sort((left, right) => right.score - left.score || left.option.city.localeCompare(right.option.city))
    .map(({ option }) => option);
});

const handleAdd = (option: AirportOption) => {
  if (selectedIds.value.has(option.id)) {
    return;
  }

  emit('add', {
    id: option.id,
    label: buildLabel(option),
  });

  query.value = '';
  isOpen.value = true;
};

const handleRemove = (id: string) => {
  emit('remove', id);
};

const handleDocumentPointerDown = (event: MouseEvent) => {
  const target = event.target as Node | null;

  if (!target || !rootRef.value?.contains(target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentPointerDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentPointerDown);
});
</script>

<template>
  <div ref="rootRef" class="relative">
    <span class="mb-2 block text-sm text-slate-300">{{ label }}</span>

    <div class="rounded-[24px] border border-white/10 bg-slate-950/60 px-3 py-3">
      <div
        v-if="selectedItems.length"
        class="mb-3 flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1"
      >
        <span
          v-for="item in selectedItems"
          :key="item.id"
          class="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-100"
        >
          <span>{{ item.label }}</span>
          <button
            type="button"
            class="text-sky-200 transition hover:text-white"
            @click.stop="handleRemove(item.id)"
          >
            ×
          </button>
        </span>
      </div>

      <input
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="w-full border-0 bg-transparent px-1 py-1 text-white placeholder:text-slate-500 focus:ring-0"
        @focus="isOpen = true"
        @input="isOpen = true"
        @keydown.esc="isOpen = false"
      />
    </div>

    <div
      v-if="isOpen"
      class="absolute z-30 mt-2 w-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 shadow-2xl"
    >
      <div
        v-if="suggestions.length"
        class="max-h-80 overflow-y-auto overflow-x-hidden"
      >
        <button
          v-for="option in suggestions"
          :key="option.id"
          type="button"
          class="flex w-full items-start justify-between gap-4 border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/5"
          :class="selectedIds.has(option.id) ? 'bg-sky-500/10 opacity-70' : ''"
          @mousedown.prevent
          @click="handleAdd(option)"
        >
          <div>
            <p class="text-sm font-medium text-white">{{ option.city }} · {{ option.airport }}</p>
            <p class="mt-1 text-xs text-slate-400">{{ option.id }}</p>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <span class="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300">
              {{ option.code }}
            </span>
            <span
              v-if="selectedIds.has(option.id)"
              class="rounded-full border border-sky-400/20 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-100"
            >
              已添加
            </span>
          </div>
        </button>
      </div>

      <div
        v-else
        class="px-4 py-5 text-sm text-slate-400"
      >
        没有匹配到机场，请尝试输入城市名、机场名或三字码。
      </div>
    </div>
  </div>
</template>
