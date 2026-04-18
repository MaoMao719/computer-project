<template>
  <div class="analysis-container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">总样本数</div>
        <div class="stat-value">{{ totalSamples }}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">安全样本数</div>
        <div class="stat-value">{{ safeSamples }}</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-label">不安全样本数</div>
        <div class="stat-value">{{ unsafeSamples }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">安全率</div>
        <div class="stat-value" :class="safetyRateClass">{{ safetyRate }}%</div>
      </div>
    </div>

    <div class="chart-section">
      <div ref="safetyChartRef" class="chart-wrapper"></div>
    </div>

    <div class="data-section">
      <h3 class="section-title">安全样本数据</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>安全状态</th>
            <th class="numeric">样本数量</th>
            <th class="numeric">占比</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><el-tag type="success" effect="light">安全</el-tag></td>
            <td class="numeric">{{ safeSamples }}</td>
            <td class="numeric">{{ safePercent }}%</td>
          </tr>
          <tr>
            <td><el-tag type="danger" effect="light">不安全</el-tag></td>
            <td class="numeric">{{ unsafeSamples }}</td>
            <td class="numeric">{{ unsafePercent }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import staticData from '@/services/staticData'

const safetyChartRef = ref(null)
let chartInstance = null
const data = ref([])

const colors = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  success: '#10B981',
  danger: '#EF4444',
  textPrimary: '#0F172A',
  textSecondary: '#475569'
}

const totalSamples = computed(() => data.value.reduce((s, i) => s + i.sampleCount, 0))
const safeSamples = computed(() => data.value.find(i => i.isSafe === 1)?.sampleCount || 0)
const unsafeSamples = computed(() => data.value.find(i => i.isSafe === 0)?.sampleCount || 0)
const safetyRate = computed(() => totalSamples.value ? ((safeSamples.value / totalSamples.value) * 100).toFixed(2) : 0)
const safePercent = computed(() => totalSamples.value ? ((safeSamples.value / totalSamples.value) * 100).toFixed(2) : 0)
const unsafePercent = computed(() => totalSamples.value ? ((unsafeSamples.value / totalSamples.value) * 100).toFixed(2) : 0)
const safetyRateClass = computed(() => {
  const r = +safetyRate.value
  return r >= 80 ? 'text-success' : r >= 60 ? 'text-warning' : 'text-danger'
})

const fetchData = async () => {
  try {
    const result = await staticData.getSafeData()
    data.value = result
    renderChart()
  } catch (e) {
    console.error('获取数据失败:', e)
    data.value = []
  }
}

const renderChart = () => {
  if (!safetyChartRef.value) return
  chartInstance?.dispose()
  chartInstance = echarts.init(safetyChartRef.value)

  const safeCount = safeSamples.value;
  const unsafeCount = unsafeSamples.value;
  const safePercentText = safePercent.value;
  const unsafePercentText = unsafePercent.value;

  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: colors.textSecondary },
      formatter: (name) => name === '安全' ? `${name} (${safePercentText}%)` : `${name} (${unsafePercentText}%)`
    },
    series: [{
      name: '安全样本',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 14, color: colors.textPrimary },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      labelLine: { show: true },
      data: [
        { value: safeCount, name: '安全', itemStyle: { color: colors.success } },
        { value: unsafeCount, name: '不安全', itemStyle: { color: colors.secondary } }
      ]
    }]
  };
  chartInstance.setOption(option)
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', () => chartInstance?.resize())
})
onUnmounted(() => chartInstance?.dispose())
</script>

<style scoped>
.analysis-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
  box-sizing: border-box;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.stat-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-all);
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.9);
}

.stat-label {
  font-size: var(--font-small-size);
  color: var(--color-text-tertiary);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-primary);
}

.stat-card.success .stat-value { color: var(--color-success); }
.stat-card.danger .stat-value { color: var(--color-danger); }
.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-danger { color: var(--color-danger); }

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
}

.data-section {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);
}

.section-title {
  font-size: var(--font-body-size);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-lg);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}

.data-table th {
  background: rgba(248, 250, 252, 0.8);
  color: var(--color-text-secondary);
  font-weight: 600;
}

.data-table td {
  color: var(--color-text-primary);
}

.data-table .numeric {
  text-align: right;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
