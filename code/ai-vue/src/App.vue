<script setup>
/**
 * 云策 AI · 智能工作平台 — 根组件
 * 职责：主题初始化、全局命令面板、错误处理
 */
import { ref, onMounted, getCurrentInstance } from 'vue'
import CommandPalette from './components/CommandPalette.vue'

// 命令面板状态
const paletteVisible = ref(false)

function togglePalette() {
  paletteVisible.value = !paletteVisible.value
}

// 全局 Ctrl+K 监听
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      paletteVisible.value = !paletteVisible.value
    }
    if (e.key === 'Escape' && paletteVisible.value) {
      paletteVisible.value = false
    }
  })

  // 全局错误处理
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[未处理的Promise错误]', event.reason)
    event.preventDefault()
  })
})
</script>

<template>
  <router-view />
  <CommandPalette :visible="paletteVisible" @close="paletteVisible = false" @toggle="togglePalette" />
</template>
