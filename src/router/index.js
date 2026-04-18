import { createRouter, createWebHashHistory } from 'vue-router'
// 导入所有页面组件
import Dashboard from '@/views/Dashboard.vue' // 可视化大屏展示
import PollutantAnalysis from '@/views/PollutantAnalysis.vue' // 污染物的分析
import OutlierAnalysis from '@/views/OutlierAnalysis.vue' // 异常值的分析
import SafetyAnalysis from '@/views/SafetyAnalysis.vue' // 安全性的分析
import RatioAnalysis from '@/views/RatioAnalysis.vue' // 比例的分析
import RulesAnalysis from '@/views/RulesAnalysis.vue' // 关联规则的分析
import FindRules from '@/views/FindRules.vue' // 查找规则

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '可视化大屏展示' }
  },
  {
    path: '/analysis/pollutant',
    name: 'PollutantAnalysis',
    component: PollutantAnalysis,
    meta: { title: '污染物的分析' }
  },
  {
    path: '/analysis/outlier',
    name: 'OutlierAnalysis',
    component: OutlierAnalysis,
    meta: { title: '异常值的分析' }
  },
  {
    path: '/analysis/safety',
    name: 'SafetyAnalysis',
    component: SafetyAnalysis,
    meta: { title: '安全性的分析' }
  },
  {
    path: '/analysis/ratio',
    name: 'RatioAnalysis',
    component: RatioAnalysis,
    meta: { title: '比例的分析' }
  },
  {
    path: '/analysis/rules',
    name: 'RulesAnalysis',
    component: RulesAnalysis,
    meta: { title: '关联规则的分析' }
  },
  {
    path: '/analysis/find-rules',
    name: 'FindRules',
    component: FindRules,
    meta: { title: '查找规则' }
  }  
]

const router = createRouter({
  history: createWebHashHistory(), // 哈希路由
  routes,
  scrollBehavior: () => ({ top: 0 }) // 路由切换时回到顶部
})

// 全局后置钩子：修改页面标题
router.afterEach((to) => {
  document.title = to.meta.title || '水质污染物数据分析平台'
})

export default router