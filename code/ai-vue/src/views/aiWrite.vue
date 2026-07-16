<!--
  AI写作工作台
  技术点：复用SSE流式对话 + 模板引擎 + 分屏Markdown预览
  简历关键词：AIGC应用 / 流式生成 / Markdown实时预览
-->
<template>
  <div class="aiwrite-container">
    <div class="aiwrite-header">
      <h2>AI写作工作台</h2>
      <p>选择模板，输入要点，AI帮你快速生成完整内容</p>
    </div>

    <div class="aiwrite-body">
      <!-- 左侧：模板选择 + 输入 -->
      <div class="input-panel">
        <!-- 模板选择 -->
        <div class="template-section">
          <h3>选择模板</h3>
          <div class="template-grid">
            <div
              v-for="tpl in templates"
              :key="tpl.id"
              class="template-card"
              :class="{ active: selectedTemplate === tpl.id }"
              @click="selectedTemplate = tpl.id"
            >
              <el-icon :size="24"><component :is="tpl.icon" /></el-icon>
              <span>{{ tpl.label }}</span>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-section">
          <div class="input-header">
            <h3>输入要点</h3>
            <span class="input-hint" v-if="currentTemplate">{{ currentTemplate.hint }}</span>
          </div>
          <el-input
            v-model="inputContent"
            type="textarea"
            :rows="8"
            :placeholder="currentTemplate ? currentTemplate.placeholder : '请先选择模板'"
            :disabled="isGenerating"
          />
          <div class="input-actions">
            <el-button
              type="primary"
              @click="generate"
              :disabled="!inputContent.trim() || isGenerating"
              :loading="isGenerating"
            >
              <el-icon><MagicStick /></el-icon>
              {{ isGenerating ? 'AI写作中...' : '开始生成' }}
            </el-button>
            <el-button @click="clearAll" :disabled="isGenerating">清空</el-button>
          </div>
        </div>
      </div>

      <!-- 右侧：生成结果 + Markdown预览 -->
      <div class="output-panel">
        <div class="output-tabs">
          <button
            :class="{ active: outputTab === 'preview' }"
            @click="outputTab = 'preview'"
          >预览</button>
          <button
            :class="{ active: outputTab === 'raw' }"
            @click="outputTab = 'raw'"
          >源码</button>
          <div class="output-actions">
            <el-button size="small" @click="copyOutput" text>
              <el-icon><CopyDocument /></el-icon> 复制
            </el-button>
            <el-button size="small" @click="downloadMd" text :disabled="!outputContent">
              <el-icon><Download /></el-icon> 导出
            </el-button>
          </div>
        </div>

        <div class="output-content" v-if="outputContent">
          <!-- Markdown 预览模式 -->
          <div v-if="outputTab === 'preview'" class="markdown-preview" v-html="renderedMarkdown"></div>
          <!-- 源码模式 -->
          <pre v-else class="markdown-raw">{{ outputContent }}</pre>
        </div>
        <div class="output-empty" v-else>
          <el-icon :size="48"><EditPen /></el-icon>
          <p>AI生成的内容将在这里显示</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { ElMessage } from 'element-plus'
import { useTitle } from '../composables/useTitle'
import { useClipboard } from '../composables/useClipboard'
import { startSession } from '../api/frontend'

useTitle('AI写作')

const { copy, copied } = useClipboard()

// 模板定义
const templates = [
  { id: 'daily', label: '日报', icon: 'Document', hint: '输入今日工作要点', placeholder: '今天完成了什么工作？\n遇到什么问题？\n明天的计划是什么？' },
  { id: 'weekly', label: '周报', icon: 'DataAnalysis', hint: '输入本周工作总结', placeholder: '本周主要成果有哪些？\n有哪些进展和困难？\n下周计划是什么？' },
  { id: 'email', label: '邮件', icon: 'Message', hint: '输入邮件主要内容', placeholder: '收件人是谁？\n邮件主题是什么？\n需要传达的核心信息是什么？' },
  { id: 'summary', label: '内容总结', icon: 'Reading', hint: '输入需要总结的要点', placeholder: '需要总结的内容要点是什么？\n重点突出哪些方面？\n目标读者是谁？' },
  { id: 'brainstorm', label: '脑暴大纲', icon: 'Sunny', hint: '输入脑暴主题', placeholder: '脑暴的主题是什么？\n有哪些初步想法？\n想要探索的方向有哪些？' },
]

const selectedTemplate = ref('daily')
const inputContent = ref('')
const outputContent = ref('')
const outputTab = ref('preview')
const isGenerating = ref(false)

