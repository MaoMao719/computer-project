<template>
  <div class="analysis-container">
    <div class="chart-section">
      <div ref="outlierChartRef" class="chart-wrapper">
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
        <h3 class="section-title">异常值数据</h3>
      </div>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>污染物名称</th>
              <th class="numeric">异常值数量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in tableData" :key="index">
              <td>{{ item.pollutantName || 'N/A' }}</td>
              <td class="numeric">{{ item.outlierCount || 0 }}</td>
            </tr>
            <tr v-if="tableData.length === 0 && !loading">
              <td colspan="2" style="text-align: center; color: var(--color-text-tertiary);">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import staticData from '@/services/staticData';

const colors = {
  primary: '#6366F1',
  primaryHover: '#818CF8',
  secondary: '#8B5CF6',
  danger: '#EF4444',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: 'rgba(226, 232, 240, 0.6)',
  borderLight: 'rgba(226, 232, 240, 0.4)'
};

const outlierChartRef = ref(null);
let chartInstance = null;
const loading = ref(true);
const tableData = ref([]);
const chartData = ref([]);

async function fetchData() {
  try {
    const data = await staticData.getOutliersData();
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
    console.error('获取异常值数据失败:', error);
    loading.value = false;
  }
}

function renderChart() {
  if (!outlierChartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  const dataForChart = chartData.value
    .filter(item => item.outlierCount > 0)
    .sort((a, b) => b.outlierCount - a.outlierCount)
    .slice(0, 10);

  if (dataForChart.length === 0) return;

  chartInstance = echarts.init(outlierChartRef.value);

  const names = dataForChart.map(item => item.pollutantName);
  const counts = dataForChart.map(item => item.outlierCount);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(226, 232, 240, 0.6)',
      borderWidth: 1,
      textStyle: { color: '#0F172A' },
      extraCssText: 'box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04); border-radius: 16px;',
      formatter: function(params) {
        const item = params[0];
        return `<div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                <div style="color: ${colors.secondary}; font-size: 18px; font-weight: 700;">${item.value}</div>
                <div style="color: ${colors.textTertiary}; margin-top: 4px;">异常值数量</div>`;
      }
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: colors.textSecondary },
      splitLine: {
        lineStyle: { color: colors.borderLight, type: 'dashed' }
      }
    },
    yAxis: {
      type: 'category',
      data: names,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: colors.textPrimary,
        fontSize: 12
      }
    },
    series: [{
      type: 'bar',
      data: counts.map((count) => ({
        value: count,
        itemStyle: {
          color: colors.secondary,
          borderRadius: [0, 4, 4, 0]
        }
      })),
      barWidth: '55%',
      emphasis: {
        itemStyle: {
          color: colors.primaryHover
        }
      },
      label: {
        show: true,
        position: 'right',
        color: colors.textSecondary,
        fontSize: 12,
        formatter: '{c}'
      }
    }]
  };

  chartInstance.setOption(option);
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
