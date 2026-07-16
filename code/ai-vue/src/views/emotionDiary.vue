<!--
  随手记（原情绪日记改造）
  改为通用笔记录入：标题 + 分类标签 + 内容 + 可选状态记录
-->
<template>
    <div class="note-container">
        <div class="header-section">
            <div class="header-content">
                <el-image :src="iconUrl" style="width: 60px; height: 60px;" />
                <h1>随手记</h1>
            </div>
            <p class="header-desc">记录日常灵感、笔记与状态</p>
        </div>
        <div class="content">
            <!-- 笔记标题 -->
            <div class="note-card">
                <div class="title">笔记标题</div>
                <div class="section">
                    <el-input
                        v-model="diaryForm.title"
                        placeholder="给这篇笔记起个标题..."
                        size="large"
                        maxlength="100"
                        show-word-limit
                    />
                </div>
            </div>
            <!-- 笔记分类 -->
            <div class="note-card">
                <div class="title">笔记分类</div>
                <div class="tag-grid">
                    <div
                        v-for="item in categoryOptions"
                        :key="item.name"
                        class="tag-card"
                        :class="{ selected: item.name === diaryForm.category }"
                        @click="diaryForm.category = item.name"
                    >
                        <el-icon :size="24"><component :is="item.icon" /></el-icon>
                        <div class="tag-name">{{ item.name }}</div>
                    </div>
                </div>
            </div>
            <!-- 详情记录 -->
            <div class="note-card">
                <div class="title">笔记内容</div>
                <div class="detail-form">
                    <div class="form-group">
                        <div class="form-label">内容摘要</div>
                        <el-input v-model="diaryForm.emotionTriggers" placeholder="简单概括一下内容要点..." type="textarea" :rows="2" show-word-limit maxlength="500" />
                    </div>
                    <div class="form-group">
                        <div class="form-label">正文</div>
                        <el-input v-model="diaryForm.diaryContent" placeholder="写下你想记录的内容..." type="textarea" :rows="6" show-word-limit maxlength="2000" />
                    </div>
                    <!-- 状态记录（可选） -->
                    <div class="life-indicators">
                        <div class="indicator-group">
                            <div class="form-label">精力状态</div>
                            <el-select v-model="diaryForm.sleepQuality" placeholder="可选">
                                <el-option label="😫 很低" value="1" />
                                <el-option label="😐 较低" value="2" />
                                <el-option label="🙂 一般" value="3" />
                                <el-option label="😊 良好" value="4" />
                                <el-option label="⚡ 充沛" value="5" />
                            </el-select>
                        </div>
                        <div class="indicator-group">
                            <div class="form-label">工作强度</div>
                            <el-select v-model="diaryForm.stressLevel" placeholder="可选">
                                <el-option label="轻松" value="1" />
                                <el-option label="适中" value="2" />
                                <el-option label="一般" value="3" />
                                <el-option label="较忙" value="4" />
                                <el-option label="超负荷" value="5" />
                            </el-select>
                        </div>
                    </div>
                    <div class="action-buttons">
                        <el-button @click="resetForm">重置</el-button>
                        <el-button type="primary" @click="submit">保存笔记</el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { addEmotionDiary } from '../api/frontend'
import { ElMessage } from 'element-plus'

// 笔记分类选项
const categoryOptions = [
    { name: '工作', icon: 'Briefcase' },
    { name: '学习', icon: 'Reading' },
    { name: '生活', icon: 'Sunny' },
    { name: '灵感', icon: 'MagicStick' },
    { name: '技术', icon: 'Monitor' },
    { name: '其他', icon: 'More' },
]

const diaryForm = reactive({
    title: '',
    category: '',
    emotionTriggers: '',
    diaryContent: '',
    sleepQuality: null,
    stressLevel: null,
    dominantEmotion: '',  // 兼容后端字段
    moodScore: 5,         // 默认值，兼容后端
    diaryDate: new Date().toISOString().slice(0, 10),
})

const resetForm = () => {
    diaryForm.title = ''
    diaryForm.category = ''
    diaryForm.emotionTriggers = ''
    diaryForm.diaryContent = ''
    diaryForm.sleepQuality = null
    diaryForm.stressLevel = null
    diaryForm.dominantEmotion = diaryForm.category
    diaryForm.moodScore = 5
}

const submit = () => {
    if (!diaryForm.title.trim()) {
        ElMessage.warning('请输入笔记标题')
        return
    }
    if (!diaryForm.diaryContent.trim()) {
        ElMessage.warning('请输入笔记内容')
        return
    }

    // 将分类映射到后端字段
    diaryForm.dominantEmotion = diaryForm.category || '其他'
    diaryForm.moodScore = 5

    addEmotionDiary(diaryForm).then(() => {
        ElMessage.success('笔记保存成功')
        resetForm()
    })
}

const iconUrl = new URL('../assets/images/like.png', import.meta.url).href
</script>
<style lang="scss" scoped>
.note-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;

    .header-section {
        text-align: center;
        margin-bottom: 32px;

        .header-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            h1 { font-size: 28px; color: var(--color-text-primary); }
        }

        .header-desc {
            color: var(--color-text-secondary);
            margin-top: 8px;
        }
    }
}

.note-card {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    padding: 24px;
    margin-bottom: 16px;

    .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--color-border-light);
    }
}

.tag-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
}

.tag-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 8px;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
    color: var(--color-text-regular);

    &.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-bg);
        color: var(--color-primary);
    }

    &:hover { border-color: var(--color-primary-light); }

    .tag-name { font-size: 13px; }
}

.detail-form {
    .form-group {
        margin-bottom: 16px;
    }

    .form-label {
        font-size: 14px;
        color: var(--color-text-regular);
        margin-bottom: 8px;
        font-weight: 500;
    }
}

.life-indicators {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;

    .indicator-group {
        .form-label {
            font-size: 14px;
            color: var(--color-text-regular);
            margin-bottom: 8px;
            font-weight: 500;
        }

        .el-select { width: 100%; }
    }
}

.action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 8px;
}

@media (max-width: 480px) {
    .tag-grid { grid-template-columns: repeat(3, 1fr); }
    .life-indicators { grid-template-columns: 1fr; }
}
</style>
