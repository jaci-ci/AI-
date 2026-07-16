/**
 * useCommandPalette — 命令面板组合式函数
 * 监听全局键盘事件，管理命令面板的打开/关闭状态
 *
 * @returns {{ isOpen, open, close, toggle, registerShortcut }}
 */
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const commands = ref([])

export function useCommandPalette() {
  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function registerCommand(command) {
    commands.value.push(command)
  }

  function unregisterCommand(id) {
    commands.value = commands.value.filter(c => c.id !== id)
  }

  function handleKeydown(e) {
    // Ctrl+K 或 Cmd+K 唤起命令面板
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      toggle()
    }
    // Escape 关闭
    if (e.key === 'Escape' && isOpen.value) {
      e.preventDefault()
      close()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    isOpen,
    commands,
    open,
    close,
    toggle,
    registerCommand,
    unregisterCommand
  }
}
