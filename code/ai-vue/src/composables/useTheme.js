/**
 * useTheme — 主题管理组合式函数
 * 支持：亮色 / 暗色 / 跟随系统 三种模式
 * 技术点：CSS变量 + watchEffect + localStorage + matchMedia
 */
import { ref, watchEffect, onMounted, onUnmounted } from 'vue'

const THEME_KEY = 'zhiyu-theme-preference'
const DARK_CLASS = 'dark'

// 全局共享状态（单例模式，跨组件同步）
const currentTheme = ref(localStorage.getItem(THEME_KEY) || 'light')
const isDark = ref(false)

let mediaQuery = null

function applyTheme(theme) {
  const prefersDark = theme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : theme === 'dark'

  isDark.value = prefersDark
  document.documentElement.classList.toggle(DARK_CLASS, prefersDark)
}

function setupSystemListener() {
  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemChange)
  }
}

function teardownSystemListener() {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleSystemChange)
    mediaQuery = null
  }
}

function handleSystemChange() {
  if (currentTheme.value === 'system') {
    applyTheme('system')
  }
}

export function useTheme() {
  onMounted(() => {
    applyTheme(currentTheme.value)
    if (currentTheme.value === 'system') {
      setupSystemListener()
    }
  })

  onUnmounted(() => {
    teardownSystemListener()
  })

  // 监听主题变化并持久化
  watchEffect(() => {
    const theme = currentTheme.value
    localStorage.setItem(THEME_KEY, theme)

    if (theme === 'system') {
      setupSystemListener()
    } else {
      teardownSystemListener()
    }

    applyTheme(theme)
  })

  /**
   * 设置主题模式
   * @param {'light' | 'dark' | 'system'} mode
   */
  function setTheme(mode) {
    if (['light', 'dark', 'system'].includes(mode)) {
      currentTheme.value = mode
    }
  }

  /**
   * 循环切换主题： light → dark → system → light
   */
  function toggleTheme() {
    const map = { light: 'dark', dark: 'system', system: 'light' }
    currentTheme.value = map[currentTheme.value] || 'light'
  }

  /**
   * 获取当前主题图标名称（Element Plus 图标）
   */
  function getThemeIcon() {
    const map = { light: 'Sunny', dark: 'Moon', system: 'Monitor' }
    return map[currentTheme.value] || 'Sunny'
  }

  /**
   * 获取当前主题显示名称
   */
  function getThemeLabel() {
    const map = { light: '浅色模式', dark: '深色模式', system: '跟随系统' }
    return map[currentTheme.value] || '浅色模式'
  }

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
    getThemeIcon,
    getThemeLabel
  }
}
