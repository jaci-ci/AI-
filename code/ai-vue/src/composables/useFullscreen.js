/**
 * useFullscreen — 全屏切换组合式函数
 *
 * @returns {{ isFullscreen, enter, exit, toggle }}
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(false)

  function handleChange() {
    isFullscreen.value = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    )
  }

  async function enter(el = document.documentElement) {
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen
    if (fn) {
      await fn.call(el)
    }
  }

  async function exit() {
    const fn = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen
    if (fn) {
      await fn.call(document)
    }
  }

  async function toggle(el) {
    isFullscreen.value ? await exit() : await enter(el)
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleChange)
    document.addEventListener('webkitfullscreenchange', handleChange)
    document.addEventListener('msfullscreenchange', handleChange)
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleChange)
    document.removeEventListener('webkitfullscreenchange', handleChange)
    document.removeEventListener('msfullscreenchange', handleChange)
  })

  return { isFullscreen, enter, exit, toggle }
}
