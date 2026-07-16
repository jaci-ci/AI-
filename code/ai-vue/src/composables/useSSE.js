/**
 * useSSE — Server-Sent Events 流式请求组合式函数
 * 封装 fetchEventSource，支持断线重连、超时处理、手动中断
 *
 * @param {string} url - SSE 请求地址
 * @param {object} options - 请求选项
 * @returns {{ connect, disconnect, isConnected, onMessage, onError, onDone }}
 */
import { ref } from 'vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'

export function useSSE(url, options = {}) {
  const isConnected = ref(false)
  const error = ref(null)
  let controller = null

  const {
    method = 'POST',
    headers = {},
    body = null,
    onMessage = () => {},
    onError = () => {},
    onDone = () => {},
    retryCount = 3,
    retryDelay = 1000,
    timeout = 30000,
    autoConnect = false
  } = options

  async function connect(requestBody) {
    controller = new AbortController()
    isConnected.value = true
    error.value = null

    const timeoutId = setTimeout(() => {
      disconnect()
      const err = new Error('SSE请求超时')
      error.value = err
      onError(err)
    }, timeout)

    try {
      await fetchEventSource(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: requestBody ? JSON.stringify(requestBody) : body,
        signal: controller.signal,
        openWhenHidden: true,

        onopen: async (response) => {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            clearTimeout(timeoutId)
            return
          }
          throw new Error(`SSE 连接失败: ${response.status}`)
        },

        onmessage: (event) => {
          if (event.data === '[DONE]') {
            disconnect()
            onDone()
            return
          }
          try {
            const data = JSON.parse(event.data)
            onMessage(data)
          } catch {
            onMessage(event.data)
          }
        },

        onerror: (err) => {
          clearTimeout(timeoutId)
          error.value = err
          onError(err)
          // 返回 2000ms 后重试，throw 则不重试
          return 2000
        }
      })
    } catch (err) {
      clearTimeout(timeoutId)
      isConnected.value = false
      error.value = err
      onError(err)
    }
  }

  function disconnect() {
    if (controller) {
      controller.abort()
      controller = null
    }
    isConnected.value = false
  }

  return {
    isConnected,
    error,
    connect,
    disconnect
  }
}
