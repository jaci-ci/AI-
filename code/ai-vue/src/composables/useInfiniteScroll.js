/**
 * useInfiniteScroll — 无限滚动组合式函数
 * 基于 IntersectionObserver 检测元素进入视口
 *
 * @param {Function} loadMore - 加载更多的回调函数
 * @returns {{ targetRef, isIntersecting, observe, unobserve }}
 */
import { ref } from 'vue'

export function useInfiniteScroll(loadMore) {
  const targetRef = ref(null)
  const isIntersecting = ref(false)
  let observer = null

  function observe() {
    if (!targetRef.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting.value = entry.isIntersecting
        if (entry.isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    observer.observe(targetRef.value)
  }

  function unobserve() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  return { targetRef, isIntersecting, observe, unobserve }
}
