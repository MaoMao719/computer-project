<template>
  <div class="dashboard-container">
    <div class="dashboard-grid">
      <header class="kpi-header">
        <div class="kpi-card" :class="{ warning: kpiData.totalOutliers > 0 }">
          <div class="kpi-icon bg-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">总样本数</div>
            <div class="kpi-value">{{ kpiData.totalSamples || '--' }}</div>
          </div>
          <div v-if="loading.kpi" class="kpi-skeleton skeleton"></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon bg-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">安全样本占比</div>
            <div class="kpi-value" :class="safetyRateClass">{{ kpiData.safetyRate || '0' }}%</div>
          </div>
          <div v-if="loading.kpi" class="kpi-skeleton skeleton"></div>
        </div>
        <div class="kpi-card" :class="{ danger: kpiData.totalOutliers > 100 }">
          <div class="kpi-icon bg-danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">异常值总数</div>
            <div class="kpi-value">{{ kpiData.totalOutliers || '--' }}</div>
          </div>
          <div v-if="loading.kpi" class="kpi-skeleton skeleton"></div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon bg-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">超标污染物 TOP1</div>
            <div class="kpi-value kpi-text">{{ kpiData.topPollutant || '--' }}</div>
          </div>
          <div v-if="loading.kpi" class="kpi-skeleton skeleton"></div>
        </div>
      </header>

      <section class="analysis-section">
        <div class="section-row">
          <div class="chart-panel">
            <div class="panel-header">
              <h3 class="panel-title">污染物数值分布</h3>
              <div class="panel-actions">
                <el-button text size="small" @click="handleChartExport('pollutant')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                </el-button>
                <el-button text size="small" @click="handleChartFullscreen('pollutant')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                  </svg>
                </el-button>
              </div>
            </div>
            <div class="panel-body">
              <PollutantAnalysis :filters="dashboardFilters" @chart-click="handleChartClick" />
            </div>
          </div>

          <div class="chart-panel">
            <div class="panel-header">
              <h3 class="panel-title">异常值统计</h3>
              <div class="panel-actions">
                <el-button text size="small" @click="handleChartExport('outlier')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                </el-button>
                <el-button text size="small" @click="handleChartFullscreen('outlier')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                  </svg>
                </el-button>
              </div>
            </div>
            <div class="panel-body">
              <div ref="outlierChartRef" class="chart-wrapper">
                <div v-if="loading.outlier" class="chart-skeleton skeleton"></div>
                <div v-else-if="!outlierData.length" class="chart-empty">
                  <el-empty description="暂无数据" :image-size="80" />
                </div>
                <div v-show="!loading.outlier && outlierData.length" class="chart-content"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="section-row">
          <div class="chart-panel">
            <div class="panel-header">
              <h3 class="panel-title">安全样本统计</h3>
              <div class="panel-actions">
                <el-button text size="small" @click="handleChartExport('safety')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                </el-button>
                <el-button text size="small" @click="handleChartFullscreen('safety')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                  </svg>
                </el-button>
              </div>
            </div>
            <div class="panel-body">
              <div ref="safetyChartRef" class="chart-wrapper">
                <div v-if="loading.safety" class="chart-skeleton skeleton"></div>
                <div v-else-if="!safetyData.length" class="chart-empty">
                  <el-empty description="暂无数据" :image-size="80" />
                </div>
                <div v-show="!loading.safety && safetyData.length" class="chart-content"></div>
              </div>
            </div>
          </div>

          <div class="chart-panel">
            <div class="panel-header">
              <h3 class="panel-title">超标比例分析</h3>
              <div class="panel-actions">
                <el-button text size="small" @click="handleChartExport('ratio')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                </el-button>
                <el-button text size="small" @click="handleChartFullscreen('ratio')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                  </svg>
                </el-button>
              </div>
            </div>
            <div class="panel-body">
              <RatioAnalysis :filters="dashboardFilters" />
            </div>
          </div>
        </div>

        <div class="section-row full-width">
          <div class="chart-panel">
            <div class="panel-header">
              <h3 class="panel-title">污染物关联规则</h3>
              <div class="panel-actions">
                <el-button text size="small" @click="handleChartExport('rules')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                </el-button>
                <el-button text size="small" @click="handleChartFullscreen('rules')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                  </svg>
                </el-button>
              </div>
            </div>
            <div class="panel-body">
              <div class="chart-wrapper">
                <div ref="rulesChartRef" class="chart-content"></div>
                <div v-if="loading.rules" class="chart-skeleton skeleton"></div>
                <div v-else-if="rulesData.length === 0 && !loading.rules" class="chart-empty">
                  <el-empty description="暂无关联规则数据" :image-size="80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <el-dialog
      v-model="showDetailModal"
      :title="detailData.title"
      width="480px"
      :close-on-click-modal="true"
    >
      <div class="detail-grid">
        <div v-for="(value, key) in detailData.items" :key="key" class="detail-item">
          <div class="detail-label">{{ key }}</div>
          <div class="detail-value">{{ value }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import PollutantAnalysis from './PollutantAnalysis.vue';
import RatioAnalysis from './RatioAnalysis.vue';
import staticData from '@/services/staticData';

const CHART_COLORS = {
  primary: '#6366F1',
  primaryHover: '#818CF8',
  secondary: '#8B5CF6',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: 'rgba(226, 232, 240, 0.6)',
  borderLight: 'rgba(226, 232, 240, 0.4)',
  bgColor: '#FFFFFF'
};

const getLightTooltip = () => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderColor: 'rgba(226, 232, 240, 0.6)',
  borderWidth: 1,
  textStyle: { color: '#0F172A' },
  extraCssText: 'box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04); border-radius: 16px; backdrop-filter: blur(20px);'
});

