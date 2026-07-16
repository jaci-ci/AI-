/**
 * useVirtualList — 虚拟列表组合式函数
 * 通过仅渲染可视区域的DOM节点，大幅减少长列表的DOM数量
 *
 * @param {object} options - { itemHeight, containerHeight, totalItems, overscan }
 * @returns {{ startIndex, endIndex, visibleItems, scrollContainerRef, handleScroll }}
 */
import { ref, computed } from 'vue'

export function useVirtualList(options = {}) {
  const {
    itemHeight = 60,
    containerHeight = 600,
    overscan = 5
  } = options

  const scrollTop = ref(0)
  const totalItems = ref(0)

  const startIndex = computed(() => {
    return Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
  })

  const endIndex = computed(() => {
    const visible = Math.ceil(containerHeight / itemHeight)
    return Math.min(
      totalItems.value,
      startIndex.value + visible + overscan * 2
    )
  })

  const totalHeight = computed(() => totalItems.value * itemHeight)
  const offsetY = computed(() => startIndex.value * itemHeight)

  function handleScroll(event) {
    scrollTop.value = event.target.scrollTop
  }

  function setTotalItems(count) {
    totalItems.value = count
  }

  return {
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    scrollTop,
    handleScroll,
    setTotalItems,
    itemHeight
  }
}
