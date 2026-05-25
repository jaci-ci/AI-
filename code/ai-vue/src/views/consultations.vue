<template>
    <!-- 咨询记录页面 -->
    <div class="consultations-wrapper">
        <!-- 页面头部组件 -->
        <PageHead title="咨询记录" />
        
        <!-- 咨询会话列表表格 -->
        <el-table :data="tableData" style="width: 100%">
            <!-- 会话ID列 - 显示用户昵称头像 -->
            <el-table-column label="会话ID" prop="createTime" width="100">
                <template #default="scope">
                    <el-avatar>{{scope.row.userNickname}}</el-avatar>
                </template>
            </el-table-column>
            <!-- 情绪日志列 - 显示会话标题和最后消息预览 -->
            <el-table-column label="情绪日志">
                <template #default="scope">
                    <div class="session-title">{{scope.row.sessionTitle}}</div>
                    <div class="session-preview">{{scope.row.lastMessageContent}}</div>
                </template>
            </el-table-column>
            <!-- 消息数列 -->
            <el-table-column prop="messageCount" label="消息数" width="100"/>
            <!-- 最后消息时间列 -->
            <el-table-column prop="lastMessageTime" label="时间" width="100"/>
            <!-- 操作列 - 详情按钮 -->
            <el-table-column label="操作" width="100">
                <template #default="scope">
                    <el-button type="primary" text @click="viewSessionDetail(scope.row)">详情</el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <!-- 分页组件 -->
        <el-pagination
        style="margin-top: 25px;"
        :page-size="pagination.size"
        layout="prev, pager, next"
        :total="pagination.total"
        @change="handleChange" >
        </el-pagination>
        
        <!-- 会话详情弹窗 -->
        <el-dialog 
        v-model="showDetailDialog"
        title="咨询会话详情"
        width="70%"
        :close-on-click-modal="false"
        >
            <div class="session-detail">
                <!-- 会话基本信息 -->
                <div class="detail-header">
                    <div class="detail-row">
                        <div class="detail-label">用户：</div>
                        <div class="detail-value">{{ sessionDetail.userNickname  }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">开始时间：</div>
                        <div class="detail-value">{{ sessionDetail.startedAt }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">消息数：</div>
                        <div class="detail-value">{{ sessionDetail.messageCount }}</div>
                    </div>
                </div>
                <!-- 消息列表容器 -->
                <div class="messages-container">
                    <div class="messages-header">
                        <h4>对话记录</h4>
                    </div>
                    <!-- 消息列表（带加载状态） -->
                    <div class="messages-list" v-loading="loadingMessages">
                        <div 
                            class="message-item" 
                            v-for="item in sessionMessages" 
                            :key="item.id" 
                            :class="item.senderType===1?'user-message':'ai-message'"
                        >
                            <div class="message-header">
                                <span class="sender">{{ item.senderType===1?'用户':'AI助手' }}</span>
                                <span class="time">{{ item.createdAt }}</span>
                            </div>
                            <div class="message-content">
                                {{ item.content }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 弹窗底部按钮 -->
            <template #footer> 
                <el-button @click="showDetailDialog = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
// 导入Vue 3响应式API
import { ref, reactive, onMounted } from 'vue'
// 导入页面头部组件
import PageHead from '../components/PageHead.vue'
// 导入API接口函数
import { getConsultationPage, getSessionDetail } from '../api/admin'

/**
 * 咨询会话列表数据
 * @type {ref<Array>} - 存储会话列表
 */
const tableData = ref([])

/**
 * 分页参数
 * @type {ref<Object>}
 * @property {number} total - 总记录数
 * @property {number} size - 每页大小
 * @property {number} currentPage - 当前页码
 */
const pagination = ref({
    total: 0,
    size: 10,
    currentPage: 1
})

/**
 * 会话详情信息
 * @type {ref<Object>} - 存储选中会话的基本信息
 */
const sessionDetail = ref({})

/**
 * 会话消息列表
 * @type {ref<Array>} - 存储会话的详细消息记录
 */
const sessionMessages = ref([])

/**
 * 消息加载状态
 * @type {ref<boolean>} - 控制消息列表的加载动画
 */
const loadingMessages = ref(false)

/**
 * 详情弹窗显示状态
 * @type {ref<boolean>} - 控制弹窗的显示与隐藏
 */
const showDetailDialog = ref(false)

/**
 * 查看会话详情
 * @param {Object} row - 会话列表项数据
 */
const viewSessionDetail = (row) => { 
    // 显示加载状态
    loadingMessages.value = true
    // 打开详情弹窗
    showDetailDialog.value = true
    // 请求会话消息详情
    getSessionDetail(row.id).then(res => { 
        loadingMessages.value = false
        sessionMessages.value = res
        sessionDetail.value = row
    })
}

/**
 * 分页切换处理
 * @param {number} page - 目标页码
 */
const handleChange = (page) => {
    pagination.currentPage = page
    handleSearch()
}

/**
 * 查询会话列表
 */
const handleSearch = () => { 
    getConsultationPage(pagination).then(res => {
        const { records, total } = res
        tableData.value = records
        pagination.total = total
    })
}

/**
 * 组件挂载时初始化查询
 */
onMounted(() => { 
    handleSearch()
})

</script>
<style lang="scss" scoped>
 .session-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }
  .session-preview {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .session-detail {
    max-height: 70vh;
    overflow-y: auto;
    .detail-header {
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .detail-row {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      :last-child {
        margin-bottom: 0;
      }
      .detail-label {
        font-weight: 500;
        color: #495057;
        min-width: 80px;
        margin-right: 8px;
      }

      .detail-value {
        color: #333;
      }
    }
  }
  .messages-container {
    margin-top: 20px;
    .messages-header {
      margin-bottom: 16px;
      h4 {
        margin: 0;
        color: #333;
        font-size: 16px;
        font-weight: 500;
      }
    }
    .messages-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 16px;
      background: #fff;
      .message-item {
        margin-bottom: 12px;
        padding: 12px;
        border-radius: 8px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        :last-child {
          margin-bottom: 0;
        }
        &.user-message {
          background: #e8f4fd;
        }

        &.ai-message {
          background: #f0f9f0;
        }
      }
      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        .sender {
          font-weight: 500;
          color: #333;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .time {
          font-size: 12px;
          color: #999;
        }

        .message-content {
          color: #333;
          line-height: 1.6;
          white-space: pre-wrap;
          margin-top: 8px;
          font-size: 14px;
        }
      }
    }
  }
</style>