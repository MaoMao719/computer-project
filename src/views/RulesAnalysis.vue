<template>
  <div class="analysis-container">
    <div class="chart-section card-glass">
      <div class="section-header-compact">
        <div class="chart-legend">
          <div class="legend-item"><span class="dot high"></span><span class="label">强关联 (Lift > 1.4)</span></div>
          <div class="legend-item"><span class="dot medium"></span><span class="label">中关联 (1.16 - 1.4)</span></div>
          <div class="legend-item"><span class="dot low"></span><span class="label">弱关联 (1.0 - 1.16)</span></div>
        </div>
      </div>
      
      <div ref="rulesChartRef" class="chart-wrapper">
        <div v-if="loading" class="chart-state">
          <div class="loading-spinner"></div>
          <span>正在加载分析数据...</span>
        </div>
        <div v-else-if="!chartData.length" class="chart-state">
          <div class="empty-placeholder">
            <p>未获取到有效规则</p>
          </div>
        </div>
      </div>
    </div>

    <div class="data-section card-glass">
      <div class="section-header">
        <div class="flex-header">
          <div class="icon-tag">
            <ActivityIcon :size="16" />
          </div>
          <h3 class="section-title">规则分析明细</h3>
        </div>
      </div>
      
      <div class="data-table-wrapper custom-scrollbar">
        <table class="data-table">
          <thead>
            <tr>
              <th>前件 (Antecedent)</th>
              <th>后件 (Consequent)</th>
              <th class="numeric">支持度</th>
              <th class="numeric">置信度</th>
              <th class="numeric">提升度</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rule, index) in tableData" :key="index" class="table-row-hover">
              <td class="font-bold text-slate-700">{{ rule.antecedents || 'N/A' }}</td>
              <td class="text-slate-500">{{ rule.consequents || 'N/A' }}</td>
              <td class="numeric tabular-nums">{{ formatNum(rule.support) }}</td>
              <td class="numeric tabular-nums">{{ formatNum(rule.confidence) }}</td>
              <td class="numeric">
                <span :class="['lift-badge', getLiftClass(rule.lift)]">
                  {{ formatNum(rule.lift) }}
                </span>
              </td>
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
import { Activity as ActivityIcon } from 'lucide-vue-next';
import staticData from '@/services/staticData';

// 调色盘配置
const colors = {
  high: { fill: 'rgba(129, 140, 248, 0.4)', border: 'rgba(129, 140, 248, 0.9)' },   // 浅紫色
  medium: { fill: 'rgba(251, 191, 36, 0.4)', border: 'rgba(251, 191, 36, 0.9)' },  // 暖黄色
  low: { fill: 'rgba(52, 211, 153, 0.4)', border: 'rgba(52, 211, 153, 0.9)' },     // 青绿色
  grid: '#F1F5F9'
};

const rulesChartRef = ref(null);
let chartInstance = null;
const loading = ref(true);
const tableData = ref([]);
const chartData = ref([]);

const formatNum = (val) => (typeof val === 'number' ? val.toFixed(4) : '0.0000');

function getLiftClass(lift) {
  if (lift > 1.4) return 'badge-high';
  if (lift > 1.16) return 'badge-medium';
  return 'badge-low';
}

/**
 * 数据清洗逻辑：包含之前讨论的所有特定点排除和稀疏化处理
 */
function applyDataFilter(rawData) {
  const result = [];
  const binSize = 0.012;
  const bins = new Map();

  rawData.forEach(item => {
    const conf = item.confidence;
    const lift = item.lift;

    // 排除左侧孤立点
    if (conf < 0.72 && lift < 1.18) return;
    
    // 排除 0.85 坐标附近的垂直拥挤点
    if (Math.abs(conf - 0.85) < 0.005 && lift < 1.14) return;

    if (lift > 1.4) {
      result.push(item);
    } else {
      const binKey = Math.floor(conf / binSize);
      if (!bins.has(binKey)) {
        bins.set(binKey, item);
      } else if (item.lift > bins.get(binKey).lift) {
        bins.set(binKey, item);
      }
    }
  });

  bins.forEach(value => result.push(value));
  return result;
}

async function fetchData() {
  try {
    loading.value = true;
    const data = await staticData.getRulesData();
    const result = Array.isArray(data) ? data : (data?.data || []);

    const cleanData = result.filter(item => item && item.lift !== undefined);
    const optimizedData = applyDataFilter(cleanData);

    tableData.value = optimizedData;
    chartData.value = optimizedData;
    loading.value = false;

    nextTick(() => renderChart());
  } catch (error) {
    console.error('API Error:', error);
    loading.value = false;
  }
}

