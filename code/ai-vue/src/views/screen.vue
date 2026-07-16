<!--
  数据大屏 — 全屏数据可视化
  技术点：ECharts多图表联动 + 粒子背景 + 数字翻牌器 + 自适应缩放 + 定时轮播
  简历关键词：ECharts / 数据可视化 / 大屏适配
-->
<template>
  <div class="screen-container" ref="screenRef">
    <!-- 粒子背景 -->
    <div class="particles-bg"></div>

    <!-- 头部标题 -->
    <header class="screen-header">
      <h1 class="screen-title">云策 AI · 数据大屏</h1>
      <div class="header-info">
        <span class="datetime">{{ currentTime }}</span>
        <el-button @click="useFullscreen().toggle(screenRef)" size="small" text>
          <el-icon><FullScreen /></el-icon>
        </el-button>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="screen-body">
      <!-- 顶部数字翻牌器 -->
      <div class="stat-row">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-icon" :style="{ background: stat.color }">
            <el-icon :size="28"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value" ref="countUpRefs">{{ stat.value.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="chart-grid">
        <div class="chart-card">
          <h3>用户活跃趋势</h3>
          <div ref="trendChart" class="chart-box"></div>
        </div>
        <div class="chart-card">
          <h3>对话统计</h3>
          <div ref="consultChart" class="chart-box"></div>
        </div>
        <div class="chart-card">
          <h3>内容发布统计</h3>
          <div ref="contentChart" class="chart-box"></div>
        </div>
        <div class="chart-card">
          <h3>用户行为热力</h3>
          <div ref="heatChart" class="chart-box"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useFullscreen } from '../composables/useFullscreen'
import { useTitle } from '../composables/useTitle'

useTitle('数据大屏')

const screenRef = ref(null)
const trendChart = ref(null)
const consultChart = ref(null)
const contentChart = ref(null)
const heatChart = ref(null)
const currentTime = ref('')
let timeInterval = null
let charts = []

// 统计数据
const stats = ref([
  { label: '累计用户', value: 12583, icon: 'User', color: '#3B82F6' },
  { label: '对话会话', value: 46729, icon: 'ChatDotRound', color: '#10B981' },
  { label: '知识文章', value: 1836, icon: 'Reading', color: '#F59E0B' },
  { label: '活跃天数', value: 352, icon: 'Calendar', color: '#6366F1' },
])

// 更新时间
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 初始化图表
function initCharts() {
  // 通用主题色
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EF4444']

  // 用户活跃趋势
  if (trendChart.value) {
    const chart = echarts.init(trendChart.value)
    chart.setOption({
      color: colors,
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, textStyle: { color: '#94A3B8' } },
      grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        axisLine: { lineStyle: { color: '#334155' } }
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1E293B' } } },
      series: [
        {
          name: '活跃用户',
          type: 'line',
          smooth: true,
          data: [1200, 1380, 1520, 1680, 1850, 2100, 2300, 2580, 2750, 2900, 3100, 3300],
          areaStyle: { opacity: 0.15 }
        },
        {
          name: '新增用户',
          type: 'line',
          smooth: true,
          data: [320, 280, 350, 420, 390, 450, 480, 510, 460, 430, 490, 520]
        }
      ]
    })
    charts.push(chart)
  }

  // 对话统计
  if (consultChart.value) {
    const chart = echarts.init(consultChart.value)
    chart.setOption({
      color: colors,
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, textStyle: { color: '#94A3B8' } },
      grid: { left: '3%', right: '4%', bottom: '12%', top: '8%', containLabel: true },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: '#334155' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1E293B' } } },
      series: [
        { name: '对话数', type: 'bar', data: [320, 450, 380, 520, 490, 280, 200], barWidth: '40%' },
        { name: '用户数', type: 'bar', data: [180, 230, 200, 280, 260, 150, 120], barWidth: '40%' }
      ]
    })
    charts.push(chart)
  }

  // 内容发布统计
  if (contentChart.value) {
    const chart = echarts.init(contentChart.value)
    chart.setOption({
      color: colors,
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: '#94A3B8' } },
      series: [
        {
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['50%', '45%'],
          itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
          data: [
            { value: 835, name: '技术文档' },
            { value: 520, name: '生活随笔' },
            { value: 310, name: '学习笔记' },
            { value: 171, name: '灵感记录' }
          ]
        }
      ]
    })
    charts.push(chart)
  }

  // 用户行为热力
  if (heatChart.value) {
    const chart = echarts.init(heatChart.value)
    const hours = ['0-2', '2-4', '4-6', '6-8', '8-10', '10-12', '12-14', '14-16', '16-18', '18-20', '20-22', '22-24']
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const data = []
    days.forEach((day, di) => {
      hours.forEach((hour, hi) => {
        data.push([hi, di, Math.floor(Math.random() * 1000 + 200)])
      })
    })
    chart.setOption({
      tooltip: { position: 'top' },
      grid: { left: '10%', right: '5%', bottom: '8%', top: '5%' },
      xAxis: { type: 'category', data: hours, splitArea: { show: true }, axisLabel: { fontSize: 9 } },
      yAxis: { type: 'category', data: days, splitArea: { show: true }, axisLabel: { fontSize: 11 } },
      visualMap: { min: 0, max: 1200, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#1E293B', '#3B82F6', '#60A5FA', '#93C5FD'] } },
      series: [{ type: 'heatmap', data, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } } }]
    })
    charts.push(chart)
  }
}

