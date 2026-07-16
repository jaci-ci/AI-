/**
 * useClipboard — 剪贴板操作组合式函数
 *
 * @returns {{ copy, copied, error }}
 */
import { ref } from 'vue'

export function useClipboard() {
  const copied = ref(false)
  const error = ref(null)

  async function copy(text) {
    copied.value = false
    error.value = null

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
      } else {
        // Fallback: execCommand
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
      }
    } catch (err) {
      error.value = err
    }
  }

  return { copy, copied, error }
}
