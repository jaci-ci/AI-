/**
 * useThrottle — 节流组合式函数（基于 requestAnimationFrame）
 * @param {Function} fn - 需要节流的函数
 * @returns {Function} 节流后的函数
 */
import { ref } from 'vue'

export function useThrottle(fn) {
  const rafId = ref(null)

  const throttledFn = (...args) => {
    if (rafId.value) return
    rafId.value = requestAnimationFrame(() => {
      fn(...args)
      rafId.value = null
    })
  }

  return throttledFn
}
