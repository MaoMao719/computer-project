<template>
  <div class="analysis-container">
    <div class="chart-section">
      <div ref="pollutantChartRef" class="chart-wrapper">
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
        <h3 class="section-title">污染物数值分布数据</h3>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>污染物名称</th>
              <th class="numeric">最小值</th>
              <th class="numeric">Q1</th>
              <th class="numeric">中位数</th>
              <th class="numeric">Q3</th>
              <th class="numeric">最大值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in tableData" :key="index">
              <td>{{ item.pollutantName || 'N/A' }}</td>
              <td class="numeric">{{ item.minVal?.toFixed(4) || 'N/A' }}</td>
              <td class="numeric">{{ item.q1?.toFixed(4) || 'N/A' }}</td>
              <td class="numeric">{{ item.median?.toFixed(4) || 'N/A' }}</td>
              <td class="numeric">{{ item.q3?.toFixed(4) || 'N/A' }}</td>
              <td class="numeric">{{ item.maxVal?.toFixed(4) || 'N/A' }}</td>
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

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['chart-click']);

const pollutantChartRef = ref(null);
let chartInstance = null;
const loading = ref(true);
const tableData = ref([]);
const chartData = ref([]);

const colors = {
  primary: '#6366F1',
  primaryHover: '#818CF8',
  secondary: '#8B5CF6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: 'rgba(226, 232, 240, 0.6)',
  borderLight: 'rgba(226, 232, 240, 0.4)',
  bgColor: 'rgba(255, 255, 255, 0.7)'
};

const getLightTooltip = () => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderColor: 'rgba(226, 232, 240, 0.6)',
  borderWidth: 1,
  textStyle: { color: '#0F172A' },
  extraCssText: 'box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04); border-radius: 16px; backdrop-filter: blur(20px);'
});

watch(() => props.filters, (newFilters, oldFilters) => {
  if (JSON.stringify(newFilters) !== JSON.stringify(oldFilters)) {
    fetchData();
  }
}, { deep: true });

async function fetchData() {
  try {
    loading.value = true;
    const data = await staticData.getPollutantData();

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
    console.error('获取污染物数据失败:', error);
    loading.value = false;
  }
}

function renderChart() {
  if (!pollutantChartRef.value || !chartData.value.length) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(pollutantChartRef.value);

  const names = chartData.value.map(item => item.pollutantName);
  const boxplotData = chartData.value.map(item => [
    item.minVal, item.q1, item.median, item.q3, item.maxVal
  ]);

  const option = {
    tooltip: {
      ...getLightTooltip(),
      trigger: 'item',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        if (params.seriesType !== 'boxplot') return '';
        const item = chartData.value[params.dataIndex];
        return `<div style="font-weight: 600; margin-bottom: 8px;">${item.pollutantName}</div>
                <div style="display: grid; grid-template-columns: auto auto; gap: 4px 16px;">
                  <span style="color: ${colors.textSecondary};">最大值</span>
                  <span style="color: ${colors.textPrimary};">${item.maxVal?.toFixed(4)}</span>
                  <span style="color: ${colors.textSecondary};">上四分位</span>
                  <span style="color: ${colors.textPrimary};">${item.q3?.toFixed(4)}</span>
                  <span style="color: ${colors.textSecondary};">中位数</span>
                  <span style="color: ${colors.primary}; font-weight: 600;">${item.median?.toFixed(4)}</span>
                  <span style="color: ${colors.textSecondary};">下四分位</span>
                  <span style="color: ${colors.textPrimary};">${item.q1?.toFixed(4)}</span>
                  <span style="color: ${colors.textSecondary};">最小值</span>
                  <span style="color: ${colors.textPrimary};">${item.minVal?.toFixed(4)}</span>
                </div>`;
      }
    },
    grid: {
      left: '6%',
      right: '5%',
      bottom: '18%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: names,
      boundaryGap: true,
      nameTextStyle: { color: colors.textSecondary, fontSize: 12 },
      axisLine: { lineStyle: { color: colors.border } },
      axisTick: { show: false },
      axisLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '污染物浓度',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: 'bold'
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: colors.textSecondary, fontSize: 11 },
      splitLine: {
        lineStyle: { color: colors.borderLight, type: 'dashed' }
      }
    },
    series: [{
      type: 'boxplot',
      data: boxplotData,
      itemStyle: {
        color: 'rgba(99, 102, 241, 0.1)',
        borderColor: colors.primary,
        borderWidth: 2
      },
      lineStyle: { color: colors.primary, width: 2 },
      upperLabel: { show: false },
      medianStyle: {
        color: colors.primary,
        width: 3
      },
      emphasis: {
        itemStyle: {
          borderColor: colors.primaryHover,
          borderWidth: 3
        }
      }
    }]
  };

  chartInstance.setOption(option);

  chartInstance.off('click');
  chartInstance.on('click', function(params) {
    if (params.seriesType === 'boxplot') {
      emit('chart-click', 'pollutant', params);
    }
  });
}

function handleResize() {
  chartInstance?.resize();
}

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
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
  min-height: 350px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-lg);
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 350px;
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
