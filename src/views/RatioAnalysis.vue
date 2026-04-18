<template>
  <div class="analysis-container">
    <div class="chart-section">
      <div ref="ratioChartRef" class="chart-wrapper">
        <div v-if="loading" class="chart-loading">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="!chartData.length" class="chart-empty">
          <el-empty description="暂无数据" :image-size="80" />
        </div>
      </div>
    </div>

    <div class="data-section">
      <div class="section-header">
        <h3 class="section-title">超标比例数据</h3>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>物质名称</th>
              <th class="numeric">超标次数</th>
              <th class="numeric">超标比例 (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in tableData" :key="index">
              <td>{{ item.substanceName || 'N/A' }}</td>
              <td class="numeric">{{ item.overCount || 0 }}</td>
              <td class="numeric">{{ item.overRatio || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import staticData from '@/services/staticData';

const colors = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  danger: '#EF4444',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  border: 'rgba(226, 232, 240, 0.6)',
  chartBarColor: '#8B5CF6',
  chartLineColor: '#FBBF24'
};

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});

const ratioChartRef = ref(null);
let chartInstance = null;
const loading = ref(true);
const tableData = ref([]);
const chartData = ref([]);

watch(() => props.filters, (newFilters, oldFilters) => {
  if (JSON.stringify(newFilters) !== JSON.stringify(oldFilters)) {
    fetchData();
  }
}, { deep: true });

async function fetchData() {
  try {
    loading.value = true;
    const data = await staticData.getRatioData();

    let result = [];
    if (data) {
      if (Array.isArray(data)) {
        result = data;
      } else if (Array.isArray(data.data)) {
        result = data.data;
      }
    }

    tableData.value = result;
    chartData.value = result;

    loading.value = false;

    nextTick(() => {
      renderChart();
    });

  } catch (error) {
    console.error('获取比例分析数据失败:', error);
    loading.value = false;
  }
}

function renderChart() {
  if (!ratioChartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  const dataForChart = chartData.value
    .filter(item => item.overRatio > 0)
    .sort((a, b) => b.overCount - a.overCount)
    .slice(0, 10);

  if (dataForChart.length === 0) return;

  const container = ratioChartRef.value;
  const containerWidth = container.clientWidth || 600;
  const containerHeight = container.clientHeight || 350;

  chartInstance = echarts.init(container);

  const names = dataForChart.map(item => item.substanceName);
  const overCounts = dataForChart.map(item => item.overCount);
  const overRatios = dataForChart.map(item => item.overRatio);

  const maxCount = Math.ceil(Math.max(...overCounts));
  const maxRatio = Math.ceil(Math.max(...overRatios));

  const countInterval = Math.ceil(maxCount / 5);
  const ratioInterval = Math.ceil(maxRatio / 5);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(226, 232, 240, 0.6)',
      borderWidth: 1,
      textStyle: { color: '#0F172A' },
      extraCssText: 'box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04); border-radius: 16px;',
      formatter: function(params) {
        const idx = params[0].dataIndex;
        return `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].name}</div>
                <div style="display: grid; grid-template-columns: auto auto; gap: 4px 16px;">
                  <span style="color: ${colors.secondary};">超标次数</span>
                  <span style="color: ${colors.textPrimary}; font-weight: 500;">${overCounts[idx]}</span>
                  <span style="color: ${colors.danger};">超标比例</span>
                  <span style="color: ${colors.textPrimary}; font-weight: 500;">${overRatios[idx]}%</span>
                </div>`;
      }
    },
    legend: {
      data: ['超标次数', '超标比例'],
      top: 10,
      textStyle: { color: colors.textSecondary, fontSize: 12 }
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '10%',
      top: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: colors.textSecondary, fontSize: 11, rotate: 30 },
      axisLine: { lineStyle: { color: colors.border } },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '超标次数',
        min: 0,
        max: maxCount,
        splitNumber: 5,
        nameTextStyle: { color: colors.textSecondary, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: colors.textSecondary },
        splitLine: { lineStyle: { color: 'rgba(226, 232, 240, 0.4)', type: 'dashed' } }
      },
      {
        type: 'value',
        name: '超标比例 (%)',
        min: 0,
        max: maxRatio,
        splitNumber: 5,
        nameTextStyle: { color: colors.textSecondary, fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: colors.textSecondary },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '超标次数',
        type: 'bar',
        data: overCounts.map((count) => ({
          value: count,
          itemStyle: {
            color: colors.chartBarColor,
            borderRadius: [4, 4, 0, 0]
          }
        })),
        barWidth: '40%'
      },
      {
        name: '超标比例',
        type: 'line',
        yAxisIndex: 1,
        data: overRatios,
        lineStyle: { color: colors.chartLineColor, width: 2 },
        itemStyle: { color: colors.chartLineColor }
      }
    ]
  };

  chartInstance.setOption(option);
  chartInstance.resize({ width: containerWidth, height: containerHeight });
}

function handleResize() {
  if (chartInstance && ratioChartRef.value) {
    const container = ratioChartRef.value;
    chartInstance.resize({
      width: container.clientWidth || 600,
      height: container.clientHeight || 350
    });
  }
}

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
  setTimeout(() => {
    handleResize();
  }, 300);
});

onUnmounted(() => {
  chartInstance?.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.analysis-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.chart-section {
  flex: 1;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-lg);
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 380px;
  position: relative;
}

.chart-loading,
.chart-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-text-tertiary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.data-section {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.section-header {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.section-title {
  font-size: var(--font-body-size);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.data-table-wrapper {
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-body-size);
}

.data-table th,
.data-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}

.data-table th {
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(248, 250, 252, 0.8);
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table td {
  color: var(--color-text-primary);
}

.data-table tbody tr:hover {
  background: rgba(248, 250, 252, 0.5);
}

.data-table .numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
</style>
