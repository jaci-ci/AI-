<template> 
    <!-- 知识库主容器 -->
    <div class="knowledge-container">
        <!-- 头部区域 - 展示标题和图标 -->
        <div class="header-section">
            <div class="header-content">
                <el-image :src="iconUrl" alt="知识库"style="width: 60px; height: 60px;"/>
                <h1>知识库</h1>
            </div>
        </div>
        
        <!-- 主体内容区域 -->
        <div class="content">
            <!-- 左侧推荐文章列表 -->
            <div class="recommend-section">
                <div class="section-title">推荐文章</div>
                <div class="recommend-list">
                    <!-- 推荐文章项 - 按阅读量排序 -->
                    <div v-for="item in recommendList" :key="item.id" class="recommend-item" @click="goToArticle(item.id)">
                        <h4>{{ item.title }}</h4>
                        <p class="read-count">
                            <el-icon><Histogram /></el-icon>
                            阅读量: {{ item.readCount }}
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- 右侧文章列表 -->
            <div class="article-list">
                <!-- 文章卡片 - 展示封面、标题、分类、作者、时间、阅读量 -->
                <div class="article-item" v-for="item in articleList" :key="item.id" @click="goToArticle(item.id)">
                    <el-image :src="getImage(item.coverImage)" alt="文章封面" style="width: 240px; height: 150px;"/>
                    <div class="info">
                        <div class="title">
                            <h3>{{ item.title }}</h3>
                            <el-tag Plain type="primary">{{ item.categoryName }}</el-tag>
                        </div>
                        <div style="margin-top: 10px;">
                            <div class="flex-box">
                                <el-icon><Avatar /></el-icon>
                                <span>{{ item.authorName }}</span>
                            </div>
                            <div class="flex-box">
                                <el-icon><List /></el-icon>
                                <span>{{ dayjs(item.updatedAt).format('YYYY-MM-DD') }}</span>
                            </div>
                        </div>
                        <div style="margin-top: 10px;">
                            <div class="flex-box">
                                <el-icon><Platform /></el-icon>
                                <span>观看人数{{ item.readCount }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 分页组件 -->
        <div class="pagination-wrapper">
            <el-pagination
                style="margin-top: 25px;"
                layout="prev, pager, next"
                :total="pagination.total"
                :page-size.sync="pagination.size"
                @change="handleChange"
            />
        </div>
    </div>
</template>
<script setup>
// 导入Vue核心模块
import { ref, onMounted } from 'vue'
// 导入API接口
import { getKnowledgeList } from '../api/frontend'
// 导入element-plus工具函数
import { dayjs } from 'element-plus'
// 导入路由
import { useRouter } from 'vue-router'

// 初始化路由实例
const router = useRouter()

// 知识库图标路径
const iconUrl = new URL('../assets/images/book.png', import.meta.url).href

// 推荐文章列表（按阅读量排序，取前5条）
const recommendList = ref([])

// 分页参数配置
const pagination = ref({
    currentPage: 1,  // 当前页码
    pageSize: 10,    // 每页条数
    total: 0,        // 总记录数
})

// 文章列表数据
const articleList = ref([])

/**
 * 获取文章列表数据
 * 按发布时间倒序排列
 */
const getPageList = () => {
    const params = {
        sortField: 'publishedAt',    // 排序字段
        sortDirection: 'desc',       // 排序方向
        ...pagination.value          // 分页参数
    }
    getKnowledgeList(params).then(res => {
        articleList.value = res.records  // 文章列表数据
        pagination.value.total = res.total // 总记录数
    })
}

/**
 * 获取文章封面图片URL
 * @param {string} url - 图片路径
 * @returns {string} 完整图片URL
 */
const getImage = (url) => {
    return url ? 'http://159.75.169.224:1235' + url : new URL('../assets/images/book.png', import.meta.url).href
}

/**
 * 分页切换处理
 * @param {number} page - 当前页码
 */
const handleChange = (page) => {
    pagination.value.currentPage = page
    getPageList()
}

/**
 * 跳转到文章详情页
 * @param {number} id - 文章ID
 */
const goToArticle = (id) => {
    router.push(`/knowledge/article/${id}`)
}

/**
 * 组件挂载时执行
 * 1. 获取文章列表（按发布时间排序）
 * 2. 获取推荐文章（按阅读量排序，取前5条）
 */
onMounted(() => {
    const params = {
        sortField: 'readCount',    // 按阅读量排序
        sortDirection: 'desc',     // 倒序
        currentPage: 1,            // 第1页
        size: 5,                   // 取5条
    }
    getPageList()  // 获取文章列表
    getKnowledgeList(params).then((res) => {
        recommendList.value = res.records  // 获取推荐文章
    })
})
</script>
<style lang="scss" scoped>
.knowledge-container {
    background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);
    .flex-box {
        display: flex;
        align-items: center;
        span {
            margin-left: 10px;
        }
    }
    .header-section {
        background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
        color: white;
        padding: 48px;
        .header-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
    }
    .content {
        display: flex;
        gap: 20px;
        margin: 0 auto;
        width: 1200px;
        padding: 20px;
        .recommend-section {
            width: 280px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            padding: 15px;
            height: 400px;
            .section-title {
                font-size: 12;
                font-weight: 600;
                color: #374151;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .recommend-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                .recommend-item {
                    border-left: 4px solid #f59e0b;
                    padding-left: 10px;
                    cursor: pointer;
                    .read-count {
                        margin-top: 15px;
                        font-size: 12px;
                        color: #6b7280;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                }
            }
        }
        .article-list {
            flex: 1;
            .article-item {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                padding: 15px;
                margin-bottom: 20px;
                display: flex;
                .info {
                    margin-left: 20px;
                    .title {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                }
            }
        }
    }
    .pagination-wrapper {
        display: flex;
        justify-content: center;
        padding-bottom: 30px;
    }
}
</style>