const currentTemplate = computed(() => templates.find(t => t.id === selectedTemplate.value))

// Markdown渲染
const renderedMarkdown = computed(() => {
  if (!outputContent.value) return ''
  let html = outputContent.value
  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  // 粗体/斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // 列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
  // 换行
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  html = '<p>' + html + '</p>'
  return html
})

// SSE流式生成（先创建会话 → 再发消息 → 完全适配后端接口）
async function generate() {
  if (!inputContent.value.trim() || isGenerating.value) return

  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录后使用AI写作功能')
    return
  }

  isGenerating.value = true
  outputContent.value = ''
  outputTab.value = 'preview'

  const template = currentTemplate.value
  const prompt = `你是一个专业的写作助手。请根据以下${template.label}要点，生成完整的${template.label}内容。
使用Markdown格式，包含标题、分点、重点加粗等。
内容要点：${inputContent.value}

请直接输出${template.label}内容，不需要额外解释。`

  try {
    // 1. 先创建真实会话（后端要求）
    const sessionRes = await startSession({
      initialMessage: prompt,
      sessionTitle: `AI写作-${template.label}`
    })
    const sessionId = sessionRes.sessionId
    if (!sessionId) throw new Error('创建会话失败')

    // 2. 再以真实 sessionId 调用 SSE 流式接口
    const ctrl = new AbortController()

    fetchEventSource('/api/psychological-chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Token': token,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({ sessionId, userMessage: prompt }),
      signal: ctrl.signal,

      onopen: async (res) => {
        if (!res.ok) {
          ElMessage.error(`服务器错误: ${res.status}`)
          ctrl.abort()
          isGenerating.value = false
        }
      },

      onmessage: (event) => {
        const raw = event.data.trim()
        if (!raw) return

        if (event.event === 'done') {
          isGenerating.value = false
          ctrl.abort()
          return
        }

        try {
          const payload = JSON.parse(raw)
          if (String(payload.code) === '200' && payload.data?.content) {
            outputContent.value += payload.data.content
          }
        } catch {
          outputContent.value += raw
        }
      },

      onerror: (error) => {
        isGenerating.value = false
        ctrl.abort()
        ElMessage.error('生成中断，请重试')
        throw error
      },

      onclose: () => {
        isGenerating.value = false
      }
    })
  } catch (err) {
    console.error('AI写作失败:', err)
    ElMessage.error('生成失败: ' + (err.message || '未知错误'))
    isGenerating.value = false
  }
}

function clearAll() {
  inputContent.value = ''
  outputContent.value = ''
}

function copyOutput() {
  copy(outputContent.value)
  if (copied.value) ElMessage.success('已复制到剪贴板')
}

function downloadMd() {
  const blob = new Blob([outputContent.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentTemplate.value?.label || '文档'}_${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}
</script>

<style lang="scss" scoped>
.aiwrite-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.aiwrite-header {
  margin-bottom: 24px;
  h2 { font-size: 24px; color: var(--color-text-primary); }
  p { color: var(--color-text-secondary); margin-top: 4px; }
}

.aiwrite-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

/* 模板卡片 */
.template-section h3, .input-section h3 {
  font-size: 15px;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.template-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.template-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-regular);
  font-size: 13px;

  &.active {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
    color: var(--color-primary);
  }

  &:hover { border-color: var(--color-primary-light); }
}

/* 输入区域 */
.input-panel {
  background: var(--color-bg-card);
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.input-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.input-hint {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.input-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

/* 输出区域 */
.output-panel {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.output-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);

  button {
    padding: 4px 12px;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    font-size: 13px;
    &.active { background: var(--color-primary-bg); color: var(--color-primary); }
  }

  .output-actions { margin-left: auto; }
}

.output-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.markdown-preview {
  line-height: 1.8;
  color: var(--color-text-primary);

  :deep(h1) { font-size: 22px; margin: 16px 0 8px; }
  :deep(h2) { font-size: 18px; margin: 14px 0 6px; }
  :deep(h3) { font-size: 15px; margin: 12px 0 4px; }
  :deep(ul) { padding-left: 20px; margin: 8px 0; }
  :deep(li) { margin: 4px 0; list-style: disc; }
  :deep(strong) { color: var(--color-primary); }
  :deep(p) { margin: 8px 0; }
}

.markdown-raw {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 13px;
  color: var(--color-text-regular);
  line-height: 1.6;
}

.output-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-placeholder);
  gap: 12px;
}

@media (max-width: 900px) {
  .aiwrite-body { grid-template-columns: 1fr; }
}
</style>
