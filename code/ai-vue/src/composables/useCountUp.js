/**
 * useCountUp — 数字滚动动画组合式函数
 * 使用 requestAnimationFrame 实现平滑的数字递增效果
 *
 * @param {number} endValue - 目标数值
 * @param {number} duration - 动画时长（毫秒），默认 2000
 * @returns {{ currentValue, start }}
 */
import { ref } from 'vue'

export function useCountUp(endValue = 0, duration = 2000) {
  const currentValue = ref(0)
  let rafId = null
  let startTime = null

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
  }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutExpo(progress)

    currentValue.value = Math.round(endValue * easedProgress)

    if (progress < 1) {
      rafId = requestAnimationFrame(animate)
    }
  }

  function start(value) {
    if (value !== undefined) {
      // Allow changing end value dynamically
    }
    currentValue.value = 0
    startTime = null
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(animate)
  }

  return { currentValue, start }
}
