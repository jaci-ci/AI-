<template>
    <!-- 主容器 -->
    <div class="container">
        <!-- 标题区域 -->
        <div class="title">
            <!-- 返回首页链接 -->
            <div class="back-home">
                <el-icon><Back/></el-icon>
                <span @click="router.push('/')">返回首页</span>
            </div>
            <!-- 登录标题和描述 -->
            <div class="title-text">
                <h2>登录您的账户</h2>
                <p>输入您的登录信息</p>
            </div>
        </div>
        <!-- 登录表单区域 -->
        <div class="form-container">
            <el-form
            ref="ruleFormRef"
            :model="formData"
            rules="rules"
            label-position="top"
            >
            <!-- 用户名/邮箱输入框 -->
            <el-form-item label="用户名或邮箱" prop="username">
                <el-input v-model="formData.username" size="large" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <!-- 密码输入框 -->
            <el-form-item label="密码" prop="password">
                <el-input v-model="formData.password" size="large" placeholder="请输入密码" type="password" show-password></el-input>
            </el-form-item>
            <!-- 登录按钮 -->
            <el-button class="btn" size="large" type="primary" @click="submitForm(ruleFormRef)">登录</el-button>
            </el-form>
            <!-- 注册链接 -->
            <div class="footer">
                <p>还没有账户？<router-link to="/auth/register">去注册</router-link></p>
            </div>
        </div>
    </div>
</template>
<script setup>
/**
 * 登录页面组件
 * 功能：提供用户登录功能，验证用户输入，调用登录API，并根据用户角色跳转到相应页面
 */
import { ref, reactive } from 'vue'
import { login } from '../api/admin'
import { useRouter } from 'vue-router'

// 表单引用，用于调用表单验证方法
const ruleFormRef = ref()

// 表单数据对象
const formData = reactive({
    username: '',   // 用户名或邮箱
    password: ''    // 密码
})

// 表单验证规则
const rules = reactive({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
})

// 路由实例，用于页面跳转
const router = useRouter()

/**
 * 提交登录表单
 * @param {Object} formEl - 表单实例引用
 */
const submitForm = async (formEl) => {
    // 如果表单实例不存在则返回
    if (!formEl) return;

    // 验证表单数据
    await formEl.validate((valid, fields) => {
        if (valid) {
            // 调用登录接口
           login(formData).then(data => {
            // 检查登录是否成功（token不存在则失败）
            if(!data.token){
                return console.error('登录失败')
            }

            // 登录成功，将token和userInfo存储到localStorage
            localStorage.setItem('token', data.token)
            localStorage.setItem('userInfo', JSON.stringify(data.userInfo))

            // 根据用户角色判断跳转路径
            // userType为2表示管理员，跳转到管理后台
            if(data.userInfo.userType === 2){
                router.push('/back/dashboard')
            }else{
                // 普通用户跳转到首页
                router.push('/')
            }
           })
        }
    });
};
</script>
<style lang="scss" scoped>
/* 主容器样式 - 固定宽度384px */
.container{
    width:384px;

    /* 标题区域样式 */
    .title{
        /* 返回首页链接样式 */
        .back-home{
            margin-bottom: 60px;
        }

        /* 标题文本样式 - 居中显示 */
        .title-text{
            text-align: center;

            h2{
            margin-bottom: 10px;
            font-size: 36px;
            }

            p{
                font-size: 18px;
                color:#666;
            }
        }

    }

    /* 表单容器样式 */
    .form-container{
        margin-top: 30px;

        /* 登录按钮样式 - 全宽 */
        .btn{
            margin-top: 40px;
            width: 100%;
        }

        /* 页脚样式 - 居中 */
        .footer{
            margin-top: 30px;
            text-align: center;
        }
    }
}
</style>