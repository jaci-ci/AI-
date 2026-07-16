/**
 * useLazyImage — 图片懒加载组合式函数
 * 基于 IntersectionObserver，当图片进入视口时才加载
 *
 * @returns {{ imgRef, isLoaded, observe }}
 */
import { ref } from 'vue'

export function useLazyImage() {
  const imgRef = ref(null)
  const isLoaded = ref(false)
  const isError = ref(false)
  let observer = null

  function observe(src) {
    if (!imgRef.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = entry.target
          const actualSrc = img.dataset.src || src

          if (actualSrc) {
            img.src = actualSrc
            img.onload = () => { isLoaded.value = true }
            img.onerror = () => { isError.value = true }
          }

          observer.unobserve(img)
          observer = null
        }
      },
      { threshold: 0.01, rootMargin: '200px' }
    )

    observer.observe(imgRef.value)
  }

  return { imgRef, isLoaded, isError, observe }
}
