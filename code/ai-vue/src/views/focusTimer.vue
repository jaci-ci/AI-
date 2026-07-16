<!--
  番茄专注计时器
  技术点：SVG环形进度动画 + Notification API + Web Audio API白噪音 + localStorage统计
  简历关键词：Canvas/SVG动画 / Notification API / Web Audio
-->
<template>
  <div class="timer-page">
    <div class="timer-container">
      <h2 class="page-title">专注计时器</h2>

      <!-- 模式选择 -->
      <div class="mode-selector">
        <button
          v-for="mode in modes"
          :key="mode.id"
          class="mode-btn"
          :class="{ active: currentMode === mode.id }"
          @click="switchMode(mode.id)"
        >
          <el-icon><component :is="mode.icon" /></el-icon>
          <span>{{ mode.label }}</span>
          <small>{{ mode.duration }}分钟</small>
        </button>
      </div>

      <!-- 环形进度条 -->
      <div class="progress-ring">
        <svg viewBox="0 0 200 200" class="ring-svg">
          <!-- 背景环 -->
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-border)" stroke-width="8" />
          <!-- 进度环 -->
          <circle
            cx="100" cy="100" r="90"
            fill="none"
            :stroke="progressColor"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
            class="progress-circle"
            transform="rotate(-90, 100, 100)"
          />
        </svg>
        <div class="ring-content">
          <span class="time-display">{{ formatTime(timeLeft) }}</span>
          <span class="state-label">{{ isRunning ? '专注中' : isPaused ? '已暂停' : '准备开始' }}</span>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <el-button
          v-if="!isRunning && !isPaused"
          type="primary"
          size="large"
          @click="startTimer"
          :icon="null"
          round
        >
          <el-icon><VideoPlay /></el-icon>&nbsp;开始专注
        </el-button>
        <template v-else>
          <el-button @click="pauseTimer" round>
            <el-icon>{{ isPaused ? 'VideoPlay' : 'VideoPause' }}</el-icon>&nbsp;{{ isPaused ? '继续' : '暂停' }}
          </el-button>
          <el-button type="danger" @click="resetTimer" round>
            <el-icon><Close /></el-icon>&nbsp;结束
          </el-button>
        </template>
      </div>

      <!-- 白噪音选择 -->
      <div class="ambient-sound">
        <span class="sound-label">白噪音</span>
        <div class="sound-options">
          <button
            v-for="sound in sounds"
            :key="sound.id"
            class="sound-btn"
            :class="{ active: currentSound === sound.id }"
            @click="toggleSound(sound.id)"
          >
            <el-icon><component :is="sound.icon" /></el-icon>
            <span>{{ sound.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 今日统计 -->
    <div class="stats-panel">
      <h3>今日统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-num">{{ todaySessions }}</span>
          <span class="stat-lbl">完成次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ Math.floor(todayMinutes) }}</span>
          <span class="stat-lbl">专注分钟</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ todayStreak }}</span>
          <span class="stat-lbl">连续天数</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useTitle } from '../composables/useTitle'

useTitle('专注计时器')

const modes = [
  { id: 'pomodoro', label: '番茄钟', duration: 25, icon: 'Timer' },
  { id: 'shortBreak', label: '短休息', duration: 5, icon: 'Coffee' },
  { id: 'longBreak', label: '长休息', duration: 15, icon: 'Sunny' },
]

const sounds = [
  { id: 'rain', label: '雨声', icon: 'Cloudy' },
  { id: 'cafe', label: '咖啡馆', icon: 'Coffee' },
  { id: 'forest', label: '森林', icon: 'Sunny' },
  { id: 'none', label: '无', icon: 'Mute' },
]

// SVG 环形参数
const circumference = 2 * Math.PI * 90 // ~565.49

// 状态
const currentMode = ref('pomodoro')
const timeLeft = ref(25 * 60)
const totalSeconds = ref(25 * 60)
const isRunning = ref(false)
const isPaused = ref(false)
const currentSound = ref('none')
let timerInterval = null
let audioCtx = null
let noiseNode = null

// 统计 (localStorage)
const todaySessions = ref(0)
const todayMinutes = ref(0)
const todayStreak = ref(0)

// 进度颜色
const progressColor = computed(() => {
  const ratio = timeLeft.value / totalSeconds.value
  if (ratio > 0.5) return '#3B82F6'
  if (ratio > 0.2) return '#F59E0B'
  return '#EF4444'
})

// 进度偏移
const progressOffset = computed(() => {
  const ratio = timeLeft.value / totalSeconds.value
  return circumference * (1 - ratio)
})

// 格式化时间
function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// 切换模式
function switchMode(modeId) {
  if (isRunning.value || isPaused.value) {
    if (!confirm('切换模式将重置当前计时，确定吗？')) return
  }
  const mode = modes.find(m => m.id === modeId)
  if (!mode) return
  currentMode.value = modeId
  timeLeft.value = mode.duration * 60
  totalSeconds.value = mode.duration * 60
  isRunning.value = false
  isPaused.value = false
  clearInterval(timerInterval)
}

// 开始计时
function startTimer() {
  if (isRunning.value) return
  isRunning.value = true
  isPaused.value = false

  // 请求通知权限
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }

  timerInterval = setInterval(() => {
    if (!isRunning.value) return

    timeLeft.value--
    if (timeLeft.value <= 0) {
      completeTimer()
    }
  }, 1000)
}

