<template>
    <div class="frontend-layout">
        <div class="navbar-container">
            <div class="brand-section">
                <el-image style="width: 50px; height: 50px;" :src="iconUrl" alt="logo" class="brand-logo" />
                <h1 class="brand-name">云策 AI</h1>
            </div>
            <div class="nav-section">
                <router-link to="/" class="nav-link">首页</router-link>
                <router-link to="/consultation" class="nav-link" v-if="isLoggedin">智能对话</router-link>
                <router-link to="/emotion-diary" class="nav-link" v-if="isLoggedin">随手记</router-link>
                <router-link to="/knowledge" class="nav-link">知识库</router-link>
                <router-link to="/focus-timer" class="nav-link" v-if="isLoggedin">专注计时</router-link>
                <router-link to="/ai-write" class="nav-link" v-if="isLoggedin">AI写作</router-link>
                <!-- 用户菜单 -->
                <template v-if="isLoggedin">
                    <el-dropdown @command="handleUserCommand" trigger="click">
                        <el-avatar :size="32" :src="userAvatar" class="user-avatar-nav" />
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="profile">
                                    <el-icon><User /></el-icon> 个人中心
                                </el-dropdown-item>
                                <el-dropdown-item command="logout" divided>
                                    <el-icon><SwitchButton /></el-icon> 退出登录
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template v-else>
                    <router-link to="/auth/login" class="nav-link">登录</router-link>
                    <router-link to="/auth/register" class="nav-link">
                        <el-button type="primary">注册</el-button>
                    </router-link>
                </template>
            </div>
        </div>
        <div class="main-container">
            <router-view></router-view>
        </div>
        <div class="footer-container">
            <div class="footer-bottom">
                <p>&copy; 云策 AI · 智能工作平台 2026</p>
            </div>
        </div>
    </div>
</template>
<script setup>

import { ref, onMounted, computed } from 'vue'
import { logout } from '../api/admin'
import { useRouter } from 'vue-router'

const router = useRouter()

const iconUrl = new URL('../assets/images/机器人.png', import.meta.url).href

const isLoggedin = ref(false)
const userInfo = ref({})

const userAvatar = computed(() => {
  return userInfo.value.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

// 用户菜单命令
const handleUserCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    handleLogout()
  }
}

//登出
const handleLogout = () => {
    logout().then(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/auth/login')
    })
}

onMounted(() => {
    isLoggedin.value = localStorage.getItem('token') !== null
    const stored = localStorage.getItem('userInfo')
    if (stored) {
        try { userInfo.value = JSON.parse(stored) } catch {}
    }
})

</script>
<style lang="scss" scoped>
.frontend-layout {
    background-color: #fff;

    .navbar-container {
        max-width: 1200px;
        height: 100%;
        margin: 0 auto;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .brand-section {
            display: flex;
            align-items: center;

            .brand-name {
                margin-left: 10px;
                font-size: 24px;
                font-weight: 600;
                color: #333;
            }
        }

        .nav-section {
            display: flex;
            align-items: center;
            gap: 40px;

            .nav-link {
                color: #4b5563;
                font-size: 16px;
                font-weight: 500;

                &:hover {
                    color: var(--color-primary);
                }
            }
        }
    }

    .footer-container {
        background: #1f2937;
        color: white;
        padding: 15px 0;
        margin-top: auto;

        .footer-bottom {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 10px;
            text-align: center;
        }
    }
}
</style>