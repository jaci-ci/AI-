<template>
    <!-- 心理咨询主页面容器 -->
    <div class="consultation-container">
        <!-- 左侧边栏区域 -->
        <div class="sidebar">
            <!-- AI助手信息卡片 -->
            <div class="ai-assistant-info">
                <!-- 呼吸动画头像容器 -->
                <div class="breathing-circle">
                    <el-image style="width: 25px; height: 25px;" :src="iconUrl" alt="logo" />
                </div>
                <!-- 助手名称 -->
                <h3 class="assistant-name">心理健康AI助手</h3>
                <!-- 在线状态指示 -->
                <div class="online-status">
                    <div class="status-dot"></div>
                    在线服务中
                </div>
            </div>
            <!-- 情绪花园模块 - 展示用户情绪状态和建议 -->
            <div class="emotion-garden">
                <!-- 情绪花园标题栏 -->
                <div class="garden-header">
                    <div class="garden-title">情绪花园</div>
                </div>
                <!-- 情绪信息展示 - 圆形情绪指示器 -->
                <div class="emotion-info">
                    <div class="emotion-name">中性</div>
                    <div class="emotion-score">50</div>
                </div>
                <!-- 温暖提示区域 -->
                <div class="warm-tips">
                    <!-- 情绪状态文本 -->
                    <div class="emotion-status-text">
                        <span class="status-label">今天感觉</span>
                        <span class="status-emotion">{{ currentEmotion.isNegative ? '需要关注' : '很不错' }}</span>
                    </div>
                    <!-- 情绪强度指示器 -->
                    <div class="emotion-intensity">
                        <span class="intensity-dots">
                            <span v-for="dot in 3" :key="index" class="dot" :class="{'active': getIntensityClass(currentEmotion.emotionScore)>=dot}"></span>
                        </span>
                        <span class="intensity-text">{{ getRiskText(currentEmotion.riskLevel) }}</span>
                    </div>
                    <!-- 温暖建议卡片 - 根据情绪分析给出个性化建议 -->
                    <div class="warm-suggestion" v-if="currentEmotion.suggestion">
                        <div class="suggestion-icon">💝</div>
                        <div class="suggestion-content">
                            <div class="suggestion-title">给你的小建议</div>
                            <div class="suggestion-text">{{ currentEmotion.suggestion }}</div>
                        </div>
                    </div>
                    <!-- 治愈行动列表 - 推荐改善情绪的具体行动 -->
                    <div class="healing-actions" v-if="currentEmotion.improvementSuggestions.length>0">
                        <div class="actions-title">治愈行动</div>
                        <div class="actions-list">
                            <div class="action-item" v-for="action in currentEmotion.improvementSuggestions" :key="action">
                                <div class="action-icon">✨</div>
                                <div class="action-text">{{ action }}</div>
                            </div>
                        </div>
                    </div>
                    <!-- 风险提示卡片 - 当检测到负面情绪且风险等级较高时显示 -->
                    <div class="risk-notice" v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1">
                        <div class="notice-icon">🤗</div>
                        <div class="notice-content">
                            <div class="notice-title">温馨提示</div>
                            <div class="notice-text">{{ currentEmotion.riskDescription }}</div>
                        </div>
                    </div>
                </div>
              </div>
            <!-- 会话历史列表 -->
            <div class="session-history">
                <h4 class="session-title">会话历史</h4>
                <!-- 会话列表容器 -->
                <div class="session-list">
                    <!-- 会话项 - 遍历会话列表 -->
                    <div class="session-item" v-for="item in sessionList" :key="item.id" @click="handleSessionClick(item)">
                        <div class="session-info">
                            <div class="session-title">
                                <!-- 会话标题 -->
                                <span>{{ item.sessionTitle }}</span>
                                <!-- 会话元信息 -->
                                <div class="session-meta">
                                    <span class="session-time">{{ item.startedAt }}</span>
                                </div>
                                <!-- 消息预览 -->
                                <div class="session-preview">
                                    {{ item.lastMessageContent }}
                                </div>
                                <!-- 会话统计信息 -->
                                <div class="session-stats">
                                    <span>
                                        <el-icon>
                                            <ChatRound />
                                        </el-icon>
                                        {{ item.messageCount||0 }}
                                    </span>
                                    <span>
                                        <el-icon>
                                            <Clock />
                                        </el-icon>
                                        {{ item.durationMinutes||0 }}分钟
                                    </span>
                                </div>
                            </div>
                            <!-- 会话操作按钮 -->
                            <div class="session-actions">
                                <el-button text size="mini" @click="handleDeleteSession(item.id)"type="danger">
                                    <el-icon>
                                        <DeleteFilled />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 右侧主聊天区域 -->
        <div class="chat-main">
            <!-- 聊天头部 -->
            <div class="chat-header">
                <div class="header-left">
                    <!-- 聊天头像 -->
                    <div class="chat-avatar">
                        <el-image style="width: 30px; height: 30px;" :src="iconUrl1"/>
                    </div>
                    <!-- 聊天信息 -->
                    <div class="chat-info">
                        <h2>AI健康助手</h2>
                        <p>您贴心的心理健康助手</p>
                    </div>
                </div>
                <!-- 创建新会话按钮 -->
                <el-button circle @click="createNewFrontendSession" title="创建新会话">
                    <el-icon>
                        <Plus />
                    </el-icon>
                </el-button>
            </div>
            <!-- 聊天消息区域 -->
            <div class="chat-messages">
                <!-- 默认欢迎消息 - 当消息列表为空时显示 -->
                <div class="message-item ai-message" v-if="messages.length===0">
                    <div class="message-avatar">
                        <el-image style="width: 18px; height: 18px;" :src="iconUrl"/>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <p>您好，我是小暖，您的心理助手。很高兴与您互动，今天您想跟我聊些什么？</p>
                        </div>
                        <div class="message-time">刚刚</div>
                    </div>
                </div>
                <!-- 消息列表 - 遍历消息数组 -->
                <div class="message-item" :class="{'ai-message': msg.senderType===2, 'user-message': msg.senderType===1}" v-for="msg in messages" :key="msg.id">
                    <div class="message-avatar">
                        <!-- 用户头像 -->
                        <el-image style="width: 18px; height: 18px;" v-if="msg.senderType===1" :src="iconUrl2"/>
                        <!-- AI头像 -->
                        <el-image style="width: 18px; height: 18px;" v-if="msg.senderType===2" :src="iconUrl"/>
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <!-- 打字指示器 - AI回复时显示 -->
                            <div class="typing-indicator" v-if="msg.senderType===2 && isAiTyping && !msg.content">
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>
                            <!-- AI错误提示 -->
                            <div v-if="msg.isError" class="error-message">
                                <p>{{msg.content}}</p>
                            </div>
                            <!-- AI消息渲染 - 使用Markdown渲染器 -->
                            <MarkdownRenderer v-else-if="msg.senderType === 2 && !msg.content" :content="msg.content" :is-ai-message="true" />
                            <!-- 普通消息内容 -->
                            <p v-else-if="msg.content" v-html="formatMessageContent(msg.content)"></p>
                        </div>
                        <!-- 消息时间戳 -->
                        <div class="message-time">{{ msg.senderType===2 && isAiTyping?'正在输入中...':msg.createdAt}}</div>
                    </div>
                </div>
            </div>
            <!-- 消息输入区域 -->
            <div class="chat-input">
                <div class="input-container">
                    <!-- 消息输入框 -->
                    <el-input
                     v-model="userMessage" 
                     placeholder="请输入您要分享的内容......" 
                     type="textarea"
                     :rows="3"
                     :disabled="isAiTyping"
                     @keydown="handleKeyDown"
                     class="message-input">
                    </el-input>
                    <!-- 输入框底部提示 -->
                    <div class="input-footer">
                        <span>按Enter发送消息，Shift+Enter换行</span>
                        <span>{{ userMessage.length }}/500</span>
                    </div>
                </div>
                <!-- 发送按钮 -->
                <el-button type="primary" @click="sendMessage" class="send-btn" :disabled="!userMessage.trim() || userMessage.length>500">
                    <el-icon>
                        <Promotion />
                    </el-icon>
                </el-button>
            </div>
        </div>
    </div>
