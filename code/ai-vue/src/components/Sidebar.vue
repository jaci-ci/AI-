<template>
    <!-- 侧边栏组件：提供系统导航菜单，支持折叠/展开状态切换 -->
    <el-aside :width="isCollapse?'64px':'264px'">
        <!-- 
            el-menu 属性说明：
            - collapse: 控制菜单折叠状态，由 store 管理
            - collapse-transition: 关闭折叠过渡动画（提升性能）
            - default-active: 默认选中的菜单项
        -->
        <el-menu :collapse="isCollapse" :collapse-transition="false" default-active="2" class="menu-style">
            <!-- 品牌标识区域：显示系统Logo和名称 -->
            <div class="brand">
                <!-- 系统Logo图片 -->
                <el-image style="width: 50px; height: 50px; margin-right: 10px;" :src="iconUrl" alt="logo"></el-image>
                <!-- 品牌信息卡片：折叠状态下隐藏 -->
                <div v-show="!isCollapse" class="info-card">
                    <h1 class="brand.title">云策 AI</h1>
                    <p class="brand.subtile">管理后台</p>
                </div>
            </div>
            <!-- 动态菜单项：从路由配置中自动生成 -->
            <el-menu-item 
                @click="selectMenu" 
                v-for="item in router.options.routes[0].children" 
                :key="item.path" 
                :index="item.path"
            >
                <!-- 菜单项图标：动态渲染路由元信息中的图标组件 -->
                <el-icon>
                    <component :is="item.meta.icon" />
                </el-icon>
                <!-- 菜单项文本 -->
                <span>{{ item.meta.title }}</span>
            </el-menu-item>
        </el-menu>
    </el-aside>
</template>


<script setup>
/**
 * Sidebar 侧边栏组件
 * 功能：提供系统导航菜单，支持折叠/展开状态管理
 * 依赖：Vue Router、Pinia状态管理
 */

// 导入Vue组合式API
import { computed } from 'vue'
// 导入Vue Router路由实例
import { useRouter } from 'vue-router'
// 导入Pinia状态管理store
import { useAdminStore } from '../stores/admin'

// 初始化路由实例
const router = useRouter()

// 系统Logo路径：使用Vite的URL解析器处理静态资源
const iconUrl = new URL('@/assets/images/机器人.png', import.meta.url).href

/**
 * 侧边栏折叠状态：从admin store中读取
 * 使用computed实现响应式依赖追踪
 */
const isCollapse = computed(() => useAdminStore().isCollapse)

/**
 * 菜单项点击处理函数
 * @param {Object} key - 菜单项信息，包含index属性（路由路径）
 */
const selectMenu = (key) => {
    // 获取一级路由配置
    const currentRoute = router.options.routes[0]
    // 导航到对应的子路由
    router.push(`${currentRoute.path}/${key.index}`)
}
</script>

<style scoped lang="scss">
// 侧边栏菜单样式
.menu-style {
    height: 100%;
    
    // 品牌标识区域样式
    .brand {
        display: flex;          // 弹性布局
        align-items: center;    // 垂直居中
        padding: 10px;         // 内边距
        background-color: #fff; // 白色背景
        border-bottom: 1px solid #e5e7eb; // 底部分隔线
        
        // 品牌信息卡片样式
        .info-card {
            display: flex;
            flex-direction: column; // 垂直排列
            
            // 品牌标题样式
            .brand.title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 2px;
                color: #1f2937; // 深灰色
            }

            // 品牌副标题样式
            .brand.subtile {
                font-size: 12px;
                color: #6b7280; // 浅灰色
            }
        }
    }
}
</style>