/**
 * useLocalStorage — 响应式本地存储组合式函数
 * 自动与 localStorage 同步，支持跨标签页通信
 *
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {{ value: Ref, remove: Function, clear: Function }}
 */
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue = null) {
  // 初始化：从 localStorage 读取
  const stored = localStorage.getItem(key)
  const value = ref(stored ? JSON.parse(stored) : defaultValue)

  // 监听变化并自动写入 localStorage
  watch(
    value,
    (newVal) => {
      if (newVal === null || newVal === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(newVal))
      }
    },
    { deep: true }
  )

  // 监听其他标签页的 storage 变化
  window.addEventListener('storage', (e) => {
    if (e.key === key) {
      value.value = e.newValue ? JSON.parse(e.newValue) : defaultValue
    }
  })

  function remove() {
    value.value = null
  }

  function clear() {
    value.value = defaultValue
  }

  return { value, remove, clear }
}