</template>
<script setup>
// 导入Vue组合式API
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
// 导入API接口
import { startSession } from '../api/frontend'
import { getSessionList, deleteSession, getSessionDetail, getSessionEmotion } from '../api/frontend'
// 导入Element Plus组件
import { ElMessage, ElMessageBox } from 'element-plus'
// 导入Element Plus图标
import { Clock, ChatRound, DeleteFilled, Plus, Promotion } from '@element-plus/icons-vue'
// 导入Markdown渲染组件
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
// 导入Server-Sent Events客户端库
import { fetchEventSource } from '@microsoft/fetch-event-source'

// AI助手头像URL
const iconUrl = new URL('../assets/images/robot-fill.png', import.meta.url).href
// 聊天头部头像URL
const iconUrl1 = new URL('../assets/images/like.png', import.meta.url).href
// 用户头像URL
const iconUrl2 = new URL('../assets/images/users.png', import.meta.url).href



/**
 * 创建新会话（前端临时会话）
 * 清空当前消息列表和输入框，创建临时会话对象
 */
const createNewFrontendSession = () => {
    // 清空消息列表
    messages.value = []
    // 清空输入框
    userMessage.value = ''
    // 创建一个新的临时会话对象
    const newSession = {
        sessionId: `temp_${Date.now()}`,
        status: 'TEMP',
        sessionTitle: '新对话',
    }
    currentSession.value = newSession
    ElMessage.success('已创建新会话')
}