const outlierChartRef = ref(null);
const safetyChartRef = ref(null);
const rulesChartRef = ref(null);

let outlierChartInstance = null;
let safetyChartInstance = null;
let rulesChartInstance = null;

const loading = reactive({
  kpi: true,
  outlier: true,
  safety: true,
  rules: true
});

const outlierData = ref([]);
const safetyData = ref([]);
const rulesData = ref([]);
const availablePollutants = ref([]);

const dashboardFilters = reactive({
  timeRange: 'month',
  pollutants: []
});

const isCarouselActive = ref(false);
let carouselInterval = null;
let carouselIndex = 0;

const showDetailModal = ref(false);
const detailData = reactive({
  title: '',
  items: {}
});

const kpiData = reactive({
  totalSamples: 0,
  safetyRate: 0,
  totalOutliers: 0,
  topPollutant: '--'
});

const colors = CHART_COLORS;

const safetyRateClass = computed(() => {
  const rate = parseFloat(kpiData.safetyRate);
  if (rate >= 80) return 'text-success';
  if (rate >= 60) return 'text-warning';
  return 'text-danger';
});

watch(() => dashboardFilters.pollutants, (newPollutants, oldPollutants) => {
  if (JSON.stringify(newPollutants) !== JSON.stringify(oldPollutants)) {
    fetchAllData();
  }
}, { deep: true });

function handleFilterChange() {
  fetchAllData();
}

async function fetchAllData() {
  loading.kpi = true;
  loading.outlier = true;
  loading.safety = true;
  loading.rules = true;

  await Promise.all([
    fetchOutlierData(),
    fetchSafetyData(),
    fetchRulesData()
  ]);

  loading.kpi = false;

  nextTick(() => {
    renderOutlierChart();
    renderSafetyChart();
    renderRulesChart();
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  });
}

async function fetchOutlierData() {
  try {
    const data = await staticData.getOutliersData();
    outlierData.value = data || [];
    updateAvailablePollutants();
    updateKPIData();
  } catch (error) {
    console.error('获取异常值数据失败:', error);
  } finally {
    loading.outlier = false;
  }
}

