<!--
 * Navbar 导航栏组件
 * 功能：顶部导航栏，包含侧边栏折叠按钮、页面标题、用户信息和退出登录功能
-->
<template> 
    <div class="navbar" >
        <div class="flex-box">
            <el-button  @click="handleCollapse">
                <el-icon><Expand v-if="!isCollapse"/><Fold v-else /></el-icon>
            </el-button>
            <p class="page-title">{{ route.meta.title }}</p>
        </div>
        <div class="flex-box">
            <el-dropdown @command="handleCommand">
                <div class="flex-box">
                    <el-avatar :src="userAvatar"></el-avatar>
                    <p class="user-name">{{ userName }}</p>
                    <el-icon><ArrowDown /></el-icon>
                </div>
              <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>   
              </template>
            </el-dropdown>
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue'
// Element Plus 图标组件
import { Expand, ArrowDown, Fold } from '@element-plus/icons-vue'
// Pinia 状态管理：侧边栏折叠状态
import { useAdminStore } from '../stores/admin'

const adminStore = useAdminStore()
const isCollapse = computed(() => adminStore.isCollapse)
// Vue Router 路由实例
import { useRouter, useRoute } from 'vue-router'
// Element Plus 消息确认框组件
import {ElMessageBox} from 'element-plus'
// 后台API：退出登录接口
import { logout } from '../api/admin'

// 路由实例
const router = useRouter()
// 当前路由信息
const route = useRoute()

// 从 localStorage 读取用户信息
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const userName = userInfo.nickname || userInfo.username || '用户'
const userAvatar = userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

/**
 * 处理下拉菜单命令
 * @param {string} command - 菜单命令
 */
const handleCommand = (command) => {
   if(command === 'logout'){
    // 退出登录
    ElMessageBox.confirm('确定退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 确认退出登录
        logout().then(() => {
            // 清除token和userInfo
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            // 退出登录后，跳转到登录页
            router.push('/auth/login')
        })
    })
   }
}
/**
 * 切换侧边栏折叠状态
 */
const handleCollapse = () => {
    adminStore.toggleCollapse()
}
</script>
<style lang="scss" scoped>
/* 导航栏样式 */
.navbar{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    background-color: #f5f5f5;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    /* 弹性布局容器 */
    .flex-box{
        display: flex;
        align-items: center;
        justify-content: center;
    }
    /* 页面标题样式 */
    .page-title{
        margin-left: 20px;
        font-size: 26px;
        font-weight: bold;
        color: #333;
    }
}

</style>