// 当前会话对象（响应式）
const currentSession = ref(null)
// 会话列表（响应式）
const sessionList = ref([])

// 消息列表（响应式）
const messages = ref([])
// 用户输入消息（响应式）
const userMessage = ref('')
// AI是否正在回复（响应式）
const isAiTyping = ref(false)

/**
 * 情绪花园数据（响应式）
 * 包含情绪分析结果和建议
 */
const currentEmotion = ref({
    primaryEmotion: '中性',      // 主要情绪
    emotionScore: 50,            // 情绪分数
    isNegative: false,           // 是否负面情绪
    riskLevel: 0,                // 风险等级（0-3）
    suggestion: '情绪状态平稳', // 建议文本
    improvementSuggestions: []   // 改善建议列表
})

/**
 * 加载会话情绪分析数据
 * @param {string} sessionId - 会话ID
 */
const loadSessionEmotion = (sessionId) => {
    // 确保sessionId格式正确，以'session_'前缀开头
    const id = sessionId.toString().startsWith('session_') ? sessionId : `session_${sessionId}`
    getSessionEmotion(id).then(res => {
        currentEmotion.value = res
    })
}

/**
 * 根据情绪分数获取强度等级
 * @param {number} score - 情绪分数
 * @returns {number} 强度等级（1-3）
 */
const getIntensityClass = (score) => {
    if (score >= 61) {
        return 3;
    }
    if (score >= 31) {
        return 2;
    }
    return 1;
}

/**
 * 根据风险等级获取风险文本描述
 * @param {number} level - 风险等级（0-3）
 * @returns {string} 风险描述文本
 */
const getRiskText = (level) => {
    switch (level) {
        case 0:
            return '正常';
        case 1:
            return '关注';
        case 2:
            return '预警';
        case 3:
            return '危机';
        default:
            return '正常';
    }
}

/**
 * 处理键盘事件
 * @param {KeyboardEvent} e - 键盘事件对象
 */
const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        sendMessage()
    }
}

/**
 * 用户发送消息
 * 验证消息有效性，根据会话状态决定创建新会话或继续历史对话
 */
const sendMessage = () => {
    // 验证消息不为空
    if (!userMessage.value.trim()) {
        return
    }
    // 防止重复发送（AI正在回复时禁止发送）
    if (isAiTyping.value) {
        ElMessage.error('AI正在回复中,请稍后再发送')
        return
    }

    const message = userMessage.value.trim()
    userMessage.value = ''

    // 如果没有会话或当前是临时会话，则创建新会话
    if (!currentSession.value || currentSession.value.status === 'TEMP') {
        startNewSession(message)
    } else {
        // 继续历史对话，添加用户消息
        messages.value.push({
            id: Date.now(),
            senderType: 1,      // 1表示用户发送
            content: message,
            createdAt: new Date().toISOString(),
        })
        startAiResponse(currentSession.value.sessionId, message)
    }
}

/**
 * 创建新会话（调用后端接口）
 * @param {string} message - 用户初始消息
 */
const startNewSession = (message) => {
    const sessionParams = {
        initialMessage: message,
    }
    // 根据会话类型设置会话标题
    if (currentSession.value.sessionTitle === '新对话') {
        sessionParams.sessionTitle = `碧蓝 AI 助手 - ${new Date().toLocaleString('zh-CN', { hour12: false })}`
    } else {
        // 如果是历史会话记录，保持原标题
        sessionParams.sessionTitle = currentSession.value.sessionTitle
    }
    // 调用后端接口创建会话
    startSession(sessionParams).then(res => {
        // 将后端返回的数据转为前端会话格式
        const sessionData = {
            sessionId: res.sessionId,
            status: res.status,
            sessionTitle: sessionParams.sessionTitle,
        }
        // 如果当前是临时会话则更新会话信息
        if (currentSession.value && currentSession.value.status === 'TEMP') {
            // 更新为正式会话
            Object.assign(currentSession.value, sessionData)
        } else {
            // 创建新会话
            currentSession.value = sessionData
        }
        // 刷新会话列表
        getSessionPage()
        // 添加用户初始消息
        messages.value.push({
            id: Date.now(),
            senderType: 1,      // 1表示用户发送
            content: message,
            createdAt: new Date().toISOString(),
        })
        startAiResponse(currentSession.value.sessionId, message)
    })
}

