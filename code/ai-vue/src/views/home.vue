<!--
  云策 AI 首页
  亮点：打字机动画 + 功能卡片 + 统计展示 + 渐变背景
-->
<template>
  <div class="home">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-static">智慧对话，</span>
          <span class="title-gradient">高效生活</span>
        </h1>
        <p class="hero-subtitle">
          <span class="typing-text">{{ typedText }}</span><span class="cursor">|</span>
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" round @click="$router.push('/consultation')" v-if="isLoggedin">
            <el-icon><ChatDotRound /></el-icon> 开始对话
          </el-button>
          <el-button size="large" round @click="$router.push('/knowledge')">
            <el-icon><Reading /></el-icon> 浏览知识库
          </el-button>
          <template v-if="!isLoggedin">
            <el-button size="large" round @click="$router.push('/auth/register')" class="register-btn">
              免费注册
            </el-button>
          </template>
        </div>
      </div>
    </section>

    <!-- 功能卡片 -->
    <section class="features">
      <h2 class="section-title">核心功能</h2>
      <div class="feature-grid">
        <div class="feature-card" v-for="feat in features" :key="feat.title" @click="router.push(feat.path)">
          <div class="feat-icon" :style="{ background: feat.bg }">
            <el-icon :size="28" :color="feat.color"><component :is="feat.icon" /></el-icon>
          </div>
          <h3>{{ feat.title }}</h3>
          <p>{{ feat.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 数据展示 -->
    <section class="stats-section">
      <div class="stat-item" v-for="stat in stats" :key="stat.label">
        <span class="stat-number">{{ stat.value }}+</span>
        <span class="stat-label">{{ stat.label }}</span>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta" v-if="!isLoggedin">
      <h2>准备好开始了吗？</h2>
      <p>加入云策 AI，体验AI驱动的智能工作方式</p>
      <el-button type="primary" size="large" round @click="$router.push('/auth/register')">
        免费注册
      </el-button>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isLoggedin = ref(false)

// 打字机动画
const phrases = [
  'AI驱动的智能工作平台',
  '让每一天都更加高效从容',
  '智能对话，知识管理，一应俱全',
  '你的个人AI效率助手',
]
let phraseIndex = 0
let charIndex = 0
let isDeleting = false
let typeTimer = null
const typedText = ref('')

function typeEffect() {
  const current = phrases[phraseIndex]

  if (!isDeleting) {
    typedText.value = current.substring(0, charIndex + 1)
    charIndex++
    if (charIndex === current.length) {
      isDeleting = true
      typeTimer = setTimeout(typeEffect, 2000)
      return
    }
  } else {
    typedText.value = current.substring(0, charIndex - 1)
    charIndex--
    if (charIndex === 0) {
      isDeleting = false
      phraseIndex = (phraseIndex + 1) % phrases.length
    }
  }

  const delay = isDeleting ? 50 : 100
  typeTimer = setTimeout(typeEffect, delay)
}

// 功能卡片
const features = [
  {
    title: '智能对话',
    desc: '基于AI大模型的实时流式对话，支持Markdown渲染和语音输入',
    icon: 'ChatDotRound',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.1)',
    path: '/consultation'
  },
  {
    title: '随手记',
    desc: '快速记录日常灵感与笔记，支持Markdown格式，标签分类管理',
    icon: 'Edit',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.1)',
    path: '/emotion-diary'
  },
  {
    title: '知识库',
    desc: '丰富的知识文章库，涵盖技术、生活、效率等多个领域',
    icon: 'Reading',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.1)',
    path: '/knowledge'
  },
  {
    title: 'AI写作',
    desc: '日报、周报、邮件、总结……多模板AI写作助手，快速生成内容',
    icon: 'MagicStick',
    color: '#6366F1',
    bg: 'rgba(99, 102, 241, 0.1)',
    path: '/ai-write'
  },
  {
    title: '专注计时',
    desc: '番茄钟专注模式，环形进度动画，白噪音沉浸体验',
    icon: 'Timer',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.1)',
    path: '/focus-timer'
  },
  {
    title: '数据大屏',
    desc: '全屏数据可视化大屏，多图表联动，实时监控平台数据',
    icon: 'Monitor',
    color: '#14B8A6',
    bg: 'rgba(20, 184, 166, 0.1)',
    path: '/back/screen'
  },
]

const stats = [
  { value: '12K', label: '活跃用户' },
  { value: '46K', label: '对话会话' },
  { value: '1.8K', label: '知识文章' },
  { value: '99.9', label: '服务可用率' },
]

onMounted(() => {
  isLoggedin.value = !!localStorage.getItem('token')
  typeTimer = setTimeout(typeEffect, 500)
})

onUnmounted(() => {
  if (typeTimer) clearTimeout(typeTimer)
})
</script>

<style lang="scss" scoped>
.home {
  overflow-x: hidden;
}

/* ---- Hero ---- */
.hero {
  position: relative;
  padding: 100px 20px 80px;
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 99, 235, 0.12), transparent),
    radial-gradient(ellipse 60% 50% at 80% 80%, rgba(99, 102, 241, 0.08), transparent),
    radial-gradient(ellipse 50% 50% at 20% 80%, rgba(249, 115, 22, 0.06), transparent);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 16px;
  .title-static { color: var(--color-text-primary); }
  .title-gradient {
    background: linear-gradient(135deg, #3B82F6, #6366F1, #F97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.hero-subtitle {
  font-size: 18px;
  color: var(--color-text-secondary);
  min-height: 28px;
  margin-bottom: 32px;
  .cursor {
    animation: blink 1s step-end infinite;
    color: var(--color-primary);
  }
}

@keyframes blink {
  50% { opacity: 0; }
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;

  .register-btn {
    border-color: var(--color-accent);
    color: var(--color-accent);
    &:hover { background: var(--color-accent-bg); }
  }
}

/* ---- Features ---- */
.features {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 60px 20px;
}

.section-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
  }

  .feat-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  h3 { font-size: 17px; color: var(--color-text-primary); margin-bottom: 8px; }
  p { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; }
}

/* ---- Stats ---- */
.stats-section {
  max-width: var(--max-width);
  margin: 0 auto 60px;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  .stat-number {
    display: block;
    font-size: 36px;
    font-weight: 800;
    background: linear-gradient(135deg, #3B82F6, #6366F1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .stat-label { font-size: 14px; color: var(--color-text-secondary); }
}

/* ---- CTA ---- */
.cta {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #2563EB, #6366F1);
  color: #fff;

  h2 { font-size: 28px; margin-bottom: 8px; }
  p { margin-bottom: 24px; opacity: 0.9; }
}

@media (max-width: 768px) {
  .hero-title { font-size: 32px; }
  .feature-grid { grid-template-columns: 1fr 1fr; }
  .stats-section { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .feature-grid { grid-template-columns: 1fr; }
}
</style>