async function fetchSafetyData() {
  try {
    const data = await staticData.getSafeData();
    safetyData.value = data || [];
    updateKPIData();
  } catch (error) {
    console.error('获取安全样本数据失败:', error);
  } finally {
    loading.safety = false;
  }
}

async function fetchRulesData() {
  try {
    const data = await staticData.getRulesData();
    let result = [];
    if (data) {
      if (Array.isArray(data)) {
        result = data;
      } else if (Array.isArray(data.data)) {
        result = data.data;
      }
    }
    rulesData.value = result.filter(item => item && item.lift && item.confidence);
  } catch (error) {
    console.error('获取关联规则数据失败:', error);
    rulesData.value = [];
  } finally {
    loading.rules = false;
  }
}

function updateAvailablePollutants() {
  const pollutants = new Set();
  outlierData.value.forEach(item => {
    if (item.pollutantName) pollutants.add(item.pollutantName);
  });
  availablePollutants.value = Array.from(pollutants).sort();
}

function updateKPIData() {
  const totalSamples = safetyData.value.reduce((sum, item) => sum + item.sampleCount, 0) ||
                       outlierData.value.reduce((sum, item) => sum + item.outlierCount, 0);
  kpiData.totalSamples = totalSamples;

  const safeItem = safetyData.value.find(item => item.isSafe === 1);
  if (totalSamples > 0 && safeItem) {
    kpiData.safetyRate = ((safeItem.sampleCount / totalSamples) * 100).toFixed(1);
  }

  kpiData.totalOutliers = outlierData.value.reduce((sum, item) => sum + item.outlierCount, 0);

  if (outlierData.value.length > 0) {
    const topItem = outlierData.value.reduce((max, item) =>
      item.outlierCount > max.outlierCount ? item : max
    );
    kpiData.topPollutant = topItem.pollutantName;
  }
}

function renderOutlierChart() {
  if (!outlierChartRef.value) return;
  if (outlierChartInstance) outlierChartInstance.dispose();

  nextTick(() => {
    outlierChartInstance = echarts.init(outlierChartRef.value);
    const data = outlierData.value.filter(item => item.outlierCount > 0)
      .sort((a, b) => b.outlierCount - a.outlierCount)
      .slice(0, 10);

    if (data.length === 0) return;

    const names = data.map(item => item.pollutantName);
    const counts = data.map(item => item.outlierCount);

    const option = {
      tooltip: { ...getLightTooltip(), trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '8%', bottom: '3%', top: '8%', containLabel: true },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: colors.textSecondary },
        splitLine: { lineStyle: { color: colors.borderLight, type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: names,
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: colors.textPrimary, fontSize: 12 }
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
        barWidth: '50%',
        emphasis: {
          itemStyle: { color: colors.primaryHover }
        },
        label: { show: true, position: 'right', color: colors.textSecondary, fontSize: 12 }
      }]
    };
    outlierChartInstance.setOption(option);
  });
}

function renderSafetyChart() {
  if (!safetyChartRef.value) return;
  if (safetyChartInstance) safetyChartInstance.dispose();

  const safeItem = safetyData.value.find(item => item.isSafe === 1);
  const unsafeItem = safetyData.value.find(item => item.isSafe === 0);
  const safeCount = safeItem?.sampleCount || 0;
  const unsafeCount = unsafeItem?.sampleCount || 0;
  const total = safeCount + unsafeCount;
  const safePercent = total > 0 ? ((safeCount / total) * 100).toFixed(1) : 0;
  const unsafePercent = total > 0 ? ((unsafeCount / total) * 100).toFixed(1) : 0;

  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: colors.textSecondary },
      formatter: (name) => name === '安全' ? `${name} (${safePercent}%)` : `${name} (${unsafePercent}%)`
    },
    graphic: [],
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

  safetyChartInstance = echarts.init(safetyChartRef.value);
  safetyChartInstance.setOption(option);
}