function renderChart() {
  if (!rulesChartRef.value) return;
  if (chartInstance) chartInstance.dispose();

  chartInstance = echarts.init(rulesChartRef.value);
  const bubbleData = chartData.value.map(item => [
    item.confidence,
    item.lift,
    (item.support || 0),
    item.antecedents,
    item.consequents
  ]);

  const option = {
    backgroundColor: 'transparent',
    grid: { left: '5%', right: '5%', bottom: '12%', top: '15%', containLabel: true },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderRadius: 12,
      padding: 12,
      formatter: (params) => {
        const d = params.data;
        return `
          <div style="min-width: 140px;">
            <div style="font-weight: 800; color: #1E293B; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
              ${d[3]} ➔ ${d[4]}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span style="color: #64748B;">提升度:</span>
              <span style="font-weight: 800; color: #6366f1;">${d[1].toFixed(4)}</span>
            </div>
          </div>
        `;
      }
    },
    xAxis: {
      type: 'value',
      name: '置信度 (Confidence)',
      nameLocation: 'center',
      nameGap: 35,
      min: (v) => (v.min * 0.99).toFixed(2),
      max: (v) => (v.max * 1.01).toFixed(2),
      splitLine: { lineStyle: { color: colors.grid, type: 'dashed' } },
      axisLine: { show: false },
      axisLabel: { color: '#94A3B8', fontWeight: 600 }
    },
    yAxis: {
      type: 'value',
      name: '提升度 (Lift)',
      nameLocation: 'center',
      nameGap: 45,
      min: (v) => (v.min * 0.99).toFixed(2),
      max: (v) => (v.max * 1.02).toFixed(2),
      splitLine: { lineStyle: { color: colors.grid } },
      axisLine: { show: false },
      axisLabel: { color: '#94A3B8', fontWeight: 600 }
    },
    series: [{
      type: 'scatter',
      data: bubbleData,
      symbolSize: (data) => Math.max(22, Math.min(Math.sqrt(data[2]) * 95, 65)),
      itemStyle: {
        color: (params) => {
          const lift = params.data[1];
          if (lift > 1.4) return colors.high.fill;
          if (lift > 1.16) return colors.medium.fill;
          return colors.low.fill;
        },
        borderColor: (params) => {
          const lift = params.data[1];
          if (lift > 1.4) return colors.high.border;
          if (lift > 1.16) return colors.medium.border;
          return colors.low.border;
        },
        borderWidth: 2
      },
      emphasis: {
        scale: 1.15,
        itemStyle: { shadowBlur: 15, shadowColor: 'rgba(0,0,0,0.1)' }
      }
    }]
  };
  chartInstance.setOption(option);
}

const handleResize = () => chartInstance?.resize();

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
  padding: 24px;
  background-color: #F8FAFC;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
}

.card-glass {
  background: white;
  border-radius: 20px;
  border: 1px solid #F1F5F9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  padding: 24px;
}

/* 修改布局：将子元素（图例）居中排布 */
.section-header-compact {
  display: flex;
  justify-content: center; /* 关键修改：靠右改为居中 */
  align-items: center;
  margin-bottom: 24px;
  min-height: 28px;
}

.chart-legend { 
  display: flex; 
  gap: 24px; /* 稍微增加间距让居中看起来更舒展 */
}

.legend-item { display: flex; align-items: center; gap: 8px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.high { background: #818CF8; }
.dot.medium { background: #FBBF24; }
.dot.low { background: #34D399; }
.label { font-size: 12px; color: #64748B; font-weight: 600; }

.chart-wrapper { width: 100%; height: 460px; position: relative; }

/* 表格样式保持 */
.data-table-wrapper { margin-top: 20px; max-height: 400px; overflow-y: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { 
  padding: 12px; text-align: left; font-size: 11px; color: #94A3B8; 
  text-transform: uppercase; border-bottom: 1px solid #F1F5F9;
  position: sticky; top: 0; background: white;
}
.data-table td { padding: 14px 12px; font-size: 13px; border-bottom: 1px solid #F8FAFC; }

.lift-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; }
.badge-high { background: #EEF2FF; color: #818CF8; }
.badge-medium { background: #FFFBEB; color: #F59E0B; }
.badge-low { background: #ECFDF5; color: #10B981; }

.numeric { text-align: right; }
.loading-spinner {
  width: 24px; height: 24px; border: 3px solid #E2E8F0;
  border-top-color: #818CF8; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
</style>