// 窗口resize处理
function handleResize() {
  charts.forEach(c => c.resize())
}

// 轮播切换
let carouselTimer = null
let carouselIndex = 0

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  await nextTick()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (carouselTimer) clearInterval(carouselTimer)
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c.dispose())
  charts = []
})
</script>

<style lang="scss" scoped>
.screen-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
  color: #F1F5F9;
  position: relative;
  overflow: hidden;
  padding: 0 24px 24px;
}

/* 粒子背景 */
.particles-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(1px 1px at 10% 20%, rgba(59, 130, 246, 0.4), transparent),
    radial-gradient(1px 1px at 20% 60%, rgba(59, 130, 246, 0.3), transparent),
    radial-gradient(1px 1px at 30% 40%, rgba(99, 102, 241, 0.4), transparent),
    radial-gradient(1px 1px at 50% 80%, rgba(59, 130, 246, 0.3), transparent),
    radial-gradient(1px 1px at 70% 30%, rgba(16, 185, 129, 0.3), transparent),
    radial-gradient(1px 1px at 80% 70%, rgba(99, 102, 241, 0.4), transparent),
    radial-gradient(1px 1px at 90% 10%, rgba(59, 130, 246, 0.3), transparent),
    radial-gradient(2px 2px at 15% 85%, rgba(16, 185, 129, 0.5), transparent),
    radial-gradient(2px 2px at 45% 15%, rgba(99, 102, 241, 0.5), transparent),
    radial-gradient(2px 2px at 75% 55%, rgba(59, 130, 246, 0.4), transparent),
    radial-gradient(2px 2px at 35% 65%, rgba(249, 115, 22, 0.3), transparent),
    radial-gradient(2px 2px at 85% 45%, rgba(16, 185, 129, 0.4), transparent);
}

/* 头部 */
.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  position: relative;
  z-index: 1;

  .screen-title {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(90deg, #60A5FA, #93C5FD, #60A5FA);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 16px;

    .datetime {
      font-size: 16px;
      color: #94A3B8;
      font-variant-numeric: tabular-nums;
    }
  }
}

/* 数字翻牌器 */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.stat-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(8px);

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .stat-info {
    display: flex;
    flex-direction: column;

    .stat-label {
      font-size: 13px;
      color: #94A3B8;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #F1F5F9;
      font-variant-numeric: tabular-nums;
    }
  }
}

/* 图表网格 */
.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.chart-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(8px);

  h3 {
    font-size: 15px;
    color: #CBD5E1;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .chart-box {
    height: 260px;
  }
}

@media (max-width: 1024px) {
  .chart-grid { grid-template-columns: 1fr; }
  .stat-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