function renderRulesChart() {
  if (!rulesChartRef.value) return;

  if (rulesChartInstance) {
    rulesChartInstance.dispose();
    rulesChartInstance = null;
  }

  const rawData = rulesData.value;
  if (!rawData || rawData.length === 0) return;

  rulesChartInstance = echarts.init(rulesChartRef.value);

  const binSize = 0.012;
  const bins = new Map();
  const result = [];

  rawData.forEach(item => {
    const conf = item.confidence;
    const lift = item.lift;

    if (conf < 0.72 && lift < 1.18) return;
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

  const bubbleData = result.map(item => [
    item.confidence,
    item.lift,
    (item.support || 0),
    item.antecedents || '未知',
    item.consequents || '未知'
  ]);

  if (bubbleData.length === 0) return;

  const liftValues = bubbleData.map(item => item[1]);
  const minLift = Math.floor(Math.min(...liftValues) * 10) / 10;
  const maxLift = Math.ceil(Math.max(...liftValues) * 10) / 10;

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
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
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
      splitLine: { lineStyle: { color: '#F1F5F9' } },
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
          if (lift > 1.4) return 'rgba(129, 140, 248, 0.4)';
          if (lift > 1.16) return 'rgba(251, 191, 36, 0.4)';
          return 'rgba(52, 211, 153, 0.4)';
        },
        borderColor: (params) => {
          const lift = params.data[1];
          if (lift > 1.4) return 'rgba(129, 140, 248, 0.9)';
          if (lift > 1.16) return 'rgba(251, 191, 36, 0.9)';
          return 'rgba(52, 211, 153, 0.9)';
        },
        borderWidth: 2
      },
      emphasis: {
        scale: 1.15,
        itemStyle: { shadowBlur: 15, shadowColor: 'rgba(0,0,0,0.1)' }
      }
    }]
  };

  rulesChartInstance.setOption(option);
  rulesChartInstance.off('click');
  rulesChartInstance.on('click', params => handleChartClick('rules', params));
}

function handleChartClick(chartType, params) {
  let title = '';
  const items = {};

  switch (chartType) {
    case 'outlier':
      title = `异常值详情 - ${params.name}`;
      items['污染物名称'] = params.name;
      items['异常值数量'] = params.value;
      break;
    case 'safety':
      title = `安全性详情 - ${params.name}`;
      items['状态'] = params.name;
      items['样本数量'] = params.value;
      items['占比'] = params.percent + '%';
      break;
    case 'rules':
      title = '关联规则详情';
      items['前件'] = params.data[3];
      items['后件'] = params.data[4];
      items['置信度'] = params.data[0].toFixed(4);
      items['提升度'] = params.data[1].toFixed(4);
      items['支持度'] = params.data[2].toFixed(4);
      break;
  }

  detailData.title = title;
  Object.assign(detailData, { items });
  showDetailModal.value = true;
}

function handleResize() {
  outlierChartInstance?.resize();
  safetyChartInstance?.resize();
  rulesChartInstance?.resize();
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 100);
}

function handleChartFullscreen(chartType) {
  const map = { outlier: outlierChartInstance, safety: safetyChartInstance, rules: rulesChartInstance };
  const instance = map[chartType];
  if (instance) {
    !document.fullscreenElement ? instance.getDom().requestFullscreen() : document.exitFullscreen();
  }
}

function handleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

function handleChartExport(chartType) {
  const map = {
    outlier: { instance: outlierChartInstance, title: '异常值统计' },
    safety: { instance: safetyChartInstance, title: '安全样本统计' },
    rules: { instance: rulesChartInstance, title: '关联规则分析' }
  };
  const target = map[chartType];
  if (!target?.instance) return ElMessage.warning('图表尚未加载完成');

  const link = document.createElement('a');
  link.href = target.instance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#FFFFFF' });
  link.download = `${target.title}_${new Date().toISOString().slice(0, 10)}.png`;
  link.click();
  ElMessage.success('图表导出成功');
}