/**
 * 启动AI响应（使用Server-Sent Events流式接收）
 * @param {string} sessionId - 会话ID
 * @param {string} userMessage - 用户消息内容
 */
const startAiResponse = (sessionId, userMessage) => {
    // 防止重复发送
    if (isAiTyping.value) {
        ElMessage.error('AI正在回复中,请稍后再发送')
        return
    }
    isAiTyping.value = true
    // 创建AI消息对象（初始内容为空）
    const aiMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        senderType: 2,      // 2表示AI发送
        content: '',
        createdAt: new Date().toISOString(),
    }
    messages.value.push(aiMessage)

    // 使用Server-Sent Events调用后端接口获取AI回复
    const ctrl = new AbortController()
    fetchEventSource(`/api/psychological-chat/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Token': localStorage.getItem('token'),
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
            sessionId,
            userMessage,
        }),
        signal: ctrl.signal,
        // 连接建立回调
        onopen: (res) => {
            console.log(res)
            if (res.headers.get('Content-Type') !== 'text/event-stream') {
                ElMessage.error('返回的不是事件流格式')
            }
        },
        // 接收消息回调（流式接收）
        onmessage: (event) => {
            const raw = event.data.trim()
            if (!raw) {
                return
            }
            const eventName = event.event
            // 获取当前会话AI消息（列表最后一条）
            const aiMessage = messages.value[messages.value.length - 1]
            // 收到结束信号
            if (eventName === 'done') {
                isAiTyping.value = false
                ctrl.abort()
                // 进行情绪分析
                loadSessionEmotion(currentSession.value.sessionId)
                return
            }
            // 解析消息内容
            const payload = JSON.parse(raw)
            const ok = String(payload.code) === '200'
            if (ok && payload.data && payload.data.content) {
                aiMessage.content += payload.data.content
            } else if (!ok) {
                handleError(payload.message || 'AI回复错误')
            }
        },
        // 错误处理回调
        onerror: (error) => {
            handleError(error)
            throw error
        },
        // 连接关闭回调
        onclose: () => {
            // 开始情绪分析
            loadSessionEmotion(currentSession.value.sessionId)
        },
    })
}

/**
 * 错误处理函数
 * @param {Error|string} error - 错误对象或错误消息
 */
const handleError = (error) => {
    // 获取当前会话AI消息（列表最后一条）
    const aiMessage = messages.value[messages.value.length - 1]
    if (aiMessage) {
        aiMessage.content = 'Ai 回复错误,请重试'
    }
    isAiTyping.value = false
    ElMessage.error('Ai 回复错误,请重试')
}

/**
 * 获取会话列表（分页）
 */
const getSessionPage = () => {
    getSessionList({
        pageNum: 1,
        pageSize: 10,
    }).then(res => {
        // 处理后端可能不返回 records 的情况
        sessionList.value = res.records || []
    })
}

/**
 * 处理会话点击事件（加载历史会话）
 * @param {object} session - 会话对象
 */
const handleSessionClick = (session) => {
    // 获取会话详情（消息列表）
    getSessionDetail(session.id).then(res => {
        messages.value = res
    })
    // 加载会话情绪分析数据
    loadSessionEmotion(session.id)
    // 更新当前会话对象数据
    const sessionData = {
        sessionId: "session_" + session.id,
        status: 'ACTIVE',
        sessionTitle: session.sessionTitle,
    }
    currentSession.value = sessionData
}

/**
 * 删除会话
 * @param {string} sessionId - 会话ID
 */
const handleDeleteSession = (sessionId) => {
    deleteSession(sessionId).then(res => {
        ElMessage.success('删除成功')
        // 刷新会话列表
        getSessionPage()
    })
}

/**
 * 格式化消息内容（将换行符转为HTML换行）
 * @param {string} content - 消息内容
 * @returns {string} 格式化后的HTML内容
 */
const formatMessageContent = (content) => {
    return content.replace(/\n/g, '<br/>')
}

/**
 * 组件挂载时执行
 */
onMounted(() => {
    // 加载会话列表
    getSessionPage()
    // 创建新的前端临时会话
    createNewFrontendSession()
})
</script>
<style lang="scss" scoped>
/* 主容器样式 */
.consultation-container {
    margin: 0 auto;
    width: 1200px;
    display: flex;
    gap: 20px;
    padding: 20px;
    /* 左侧边栏 */
    .sidebar {
        width: 320px;
        .ai-assistant-info {
            margin-bottom: 20px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(251, 146, 60, 0.08);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            .breathing-circle {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 12px;
                animation: breathing 4s ease-in-out infinite;
                box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
                position: relative;
            }
            .assistant-name {
                font-size: 16px;
                font-weight: 700;
                background: linear-gradient(135deg, #fb923c, #f59e0b);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-align: center;
                background-clip: text;
                margin: 0 0 12px;
            }
            .online-status {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #059669;
                font-size: 12px;
                font-weight: 600;
                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #059669;
                    border-radius: 50%;
                    margin-right: 8px;
                    animation: pulse 2s infinite;
                    box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
                }
            }
        }
        .session-history {
            background: white;
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            min-height: 250px;
            display: flex;
            flex-direction: column;
            .section-title {
                font-size: 16px;
                font-weight: 600;
                color: #333;
                margin: 0 0 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                
            }
            .session-list {
                overflow-y: auto;
                max-height: 200px;
                scrollbar-width: thin;
                scrollbar-color: rgba(64, 150, 255, 0.3) transparent;
                .session-item {
                    position: relative;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px;
                    margin-bottom: 8px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    &:hover {
                        background: #f8f9ff;
                        border-color: #e6f0ff;
                    }
                    &.active {
                        background: #e6f0ff;
                        border-color: #4096ff;
                    }
                    .session-info {
                        flex: 1;
                        .session-title {
                            font-weight: 500;
                            font-size: 14px;
                            color: #333;
                            margin-bottom: 4px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            .session-meta {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                margin-bottom: 6px;
                                .session-time {
                                    font-size: 12px;
                                    color: #999;
                                }
                            }
                            .session-preview {
                                width: 200px;
                                font-size: 12px;
                                color: #666;
                                margin-bottom: 6px;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            }
                            .session-stats {
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                span {
                                    font-size: 12px;
                                    color: #999;
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                }
                            }
                        }
                        .session-actions {
                            position: absolute;
                            top: 10px;
                            right: 12px;
                        }
                    }
                }
                .no-sessions-text {
                    text-align: center;
                    font-size: 14px;
                    color: #999;
                }
            }
        }
        .emotion-garden {
            background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
            border-radius: 20px;
            padding: 16px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
            min-height: 300px;
            
            .garden-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                position: relative;
                z-index: 2;
                .garden-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #8b4513;
                }
            }
            .emotion-info {
                margin: 0 auto;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.8);
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
                color: #fff;
                .emotion-name {
                    font-size: 15px;
                    font-weight: 600;
                    line-height: 1;
                    margin-bottom: 2px;
                }
                .emotion-score {
                    font-size: 14px;
                    font-weight: 700;
                    opacity: 0.9;
                }
            }
            .warm-tips {
                text-align: center;
                margin-bottom: 16px;
                .emotion-status-text {
                    margin-bottom: 12px;
                    .status-label {
                        font-size: 14px;
                        color: #8b7355;
                        margin-right: 8px;
                    }
                    .status-emotion {
                        font-size: 16px;
                        font-weight: 600;
                        padding: 4px 12px;
                        border-radius: 16px;
                        display: inline-block;
                    }
                }
                .emotion-intensity {
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    .intensity-dots {
                        display: flex;
                        gap: 4px;
                        .dot {
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: #e0e0e0;
                            transition: all 0.3s ease;
                            &.active {
                                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                                transform: scale(1.2);
                                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
                            }
                        }
                    }
                    .intensity-text {
                        font-size: 12px;
                        color: #8b7355;
                        font-weight: 500;
                    }
                }
                .warm-suggestion {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
                    border-radius: 16px;
                    padding: 12px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
                    .suggestion-icon {
                        font-size: 20px;
                        flex-shrink: 0;
                        margin-top: 2px;
                    }
                    .suggestion-content {
                        text-align: left;
                        flex: 1;
                        .suggestion-title {
                            font-size: 14px;
                            font-weight: 600;
                            color: #8b7355;
                            margin-bottom: 6px;
                        }
                        .suggestion-text {
                            font-size: 13px;
                            color: #6b5b47;
                            line-height: 1.5;
                        }
                    }
                }
                .healing-actions {
                    margin-bottom: 16px;
                    .actions-title {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #8b7355;
                        margin-bottom: 16px;
                    }
                    .actions-list {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        .action-item {
                            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
                            border-radius: 12px;
                            padding: 12px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            border: 1px solid rgba(255, 255, 255, 0.5);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                            text-align: left;
                            .action-icon {
                                font-size: 14px;
                                color: #ffd700;
                                flex-shrink: 0;
                            }
                            .action-text {
                                font-size: 12px;
                                color: #6b5b47;
                                line-height: 1.4;
                                flex: 1;
                            }
                        }
                    }
                }
                .risk-notice {
                    background: linear-gradient(135deg, #fff9e6, #ffeaa7);
                    border-radius: 16px;
                    padding: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    border: 1px solid rgba(255, 234, 167, 0.6);
                    box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);
                    .notice-icon {
                        font-size: 20px;
                        flex-shrink: 0;
                        margin-top: 2px;
                    }
                    .notice-content {
                        flex: 1;
                        .notice-title {
                            font-size: 14px;
                            font-weight: 600;
                            color: #d4840f;
                            margin-bottom: 6px;
                        }
                        .notice-text {
                            font-size: 13px;
                            color: #b8740c;
                            line-height: 1.5;
                        }
                    }
                }
            }
        }
    }
    .chat-main {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
        border-radius: 20px;
        box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(251, 146, 60, 0.1);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;
        .chat-header {
            background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
            color: white;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            flex-shrink: 0;
            .header-left {
                display: flex;
                align-items: center;
                .chat-avatar {
                    width: 48px;
                    height: 48px;
                    background: rgba(255, 255, 255, 0.25);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    position: relative;
                    z-index: 1;
                }
                .chat-info {
                    h2 {
                        font-size: 20px;
                        font-weight: 700;
                        margin-bottom: 4px;
                    }
                    p {
                        font-size: 14px;
                    }
                }
            }
        }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
            min-height: 0;
            max-height: calc(100vh - 200px);
            scrollbar-width: thin;
            scrollbar-color: rgba(251, 146, 60, 0.3) transparent;
            .message-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: white;
                    flex-shrink: 0;
                }
                &.ai-message {
                    .message-avatar {
                        background: linear-gradient(135deg, #fb923c, #f59e0b);
                        box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
                    }
                }
                &.user-message {
                    .message-avatar {
                        background: linear-gradient(135deg, #6b7280, #4b5563);
                        box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
                    }
                }
                .message-content {
                    max-width: 70%;
                    .message-bubble {
                        background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
                        border-radius: 16px;
                        padding: 12px 16px;
                        position: relative;
                        animation: fadeInUp 0.4s ease-out;
                        border: 1px solid rgba(251, 146, 60, 0.1);
                        box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);
                        .typing-indicator {
                            display: flex;
                            gap: 4px;
                            padding: 8px 0;
                            .typing-dot {
                                width: 8px;
                                height: 8px;
                                background: #ccc;
                                border-radius: 50%;
                                animation: typing 1.5s ease-in-out infinite;
                                &:nth-child(2) {
                                    animation-delay: 0.2s;
                                }
                                &:nth-child(3) {
                                    animation-delay: 0.4s;
                                }   
                            }
                        }
                        /* 错误消息样式 */
                        .error-message {
                            background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
                            border: 1px solid #F87171;
                            border-radius: 12px;
                            padding: 12px 16px;
                            color: #991B1B;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                    }
                    .message-time {
                        font-size: 12px;
                        color: #999;
                        margin-top: 4px;
                    }
                }
            }
        }
        .chat-input {
            border-top: 1px solid rgba(251, 146, 60, 0.1);
            padding: 20px 24px;
            display: flex;
            gap: 12px;
            align-items: flex-end;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 252, 248, 0.7) 100%);
            backdrop-filter: blur(10px);
            flex-shrink: 0;
            .input-container {
                flex: 1;
            }
            .input-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 12px;
                color: #78716c;
                font-weight: 500;
            }
            .send-btn {
                height: 60px;
                width: 60px;
                border-radius: 16px;
                background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
                border: none !important;
                box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
                transition: all 0.3s ease;
            }

        }

    }
}
</style>