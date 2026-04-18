<template>
  <div class="analysis-container">
    <div class="search-section">
      <div class="search-header">
        <h3 class="section-title">条件查询</h3>
      </div>
      <div class="search-form">
        <div class="form-row">
          <div class="form-item">
            <label class="form-label">前件条件</label>
            <el-input
              v-model="formData.antecedent"
              placeholder="请输入前件条件，如: viruses"
              clearable
              class="form-input"
            />
          </div>
          <div class="form-item">
            <label class="form-label">后件条件</label>
            <el-input
              v-model="formData.consequent"
              placeholder="请输入后件条件"
              clearable
              class="form-input"
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-item">
            <label class="form-label">最小置信度</label>
            <el-input-number
              v-model="formData.minConfidence"
              :min="0"
              :max="1"
              :step="0.01"
              :precision="2"
              controls-position="right"
              class="form-number"
            />
          </div>
          <div class="form-item">
            <label class="form-label">最小支持度</label>
            <el-input-number
              v-model="formData.minSupport"
              :min="0"
              :max="1"
              :step="0.01"
              :precision="2"
              controls-position="right"
              class="form-number"
            />
          </div>
          <div class="form-item">
            <label class="form-label">最小提升度</label>
            <el-input-number
              v-model="formData.minLift"
              :min="0"
              :max="10"
              :step="0.1"
              :precision="2"
              controls-position="right"
              class="form-number"
            />
          </div>
        </div>
        <div class="form-actions">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
        </div>
      </div>
    </div>

    <div class="result-section">
      <div class="result-header">
        <h3 class="section-title">查询结果</h3>
        <div class="result-actions">
          <div class="result-count" v-if="filteredData.length > 0">
            共找到 <span class="count">{{ filteredData.length }}</span> 条规则
          </div>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索结果..."
            clearable
            class="search-input"
            v-if="resultData.length > 0"
          >
            <template #prefix>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </template>
          </el-input>
        </div>
      </div>

      <div class="result-table-wrapper" v-if="filteredData.length > 0">
        <table class="result-table">
          <thead>
            <tr>
              <th @click="handleSort('antecedents')" class="sortable">
                前件 (Antecedent)
                <span class="sort-icon" v-if="sortField === 'antecedents'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="handleSort('consequents')" class="sortable">
                后件 (Consequent)
                <span class="sort-icon" v-if="sortField === 'consequents'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="handleSort('support')" class="numeric sortable">
                支持度
                <span class="sort-icon" v-if="sortField === 'support'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="handleSort('confidence')" class="numeric sortable">
                置信度
                <span class="sort-icon" v-if="sortField === 'confidence'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="handleSort('lift')" class="numeric sortable">
                提升度
                <span class="sort-icon" v-if="sortField === 'lift'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rule, index) in paginatedData" :key="index">
              <td>{{ rule.antecedents || 'N/A' }}</td>
              <td>{{ rule.consequents || 'N/A' }}</td>
              <td class="numeric">{{ rule.support?.toFixed(4) || 'N/A' }}</td>
              <td class="numeric">{{ rule.confidence?.toFixed(4) || 'N/A' }}</td>
              <td class="numeric" :class="getLiftClass(rule.lift)">{{ rule.lift?.toFixed(4) || 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-wrapper" v-if="filteredData.length > pageSize">
        <div class="pagination-info">
          显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredData.length) }} 条，共 {{ filteredData.length }} 条
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredData.length"
          layout="prev, pager, next"
          background
        />
      </div>

      <div class="empty-state" v-else-if="!loading && resultData.length === 0">
        <el-empty :description="emptyDescription" :image-size="80" />
      </div>

      <div class="loading-state" v-if="loading">
        <div class="loading-spinner"></div>
        <span>查询中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import staticData from '@/services/staticData';

const loading = ref(false);
const resultData = ref([]);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const sortField = ref('');
const sortOrder = ref('desc');

