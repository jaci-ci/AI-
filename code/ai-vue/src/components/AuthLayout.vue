<template>
    <div class="auth-layout">
        <div class="left-section">
            <div class="content">
                <h2 class="title">云策 AI</h2>
                <p class="text">智能对话，高效生活。AI驱动的个人效率与知识管理平台，让每一天都更加从容</p>
                <div class="robot">
                    <el-image style="width: 90px; height: 90px;" :src="iconUrl" alt="云策 AI" />
                </div>
            </div>
        </div>
        <div class="right-section">
            <router-view></router-view>
        </div>

    </div>
</template>

<script setup>
const iconUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href
</script>

<style scoped lang="scss">
.auth-layout {
    display: flex;

    .left-section {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
        background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #6366F1 100%);
        height: 100vh;

        .content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .title {
                margin-bottom: 20px;
                font-size: 40px;
                font-weight: bold;
                color: #fff;
            }

            .text {
                margin-bottom: 20px;
                width: 460px;
                font-size: 20px;
                color: #fff;
                text-align: center;
            }

            .robot {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 160px;
                height: 160px;
                border-radius: 50%;
                border: 2px solid rgba(255, 255, 255, 0.2);
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
        }
    }

    .right-section {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
        height: 100vh;
        background-color: #fff;
    }
}
</style>