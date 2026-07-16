/**
 * useVoiceInput — 浏览器语音识别组合式函数
 * 基于 Web Speech API (SpeechRecognition)，零额外依赖
 *
 * @returns {{ isListening, transcript, isSupported, start, stop, toggle }}
 */
import { ref, onUnmounted } from 'vue'

export function useVoiceInput(options = {}) {
  const { lang = 'zh-CN', continuous = true, interimResults = true } = options

  const isListening = ref(false)
  const transcript = ref('')
  const isSupported = ref(false)
  const error = ref(null)

  let recognition = null

  // 检测浏览器支持
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  isSupported.value = !!SpeechRecognition

  if (SpeechRecognition) {
    recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = interimResults

    recognition.onstart = () => {
      isListening.value = true
      error.value = null
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      transcript.value = finalTranscript || interimTranscript
    }

    recognition.onerror = (event) => {
      error.value = event.error
      isListening.value = false

      // 'no-speech' 错误自动重试
      if (event.error === 'no-speech') {
        setTimeout(() => {
          if (isListening.value === false) {
            try { recognition.start() } catch {}
          }
        }, 500)
      }
    }

    recognition.onend = () => {
      isListening.value = false
    }
  }

  function start() {
    if (!recognition) return
    transcript.value = ''
    error.value = null
    try {
      recognition.start()
    } catch {
      // 如果已经在监听，先停止再重启
      recognition.stop()
      setTimeout(() => recognition.start(), 100)
    }
  }

  function stop() {
    if (recognition) {
      recognition.stop()
    }
    isListening.value = false
  }

  function toggle() {
    isListening.value ? stop() : start()
  }

  onUnmounted(() => {
    stop()
  })

  return {
    isListening,
    transcript,
    isSupported,
    error,
    start,
    stop,
    toggle
  }
}