const formData = reactive({
  antecedent: '',
  consequent: '',
  minConfidence: 0.5,
  minSupport: 0.01,
  minLift: 1.0
});

const emptyDescription = computed(() => {
  return searchKeyword.value ? '没有找到匹配的结果' : '请设置查询条件后点击查询按钮';
});

function getLiftClass(lift) {
  if (!lift) return '';
  if (lift > 1.4) return 'lift-high';
  if (lift > 1.2) return 'lift-medium';
  return '';
}

const filteredData = computed(() => {
  let data = [...resultData.value];

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    data = data.filter(item =>
      (item.antecedents && item.antecedents.toLowerCase().includes(keyword)) ||
      (item.consequents && item.consequents.toLowerCase().includes(keyword))
    );
  }

  if (sortField.value) {
    data.sort((a, b) => {
      const aVal = a[sortField.value];
      const bVal = b[sortField.value];
      if (typeof aVal === 'string') {
        return sortOrder.value === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  return data;
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

function handleSort(field) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'desc';
  }
  currentPage.value = 1;
}

function handleReset() {
  formData.antecedent = '';
  formData.consequent = '';
  formData.minConfidence = 0.5;
  formData.minSupport = 0.01;
  formData.minLift = 1.0;
  resultData.value = [];
  searchKeyword.value = '';
  sortField.value = '';
  sortOrder.value = 'desc';
  currentPage.value = 1;
}

async function handleSearch() {
  try {
    loading.value = true;
    currentPage.value = 1;
    sortField.value = '';

    const result = await staticData.searchRules({
      antecedents: formData.antecedent,
      consequents: formData.consequent,
      minConfidence: formData.minConfidence,
      minSupport: formData.minSupport,
      minLift: formData.minLift
    });

    resultData.value = result.filter(item => item && item.confidence);

    loading.value = false;

    if (resultData.value.length === 0) {
      ElMessage.info('未找到符合条件的规则');
    } else {
      ElMessage.success(`找到 ${resultData.value.length} 条规则`);
    }

  } catch (error) {
    console.error('查询失败:', error);
    loading.value = false;
    ElMessage.error('查询失败，请检查数据');
  }
}

onMounted(() => {
});

onUnmounted(() => {
});
</script>

<style scoped>
.analysis-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  overflow: auto;
}

.search-section {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  flex-shrink: 0;
}

.search-header {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.section-title {
  font-size: var(--font-body-size);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.search-form {
  padding: var(--spacing-xl);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  font-size: var(--font-small-size);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.form-input {
  width: 100%;
}

.form-number {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
}

.result-section {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  flex: 1;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.result-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.result-count {
  font-size: var(--font-small-size);
  color: var(--color-text-secondary);
}

.result-count .count {
  color: var(--color-primary);
  font-weight: 700;
}

.search-input {
  width: 200px;
}

.result-table-wrapper {
  flex: 1;
  overflow: auto;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-body-size);
}

.result-table th,
.result-table td {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}

.result-table th {
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(248, 250, 252, 0.8);
  position: sticky;
  top: 0;
  z-index: 1;
  user-select: none;
}

.result-table th.sortable {
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.result-table th.sortable:hover {
  background: rgba(99, 102, 241, 0.08);
}

.sort-icon {
  margin-left: var(--spacing-xs);
  color: var(--color-primary);
}

.result-table td {
  color: var(--color-text-primary);
}

.result-table tbody tr:hover {
  background: rgba(248, 250, 252, 0.5);
}

.result-table .numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

.result-table .lift-high {
  color: var(--color-secondary);
  font-weight: 600;
}

.result-table .lift-medium {
  color: var(--color-primary);
  font-weight: 500;
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
}

.pagination-info {
  font-size: var(--font-small-size);
  color: var(--color-text-secondary);
}

.empty-state,
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-tertiary);
  gap: var(--spacing-md);
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

@media (max-width: 1200px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-actions {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    width: 100%;
  }
}
</style>
