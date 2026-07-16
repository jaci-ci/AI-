<!--
  命令面板组件 (Ctrl+K 唤起)
  技术点：全局键盘事件 + 模糊搜索 + 键盘导航 + 最近使用排序
  类似 VS Code / Notion 的命令面板体验
-->
<template>
  <teleport to="body">
    <div class="command-overlay" v-if="visible" @click.self="close">
      <div class="command-panel" @click.stop>
        <!-- 搜索框 -->
        <div class="search-box">
          <el-icon :size="18"><Search /></el-icon>
          <input
            ref="searchInput"
            v-model="query"
            placeholder="输入命令搜索..."
            class="search-input"
            @keydown="handleKeydown"
            autofocus
          />
          <kbd class="shortcut-hint">ESC</kbd>
        </div>

        <!-- 命令列表 -->
        <div class="command-list" v-if="filteredCommands.length > 0">
          <div class="command-group" v-for="group in groupedCommands" :key="group.label">
            <div class="group-label">{{ group.label }}</div>
            <div
              v-for="(cmd, idx) in group.commands"
              :key="cmd.id"
              class="command-item"
              :class="{ active: activeIndex === getGlobalIndex(group, idx) }"
              @click="executeCommand(cmd)"
              @mouseenter="activeIndex = getGlobalIndex(group, idx)"
            >
              <el-icon :size="16" class="cmd-icon">
                <component :is="cmd.icon" />
              </el-icon>
              <div class="cmd-info">
                <span class="cmd-name">{{ cmd.label }}</span>
                <span class="cmd-desc" v-if="cmd.description">{{ cmd.description }}</span>
              </div>
              <kbd class="cmd-shortcut" v-if="cmd.shortcut">{{ cmd.shortcut }}</kbd>
            </div>
          </div>
        </div>

        <!-- 无结果 -->
        <div class="no-results" v-else>
          <el-icon :size="24"><Warning /></el-icon>
          <span>未找到匹配的命令</span>
        </div>

        <!-- 底部提示 -->
        <div class="footer-hint">
          <span><kbd>↑↓</kbd> 导航</span>
          <span><kbd>Enter</kbd> 执行</span>
          <span><kbd>Ctrl+K</kbd> 切换</span>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const theme = useTheme()

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const query = ref('')
const activeIndex = ref(0)
const searchInput = ref(null)
const recentCommands = ref([])

// 命令定义
const allCommands = [
  // 页面导航
  { id: 'home', label: '前往首页', description: '返回平台首页', icon: 'HomeFilled', shortcut: '', category: '导航', action: () => router.push('/') },
  { id: 'chat', label: '智能对话', description: '开始AI对话咨询', icon: 'ChatDotRound', shortcut: '', category: '导航', action: () => router.push('/consultation') },
  { id: 'notes', label: '随手记', description: '记录日常笔记', icon: 'Edit', shortcut: '', category: '导航', action: () => router.push('/emotion-diary') },
  { id: 'knowledge', label: '知识库', description: '浏览知识文章', icon: 'Reading', shortcut: '', category: '导航', action: () => router.push('/knowledge') },
  { id: 'dashboard', label: '数据看板', description: '查看数据分析', icon: 'DataAnalysis', shortcut: '', category: '导航', action: () => router.push('/back/dashboard') },
  { id: 'datascreen', label: '数据大屏', description: '全屏数据可视化', icon: 'Monitor', shortcut: '', category: '导航', action: () => router.push('/back/screen') },
  { id: 'focus', label: '专注计时', description: '打开番茄专注计时器', icon: 'Timer', shortcut: '', category: '导航', action: () => router.push('/focus-timer') },

  // 操作
  { id: 'new-chat', label: '新建对话', description: '开始一个新的AI对话', icon: 'Plus', shortcut: '', category: '操作', action: () => router.push('/consultation') },
  { id: 'new-note', label: '新建笔记', description: '创建一篇新的随手记', icon: 'DocumentAdd', shortcut: '', category: '操作', action: () => router.push('/emotion-diary') },

  // 主题
  { id: 'theme-light', label: '切换浅色模式', description: '', icon: 'Sunny', shortcut: '', category: '主题', action: () => theme.setTheme('light') },
  { id: 'theme-dark', label: '切换深色模式', description: '', icon: 'Moon', shortcut: '', category: '主题', action: () => theme.setTheme('dark') },
  { id: 'theme-system', label: '跟随系统主题', description: '', icon: 'Monitor', shortcut: '', category: '主题', action: () => theme.setTheme('system') },
]