function handleExport() {
  const exportData = { kpi: { ...kpiData }, outlier: outlierData.value, safety: safetyData.value, rules: rulesData.value, exportTime: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `水质污染物数据_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  ElMessage.success('数据导出成功');
}

function toggleCarousel() {
  isCarouselActive.value = !isCarouselActive.value;
  isCarouselActive.value ? startCarousel() : stopCarousel();
}

function startCarousel() {
  if (carouselInterval) return;
  carouselInterval = setInterval(() => {
    carouselIndex = (carouselIndex + 1) % 3;
    scrollToSection(carouselIndex);
  }, 10000);
}

function stopCarousel() {
  if (carouselInterval) { clearInterval(carouselInterval); carouselInterval = null; }
}

function scrollToSection(index) {
  const sections = document.querySelectorAll('.section-row');
  if (sections[index]) sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

onMounted(() => {
  fetchAllData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  outlierChartInstance?.dispose();
  safetyChartInstance?.dispose();
  rulesChartInstance?.dispose();
  window.removeEventListener('resize', handleResize);
  stopCarousel();
});
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  flex: 1;
}

.kpi-header { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--spacing-xl); }

.kpi-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-all);
}
.kpi-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-card-hover);
}
.kpi-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xl);
  flex-shrink: 0;
}
.bg-primary { background: var(--color-primary-bg); color: var(--color-primary); }
.bg-success { background: var(--color-success-bg); color: var(--color-success); }
.bg-danger { background: var(--color-danger-bg); color: var(--color-danger); }
.bg-warning { background: var(--color-warning-bg); color: var(--color-warning); }

.kpi-content { flex: 1; min-width: 0; }
.kpi-label { font-size: var(--font-small-size); color: var(--color-text-tertiary); font-weight: 600; margin-bottom: var(--spacing-xs); }
.kpi-value { font-size: 28px; font-weight: 800; color: var(--color-text-primary); line-height: 1.2; }
.kpi-text { font-size: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-success { color: var(--color-success) !important; }
.text-warning { color: var(--color-warning) !important; }
.text-danger { color: var(--color-danger) !important; }

.analysis-section { display: flex; flex-direction: column; gap: var(--spacing-2xl); }
.section-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-xl); }
.section-row.full-width { grid-template-columns: 1fr; }

.chart-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-card);
  transition: all var(--transition-all);
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
}
.panel-title { font-size: var(--font-body-size); font-weight: 700; color: var(--color-text-primary); margin: 0; }
.panel-actions { display: flex; gap: var(--spacing-xs); }
.panel-body { flex: 1; padding: var(--spacing-lg); position: relative; min-height: 320px; }

.chart-wrapper { width: 100%; height: 100%; min-height: 300px; position: relative; }
.chart-content { width: 100%; height: 100%; min-height: 300px; }
.chart-empty { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }

.panel-body :deep(.data-section) {
  display: none;
}

.panel-body :deep(.analysis-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
  border: none;
}

.panel-body :deep(.chart-section) {
  flex: 1;
  min-height: 0;
  height: 100%;
  width: 100%;
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  margin: 0 !important;
}

.panel-body :deep(.chart-wrapper) {
  height: 100%;
  min-height: 100%;
}

.detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-lg); }
.detail-item { padding: var(--spacing-md); background: var(--color-bg); border-radius: var(--radius-lg); }
.detail-label { font-size: var(--font-small-size); color: var(--color-text-tertiary); margin-bottom: var(--spacing-xs); font-weight: 600; }
.detail-value { font-size: var(--font-body-size); font-weight: 700; color: var(--color-text-primary); }

.skeleton {
  background: linear-gradient(90deg, rgba(226, 232, 240, 0.3) 25%, rgba(226, 232, 240, 0.5) 50%, rgba(226, 232, 240, 0.3) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius-lg);
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 1400px) {
  .kpi-header { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 1200px) {
  .section-row { grid-template-columns: 1fr; }
  .filter-group { flex-wrap: wrap; }
}
</style>
