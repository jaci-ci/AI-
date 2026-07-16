/**
 * useDebounce — 防抖组合式函数
 * @param {Function} fn - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒），默认 300
 * @returns {Function} 防抖后的函数
 */
import { ref } from 'vue'

export function useDebounce(fn, delay = 300) {
  const timer = ref(null)

  const debouncedFn = (...args) => {
    if (timer.value) {
      clearTimeout(timer.value)
    }
    timer.value = setTimeout(() => {
      fn(...args)
      timer.value = null
    }, delay)
  }

  return debouncedFn
}
