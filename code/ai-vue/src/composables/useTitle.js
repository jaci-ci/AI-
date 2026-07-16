/**
 * useTitle — 动态页面标题组合式函数
 *
 * @param {string} title - 初始页面标题
 * @returns {{ setTitle }}
 */
import { onMounted } from 'vue'

const BASE_TITLE = '云策 AI'

export function useTitle(title = '') {
  function setTitle(newTitle) {
    document.title = newTitle ? `${newTitle} | ${BASE_TITLE}` : BASE_TITLE
  }

  onMounted(() => {
    if (title) {
      setTitle(title)
    }
  })

  return { setTitle }
}