// 模糊搜索
function fuzzyMatch(query, text) {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (q[qi] === t[ti]) qi++
  }
  return qi === q.length
}

const filteredCommands = computed(() => {
  if (!query.value.trim()) {
    // 无搜索时，把最近使用的排前面
    const recent = recentCommands.value
      .map(id => allCommands.find(c => c.id === id))
      .filter(Boolean)
    const rest = allCommands.filter(c => !recent.includes(c))
    return [...recent, ...rest]
  }
  return allCommands.filter(c =>
    fuzzyMatch(query.value, c.label) ||
    fuzzyMatch(query.value, c.description) ||
    fuzzyMatch(query.value, c.category)
  )
})

// 按分组整理
const groupedCommands = computed(() => {
  const groups = {}
  for (const cmd of filteredCommands.value) {
    if (!groups[cmd.category]) groups[cmd.category] = []
    groups[cmd.category].push(cmd)
  }
  return Object.entries(groups).map(([label, commands]) => ({ label, commands }))
})

function getGlobalIndex(group, idx) {
  let count = 0
  for (const g of groupedCommands.value) {
    if (g.label === group.label) return count + idx
    count += g.commands.length
  }
  return 0
}

// 执行命令
function executeCommand(cmd) {
  // 记录最近使用
  recentCommands.value = [cmd.id, ...recentCommands.value.filter(id => id !== cmd.id)].slice(0, 5)
  cmd.action()
  close()
}

// 键盘导航
function handleKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const total = filteredCommands.value.length
    activeIndex.value = (activeIndex.value + 1) % total
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const total = filteredCommands.value.length
    activeIndex.value = (activeIndex.value - 1 + total) % total
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const flat = groupedCommands.value.flatMap(g => g.commands)
    if (flat[activeIndex.value]) {
      executeCommand(flat[activeIndex.value])
    }
  } else if (e.key === 'Escape') {
    close()
  }
}

function close() {
  query.value = ''
  activeIndex.value = 0
  emit('close')
}

// 每次打开聚焦搜索框
watch(() => props.visible, async (v) => {
  if (v) {
    await nextTick()
    searchInput.value?.focus()
  }
})

// 监听全局 Ctrl+K
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      if (props.visible) {
        close()
      } else {
        emit('toggle')
      }
    }
  })
})
</script>

<style lang="scss" scoped>
.command-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--color-bg-overlay);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  backdrop-filter: blur(4px);
}

.command-panel {
  width: 560px;
  max-width: 90vw;
  max-height: 60vh;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
    background: transparent;
    color: var(--color-text-primary);
    font-family: var(--font-family);

    &::placeholder {
      color: var(--color-text-placeholder);
    }
  }

  .shortcut-hint {
    padding: 2px 6px;
    font-size: 11px;
    background: var(--color-bg-secondary);
    border-radius: 4px;
    color: var(--color-text-secondary);
  }
}

/* 命令列表 */
.command-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.command-group {
  margin-bottom: 4px;
}

.group-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  padding: 6px 12px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.1s;

  &.active {
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }

  .cmd-icon {
    flex-shrink: 0;
    width: 20px;
    color: var(--color-text-secondary);
  }

  &.active .cmd-icon {
    color: var(--color-primary);
  }

  .cmd-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .cmd-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .cmd-desc {
      font-size: 12px;
      color: var(--color-text-secondary);
    }
  }

  &.active .cmd-info .cmd-name,
  &.active .cmd-info .cmd-desc {
    color: var(--color-primary);
  }

  .cmd-shortcut {
    font-size: 11px;
    color: var(--color-text-placeholder);
  }
}

/* 无结果 */
.no-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: var(--color-text-secondary);
}

/* 底部提示 */
.footer-hint {
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  border-top: 1px solid var(--color-border);
  font-size: 12px;
  color: var(--color-text-placeholder);
  flex-wrap: wrap;

  kbd {
    padding: 1px 4px;
    background: var(--color-bg-secondary);
    border-radius: 3px;
    font-size: 11px;
  }
}
</style>
