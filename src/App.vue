<template>
  <div class="app-container">
    <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo-area">
          <div class="logo-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L12 6M12 6C9.5 6 7.5 8 7.5 10.5C7.5 14 12 18 12 18M12 6C14.5 6 16.5 8 16.5 10.5C16.5 14 12 18 12 18M12 18V22M8 22H16M9 22H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <transition name="fade">
            <span v-if="!isSidebarCollapsed" class="logo-text">水质监测</span>
          </transition>
        </div>
      </div>

      <nav class="nav-menu">
        <div class="nav-section">
          <transition name="fade">
            <div class="nav-section-title" v-if="!isSidebarCollapsed">主导航</div>
          </transition>
          <router-link
            to="/"
            class="nav-item"
            :class="{ active: currentPath === '/' }"
          >
            <div class="nav-indicator" v-if="currentPath === '/'"></div>
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span class="nav-text" v-if="!isSidebarCollapsed">可视化大屏</span>
          </router-link>
        </div>

        <div class="nav-section">
          <transition name="fade">
            <div class="nav-section-title" v-if="!isSidebarCollapsed">数据分析</div>
          </transition>
          <router-link
            to="/analysis/pollutant"
            class="nav-item"
            :class="{ active: currentPath === '/analysis/pollutant' }"
          >
            <div class="nav-indicator" v-if="currentPath === '/analysis/pollutant'"></div>
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 20V10M12 20V4M6 20V14"/>
            </svg>
            <span class="nav-text" v-if="!isSidebarCollapsed">污染物分布</span>
          </router-link>
          <router-link
            to="/analysis/outlier"
            class="nav-item"
            :class="{ active: currentPath === '/analysis/outlier' }"
          >
            <div class="nav-indicator" v-if="currentPath === '/analysis/outlier'"></div>
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span class="nav-text" v-if="!isSidebarCollapsed">异常值分析</span>
          </router-link>
          <router-link
            to="/analysis/safety"
            class="nav-item"
            :class="{ active: currentPath === '/analysis/safety' }"
          >
            <div class="nav-indicator" v-if="currentPath === '/analysis/safety'"></div>
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
            <span class="nav-text" v-if="!isSidebarCollapsed">安全性分析</span>
          </router-link>
          <router-link
            to="/analysis/ratio"
            class="nav-item"
            :class="{ active: currentPath === '/analysis/ratio' }"
          >
            <div class="nav-indicator" v-if="currentPath === '/analysis/ratio'"></div>
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span class="nav-text" v-if="!isSidebarCollapsed">比例分析</span>
          </router-link>
          <router-link
            to="/analysis/rules"
            class="nav-item"
            :class="{ active: currentPath === '/analysis/rules' }"
          >
            <div class="nav-indicator" v-if="currentPath === '/analysis/rules'"></div>
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
            </svg>
            <span class="nav-text" v-if="!isSidebarCollapsed">关联规则分析</span>
          </router-link>
          <router-link
            to="/analysis/find-rules"
            class="nav-item"
            :class="{ active: currentPath === '/analysis/find-rules' }"
          >
            <div class="nav-indicator" v-if="currentPath === '/analysis/find-rules'"></div>
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span class="nav-text" v-if="!isSidebarCollapsed">规则查询</span>
          </router-link>
        </div>
      </nav>

      <div class="sidebar-footer" v-if="!isSidebarCollapsed">
        <div class="time-display">
          <div class="time-label">当前时间</div>
          <div class="time-value">{{ currentTime }}</div>
        </div>
      </div>
    </aside>

    <main class="main-wrapper">
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">水质污染物数据分析平台</h1>
          <p class="page-subtitle">Real-time Environmental Intelligence</p>
        </div>
        <div class="header-right">
          <div class="header-actions">
            <div class="action-btn" @click="handleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏显示'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path v-if="!isFullscreen" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                <path v-else d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/>
              </svg>
            </div>
            <div class="action-btn" @click="exportData" title="导出数据">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </div>
          </div>
          <div class="user-info">
            <div class="user-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="user-details">
              <span class="user-name">Admin</span>
              <span class="user-role">管理员</span>
            </div>
          </div>
        </div>
      </header>

      <div class="main-content custom-scrollbar">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isSidebarCollapsed = ref(false);
const isFullscreen = ref(false);
const currentTime = ref('');

const currentPath = computed(() => route.path);

function updateTime() {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
}

function handleFullscreen() {
  toggleFullscreen();
}

function exportData() {
  console.log('Export data triggered');
}

let timeInterval;

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);

  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

watch(
  () => route.path,
  (newPath) => {
    console.log('Route changed to:', newPath);
  }
);
</script>

<style scoped>
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ==================== 侧边导航栏 - 玻璃拟态风格 ==================== */
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-all);
  flex-shrink: 0;
  z-index: 50;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
  height: var(--header-height);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  overflow: hidden;
}

.logo-icon-wrapper {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.logo-text {
  font-size: var(--font-h3-size);
  font-weight: 800;
  color: var(--color-text-primary);
  white-space: nowrap;
  letter-spacing: -0.5px;
}

/* ==================== 导航菜单 ==================== */
.nav-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.nav-section {
  margin-bottom: var(--spacing-xl);
}

.nav-section-title {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-sm);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-all);
  border-radius: var(--radius-xl);
  cursor: pointer;
  position: relative;
  margin-bottom: var(--spacing-xs);
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.06);
  color: var(--color-text-primary);
}

.nav-item:hover .nav-icon {
  color: var(--color-primary);
}

.nav-item.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.nav-item.active .nav-icon {
  color: var(--color-primary);
}

.nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--color-primary);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.nav-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  transition: all var(--transition-all);
}

.nav-text {
  font-size: var(--font-body-size);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0.8;
  transition: opacity var(--transition-all);
}

.nav-item:hover .nav-text,
.nav-item.active .nav-text {
  opacity: 1;
}

/* ==================== 侧边栏底部 ==================== */
.sidebar-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
}

.time-display {
  text-align: center;
}

.time-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-xs);
}

.time-value {
  font-size: var(--font-small-size);
  font-weight: 600;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* ==================== 主内容区域 ==================== */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  position: relative;
}

/* ==================== 顶部导航栏 - 玻璃拟态风格 ==================== */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-2xl);
  height: var(--header-height);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  z-index: 40;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.page-title {
  font-size: var(--font-h2-size);
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.action-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-all);
  color: var(--color-text-secondary);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-left: var(--spacing-xl);
  border-left: 1px solid var(--color-border-light);
}

.user-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: var(--font-body-size);
  font-weight: 700;
  color: var(--color-text-primary);
}

.user-role {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
}

/* ==================== 主内容区 ==================== */
.main-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-2xl);
}

/* ==================== 过渡动画 ==================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ==================== 响应式适配 ==================== */
@media (max-width: 1280px) {
  .sidebar {
    width: 80px;
  }

  .sidebar .nav-text,
  .sidebar .nav-section-title,
  .sidebar .logo-text,
  .sidebar .sidebar-footer {
    display: none;
  }

  .sidebar .nav-item {
    justify-content: center;
    padding: var(--spacing-md);
  }

  .sidebar .nav-indicator {
    display: none;
  }
}
</style>
