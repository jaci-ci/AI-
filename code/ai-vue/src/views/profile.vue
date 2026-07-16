<!--
  个人中心
  技术点：数据聚合展示 + localStorage + API调用
-->
<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-avatar">
          <el-avatar :size="80" :src="userInfo.avatar || defaultAvatar">
            {{ userInfo.nickname?.charAt(0) || 'U' }}
          </el-avatar>
        </div>
        <div class="user-details">
          <h2>{{ userInfo.nickname || userInfo.username || '用户' }}</h2>
          <p class="user-email">{{ userInfo.email || '未设置邮箱' }}</p>
          <p class="user-phone" v-if="userInfo.phone">{{ userInfo.phone }}</p>
        </div>
        <div class="user-meta">
          <span class="meta-badge">注册用户</span>
        </div>
      </div>

      <!-- 数据概览 -->
      <div class="stats-overview">
        <div class="stat-card" v-for="stat in overviewStats" :key="stat.label">
          <el-icon :size="24" :color="stat.color"><component :is="stat.icon" /></el-icon>
          <span class="stat-num">{{ stat.value }}</span>
          <span class="stat-lbl">{{ stat.label }}</span>
        </div>
      </div>

      <!-- 功能入口 -->
      <div class="feature-grid">
        <div class="feature-card" v-for="item in features" :key="item.path" @click="$router.push(item.path)">
          <div class="feature-icon" :style="{ background: item.bg }">
            <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
          </div>
          <div class="feature-info">
            <span class="feature-name">{{ item.label }}</span>
            <span class="feature-desc">{{ item.desc }}</span>
          </div>
          <el-icon class="feature-arrow"><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- 账号信息 -->
      <div class="account-section">
        <h3>账号信息</h3>
        <div class="info-list">
          <div class="info-row">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ userInfo.username || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">昵称</span>
            <span class="info-value">{{ userInfo.nickname || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ userInfo.email || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ userInfo.phone || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">注册时间</span>
            <span class="info-value">{{ userInfo.createTime || '-' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTitle } from '../composables/useTitle'

useTitle('个人中心')

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

const userInfo = ref({})

// 概览统计
const overviewStats = ref([
  { label: '笔记', value: 0, icon: 'Edit', color: '#3B82F6' },
  { label: '对话', value: 0, icon: 'ChatDotRound', color: '#10B981' },
  { label: '专注分钟', value: 0, icon: 'Timer', color: '#F59E0B' },
  { label: '阅读文章', value: 0, icon: 'Reading', color: '#6366F1' },
])

// 功能入口
const features = [
  { label: '智能对话', desc: '与AI进行对话交流', icon: 'ChatDotRound', path: '/consultation', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  { label: '随手记', desc: '记录日常笔记', icon: 'Edit', path: '/emotion-diary', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  { label: 'AI写作', desc: 'AI辅助写作生成', icon: 'MagicStick', path: '/ai-write', color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  { label: '专注计时', desc: '番茄钟专注模式', icon: 'Timer', path: '/focus-timer', color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  { label: '知识库', desc: '浏览知识文章', icon: 'Reading', path: '/knowledge', color: '#14B8A6', bg: 'rgba(20,184,166,0.1)' },
]

onMounted(() => {
  // 读取用户信息
  const stored = localStorage.getItem('userInfo')
  if (stored) {
    try { userInfo.value = JSON.parse(stored) } catch {}
  }

  // 读取统计
  const focusStats = JSON.parse(localStorage.getItem('zhiyu-focus-stats') || '{}')
  const today = new Date().toDateString()
  if (focusStats.date === today) {
    overviewStats.value[2].value = Math.floor(focusStats.minutes || 0)
  }
})
</script>

<style lang="scss" scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 用户卡片 */
.user-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 24px;

  .user-details {
    flex: 1;
    h2 { font-size: 22px; color: var(--color-text-primary); }
    .user-email { color: var(--color-text-secondary); font-size: 14px; margin-top: 4px; }
    .user-phone { color: var(--color-text-placeholder); font-size: 13px; }
  }

  .user-meta .meta-badge {
    padding: 4px 12px;
    background: var(--color-primary-bg);
    color: var(--color-primary);
    border-radius: var(--radius-full);
    font-size: 12px;
  }
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: 20px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .stat-num {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .stat-lbl {
    font-size: 13px;
    color: var(--color-text-secondary);
  }
}

/* 功能入口 */
.feature-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: translateX(4px);
  }

  .feature-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .feature-info {
    flex: 1;
    .feature-name { font-size: 15px; color: var(--color-text-primary); font-weight: 500; display: block; }
    .feature-desc { font-size: 13px; color: var(--color-text-secondary); }
  }

  .feature-arrow { color: var(--color-text-placeholder); }
}

/* 账号信息 */
.account-section {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid var(--color-border);

  h3 { font-size: 16px; color: var(--color-text-primary); margin-bottom: 16px; }
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);

  &:last-child { border-bottom: none; }

  .info-label { color: var(--color-text-secondary); font-size: 14px; }
  .info-value { color: var(--color-text-primary); font-size: 14px; }
}

@media (max-width: 640px) {
  .stats-overview { grid-template-columns: repeat(2, 1fr); }
  .user-card { flex-direction: column; text-align: center; }
}
</style>
