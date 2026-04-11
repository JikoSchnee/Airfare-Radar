<script setup lang="ts">
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import type { FlightTicket } from '@/types/flight';
import { buildPriceHistory } from '@/utils/priceHistory';

use([CanvasRenderer, LineChart, GridComponent, LegendComponent, TooltipComponent]);

const props = defineProps<{
  flight: FlightTicket;
}>();

const history = computed(() => buildPriceHistory(props.flight));

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(8, 17, 31, 0.92)',
    borderColor: 'rgba(56, 189, 248, 0.26)',
    textStyle: {
      color: '#e2e8f0',
    },
    valueFormatter: (value: number) => `¥${value}`,
  },
  grid: {
    left: 16,
    right: 16,
    top: 24,
    bottom: 20,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: history.value.map((item) => item.date),
    axisLine: {
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.3)',
      },
    },
    axisLabel: {
      color: '#94a3b8',
      fontSize: 11,
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#94a3b8',
      formatter: '¥{value}',
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.14)',
      },
    },
  },
  series: [
    {
      name: '价格走势',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      data: history.value.map((item) => item.price),
      lineStyle: {
        width: 3,
        color: '#38bdf8',
      },
      itemStyle: {
        color: '#f97316',
        borderColor: '#fff7ed',
        borderWidth: 2,
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(56, 189, 248, 0.30)',
            },
            {
              offset: 1,
              color: 'rgba(56, 189, 248, 0.02)',
            },
          ],
        },
      },
    },
  ],
}));
</script>

<template>
  <div class="rounded-[32px] border border-white/10 bg-white/5 p-5 sm:p-6">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-skyline/80">近 30 天走势</p>
        <h3 class="mt-2 text-2xl font-semibold text-white">历史价格趋势</h3>
      </div>
      <p class="text-sm text-slate-400">模拟数据，用于展示降价与回弹走势</p>
    </div>

    <VChart
      class="mt-5 h-[320px] w-full"
      :option="chartOption"
      autoresize
    />
  </div>
</template>