// 暂停
function pauseTimer() {
  if (isPaused.value) {
    isRunning.value = true
    isPaused.value = false
  } else {
    isRunning.value = false
    isPaused.value = true
  }
}

// 重置
function resetTimer() {
  isRunning.value = false
  isPaused.value = false
  const mode = modes.find(m => m.id === currentMode.value)
  timeLeft.value = mode.duration * 60
  totalSeconds.value = mode.duration * 60
  clearInterval(timerInterval)
  stopNoise()
}

// 完成
function completeTimer() {
  clearInterval(timerInterval)
  isRunning.value = false

  // 桌面通知
  if (Notification.permission === 'granted') {
    const labels = { pomodoro: '番茄钟', shortBreak: '短休息', longBreak: '长休息' }
    new Notification('云策 AI · 专注计时器', {
      body: `${labels[currentMode.value]}完成了！`,
      icon: '/favicon.svg'
    })
  }

  // 记录统计
  const today = new Date().toDateString()
  const stats = JSON.parse(localStorage.getItem('zhiyu-focus-stats') || '{}')
  if (stats.date !== today) {
    stats.date = today
    stats.sessions = 0
    stats.minutes = 0
  }
  const duration = modes.find(m => m.id === currentMode.value).duration
  stats.sessions = (stats.sessions || 0) + 1
  stats.minutes = (stats.minutes || 0) + duration

  // 连续天数
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  stats.lastActive = today
  if (stats.prevDate === yesterday) {
    stats.streak = (stats.streak || 0) + 1
  } else if (stats.prevDate !== today) {
    stats.streak = 1
  }
  stats.prevDate = today
  localStorage.setItem('zhiyu-focus-stats', JSON.stringify(stats))

  loadStats()
  resetTimer()
}

// 加载统计
function loadStats() {
  const stats = JSON.parse(localStorage.getItem('zhiyu-focus-stats') || '{}')
  const today = new Date().toDateString()
  if (stats.date === today) {
    todaySessions.value = stats.sessions || 0
    todayMinutes.value = stats.minutes || 0
  } else {
    todaySessions.value = 0
    todayMinutes.value = 0
  }
  todayStreak.value = stats.streak || 0
}

// 白噪音
function toggleSound(soundId) {
  if (currentSound.value === soundId || soundId === 'none') {
    stopNoise()
    currentSound.value = 'none'
    return
  }
  currentSound.value = soundId
  playNoise(soundId)
}

function playNoise(type) {
  stopNoise()
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const bufferSize = 2 * audioCtx.sampleRate
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      if (type === 'rain') {
        data[i] = Math.random() * 2 - 1
        // 雨声：不规则的噼啪声
        if (Math.random() > 0.3) data[i] *= 0.1
      } else if (type === 'cafe') {
        // 咖啡馆：低频环境噪音
        data[i] = (Math.random() * 2 - 1) * 0.15
      } else if (type === 'forest') {
        // 森林：柔和的白噪音 + 低频
        data[i] = (Math.random() * 2 - 1) * 0.12
      }
    }

    noiseNode = audioCtx.createBufferSource()
    noiseNode.buffer = buffer
    noiseNode.loop = true

    const gainNode = audioCtx.createGain()
    gainNode.gain.value = 0.3

    // 低通滤波让声音更柔和
    const filter = audioCtx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = type === 'rain' ? 8000 : 3000

    noiseNode.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    noiseNode.start()
  } catch (e) {
    console.warn('Web Audio API 不支持:', e)
  }
}

function stopNoise() {
  if (noiseNode) {
    try { noiseNode.stop() } catch {}
    noiseNode = null
  }
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
  }
}

onMounted(() => {
  loadStats()
})

onUnmounted(() => {
  clearInterval(timerInterval)
  stopNoise()
})
</script>

<style lang="scss" scoped>
.timer-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.timer-container {
  flex: 1;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid var(--color-border);
  text-align: center;
}

.page-title {
  font-size: 24px;
  color: var(--color-text-primary);
  margin-bottom: 24px;
}

/* 模式选择 */
.mode-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  justify-content: center;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-regular);
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }

  &:hover {
    border-color: var(--color-primary-light);
  }

  small {
    font-size: 11px;
    color: var(--color-text-secondary);
  }
}

/* 环形进度 */
.progress-ring {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto 32px;
}

.ring-svg {
  width: 100%;
  height: 100%;
}

.progress-circle {
  transition: stroke-dashoffset 1s linear, stroke 0.5s;
}

.ring-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.time-display {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.state-label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 8px;
}

/* 控制按钮 */
.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

/* 白噪音 */
.ambient-sound {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;

  .sound-label {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
    display: block;
  }

  .sound-options {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .sound-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text-regular);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;

    &.active {
      border-color: var(--color-accent);
      background: var(--color-accent-bg);
      color: var(--color-accent);
    }

    &:hover {
      border-color: var(--color-border-hover);
    }
  }
}

/* 统计面板 */
.stats-panel {
  width: 200px;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid var(--color-border);

  h3 {
    font-size: 16px;
    color: var(--color-text-primary);
    margin-bottom: 16px;
  }
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);

  .stat-num {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-primary);
  }

  .stat-lbl {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-top: 4px;
  }
}

@media (max-width: 640px) {
  .timer-page {
    flex-direction: column;
    padding: 20px;
  }
  .stats-panel {
    width: 100%;
  }
  .stats-grid {
    flex-direction: row;
  }
  .time-display {
    font-size: 36px;
  }
}
</style>
