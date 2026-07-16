<template>
    <div class="dashboard-container">
        <!-- 顶部统计卡片区域：4 个卡片展示系统概览数据 -->
        <el-row :gutter="20">
            <!-- 总用户数卡片 -->
            <el-col :span="6">
                <el-card v-if="aiData.systemOverview">
                    <div class="card-content">
                        <div class="avatar users">
                            <el-image style="width: 40px; height: 40px;" :src="iconUrl1" alt="用户" />
                        </div>
                        <div class="info">
                            <p class="title">总用户数</p>
                            <p class="number">{{ aiData.systemOverview.totalUsers || 0 }}</p>
                            <p class="subtitle-title">活跃用户:{{ aiData.systemOverview.activeUsers || 0 }}</p>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <!-- 情绪日志卡片 -->
            <el-col :span="6">
                <el-card v-if="aiData.systemOverview">
                    <div class="card-content">
                        <div class="avatar like">
                            <el-image style="width: 40px; height: 40px;" :src="iconUrl2" alt="用户" />
                        </div>
                        <div class="info">
                            <p class="title">笔记日志</p>
                            <p class="number">{{ aiData.systemOverview.totalDiaries || 0 }}</p>
                            <p class="subtitle-title">今日新增:{{ aiData.systemOverview.todayNewDiaries || 0 }}</p>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <!-- 咨询会话卡片 -->
            <el-col :span="6">
                <el-card v-if="aiData.systemOverview">
                    <div class="card-content">
                        <div class="avatar comments">
                            <el-image style="width: 40px; height: 40px;" :src="iconUrl3" alt="用户" />
                        </div>
                        <div class="info">
                            <p class="title">对话会话</p>
                            <p class="number">{{ aiData.systemOverview.totalSessions || 0 }}</p>
                            <p class="subtitle-title">今日新增:{{ aiData.systemOverview.todayNewSessions || 0 }}</p>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <!-- 评价情绪卡片 -->
            <el-col :span="6">
                <el-card v-if="aiData.systemOverview">
                    <div class="card-content">
                        <div class="avatar smile">
                            <el-image style="width: 40px; height: 40px;" :src="iconUrl4" alt="用户" />
                        </div>
                        <div class="info">
                            <p class="title">综合评分</p>
                            <p class="number">{{ aiData.systemOverview.avgMoodScore || 0 }}/10</p>
                            <p class="subtitle-title">用户满意度</p>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <!-- 中间图表区域：情绪趋势分析 + 咨询会话统计 -->
        <el-row style="margin-top: 20px;" :gutter="20">
            <!-- 情绪趋势分析图表 -->
            <el-col :span="12">
                <el-card style="width: 100%;">
                    <template #header>
                        <div class="card-header">
                            数据趋势分析
                        </div>
                    </template>
                    <div class="chart-content">
                        <div ref="emotionChartRef" style="width: 100%; height: 300px;"></div>
                    </div>
                </el-card>
            </el-col>
            <!-- 咨询会话统计图表 -->
            <el-col :span="12">
                <el-card style="width: 100%;">
                    <template #header>
                        <div class="card-header">
                            对话会话统计
                        </div>
                    </template>
                    <div class="chart-content">
                        <!-- 咨询统计数据显示 -->
                        <div v-if="aiData.consultationStats" class="consultation-stats">
                            <div class="stat-item">
                                <div class="stat-label">总会话数</div>
                                <div class="stat-value">{{ aiData.consultationStats.totalSessions }}</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">评价时长</div>
                                <div class="stat-value">{{ aiData.consultationStats.avgDurationMinutes }}分钟</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-label">活跃用户</div>
                                <div class="stat-value">{{ aiData.systemOverview.activeUsers }}</div>
                            </div>
                        </div>
                        <!-- 咨询活动趋势图表 -->
                        <div ref="consultationChartRef" style="width: 100%; height: 260px;"></div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <!-- 底部图表区域：用户活跃度趋势 -->
        <el-row style="margin-top: 20px;">
            <el-card style="width: 100%;">
                <template #header>
                    <div class="card-header">
                        用户活跃度趋势
                    </div>
                </template>
                <div class="chart-content">
                    <div ref="userActivityChartRef" style="width: 100%; height: 300px;"></div>
                </div>
            </el-card>
        </el-row>
    </div>
</template>
<script setup>
/**
 * 仪表盘页面
 * 功能：展示云策 AI · 智能工作平台的系统概览、情绪趋势、咨询会话统计和用户活跃度数据
 */
import { ref, reactive, toRefs, watch, onMounted } from 'vue'
// 导入 API 接口：获取分析概览数据
import { getAnalyticslOverview } from '../api/admin.js'

// 导入统计卡片图标资源
const iconUrl1 = new URL('../assets/images/users.png', import.meta.url).href
const iconUrl2 = new URL('../assets/images/like.png', import.meta.url).href
const iconUrl3 = new URL('../assets/images/comments.png', import.meta.url).href
const iconUrl4 = new URL('../assets/images/smile.png', import.meta.url).href
// 导入 ECharts 图表库
import * as echarts from 'echarts'

// 存储仪表盘数据的响应式对象
const aiData = ref({})

/**
 * 初始化所有图表
 * 按顺序调用三个图表的初始化函数
 */
const initCharts = () => {
    initEmotionChart()
    initConsultationChart()
    initUserActivityChart()
}
/**
 * 情绪趋势分析图表
 * 展示平均情绪评分和记录数量的趋势变化
 */
let emotionChart = null
const emotionChartRef = ref(null)
const initEmotionChart = () => {
    // 检查 DOM 元素是否存在
    if (!emotionChartRef.value) {
        return;
    }
    // 销毁之前的图表实例，避免内存泄漏
    if (emotionChart) {
        emotionChart.dispose()
    }
    // 创建 ECharts 实例
    emotionChart = echarts.init(emotionChartRef.value)
    // 获取情绪趋势数据
    const TrendData = aiData.value.emotionTrend
    // ECharts 配置项
    const option = {
        // 标题配置
        title: {
            text: '情绪趋势分析',
            left: 'center',
            top: 10,
            textStyle: {
                color: '#333',
                fontSize: 16,
                fontWeight: '600'
            }
        },
        // 提示框配置
        tooltip: {
            trigger: 'axis',
            borderColor: '#fab1a0',
            borderWidth: 1,
            textStyle: {
                color: '#333'
            },
        },
        // 图例配置
        legend: {
            data: ['平均情绪评分', '记录数量'],
            top: 40,
        },
        // 网格配置（控制图表区域大小）
        grid: {
            left: '3%',
            right: '4%',
            top: 80,
            bottom: '3%',
        },
        // X 轴配置（日期）
        xAxis: {
            data: TrendData.map(item => item.date),
            type: 'category',
            axisLinen: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
        },
        // Y 轴配置（双 Y 轴：左侧情绪评分，右侧记录数量）
        yAxis: [{
            type: 'value',
            name: '情绪评分',
            position: 'left',
            axisLinen: {
                lineStyle: {
                    color: '#2d3436'
                }
            },
        }, {
            type: 'value',
            name: '记录数量',
            position: 'right',
            axisLinen: {
                lineStyle: {
                    color: '#2d3436'
                }
            }
        }],
        // 数据系列配置
        series: [{
            name: '平均情绪评分',
            type: 'line',
            data: TrendData.map(item => item.avgMoodScore),
            smooth: true, // 平滑曲线
            lineStyle: {
                width: 3,
                color: '#faebaf'
            },
            itemStyle: {
                color: '#faebaf'
            },
        }, {
            name: '记录数量',
            type: 'line',
            data: TrendData.map(item => item.recordCount),
            smooth: true,
            lineStyle: {
                width: 3,
                color: '#eeb5a3'
            },
            itemStyle: {
                color: '#eeb5a3'
            },
        }]
    }

    emotionChart.setOption(option)

}
/**
 * 咨询会话统计图表
 * 展示每日会话数量和参与用户数的柱状图
 */
let consultationChart = null
const consultationChartRef = ref(null)
const initConsultationChart = () => {
    // 检查 DOM 元素是否存在
    if (!consultationChartRef.value) { return; }
    // 销毁之前的图表实例，避免内存泄漏
    if (consultationChart) {
        consultationChart.dispose()
    }
    // 创建 ECharts 实例
    consultationChart = echarts.init(consultationChartRef.value)
    // 获取会话统计数据（每日趋势）
    const dailyTrend = aiData.value.consultationStats.dailyTrend
    // ECharts 配置项
    const option = {
        // 标题配置
        title: {
            text: '咨询活动统计',
            textStyle: {
                fontSize: 16,
                fontWeight: 600,
                color: '#2d3436'
            },
            left: 'center',
            top: 10
        },
        // 提示框配置
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#fab1a0',
            borderWidth: 1,
            textStyle: {
                color: '#2d3436'
            }
        },
        // 图例配置
        legend: {
            data: ['会话数量', '参与用户数'],
            top: 40,
            textStyle: {
                color: '#636e72'
            }
        },
        // 网格配置
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: 80,
            containLabel: true
        },
        // X 轴配置（日期）
        xAxis: {
            type: 'category',
            data: dailyTrend.map(item => item.date),
            axisLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.3)'
                }
            },
            axisLabel: {
                color: '#636e72'
            }
        },
        // Y 轴配置
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#636e72'
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.3)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.1)'
                }
            }
        },
        // 数据系列配置（柱状图）
        series: [
            {
                name: '会话数量',
                type: 'bar',
                data: dailyTrend.map(item => item.sessionCount),
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: '#74b9ff' },
                            { offset: 1, color: '#0984e3' }
                        ]
                    }
                },
                barWidth: '40%'
            },
            {
                name: '参与用户数',
                type: 'bar',
                data: dailyTrend.map(item => item.userCount),
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: '#fdcb6e' },
                            { offset: 1, color: '#f39c12' }
                        ]
                    }
                },
                barWidth: '40%'
            }
        ]
    }
    consultationChart.setOption(option)

}
/**
 * 用户活跃度趋势图表
 * 展示活跃用户、新增用户、日记用户、咨询用户的趋势变化
 */
let userActivityChart = null
const userActivityChartRef = ref(null)
const initUserActivityChart = () => {
    // 检查 DOM 元素是否存在
    if (!userActivityChartRef.value) { return; }
    // 销毁之前的图表实例，避免内存泄漏
    if (userActivityChart) {
        userActivityChart.dispose()
    }
    // 创建 ECharts 实例
    userActivityChart = echarts.init(userActivityChartRef.value)
    // 获取用户活跃度数据
    const activityData = aiData.value.userActivity
    // ECharts 配置项
    const option = {
        // 标题配置
        title: {
            text: '用户活跃度趋势',
            textStyle: {
                fontSize: 16,
                fontWeight: 600,
                color: '#2d3436'
            },
            left: 'center',
            top: 10
        },
        // 提示框配置
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#fab1a0',
            borderWidth: 1,
            textStyle: {
                color: '#2d3436'
            }
        },
        // 图例配置
        legend: {
            data: ['活跃用户', '新增用户', '日记用户', '咨询用户'],
            top: 40,
            textStyle: {
                color: '#636e72'
            }
        },
        // 网格配置
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: 80,
            containLabel: true
        },
        // X 轴配置（日期）
        xAxis: {
            type: 'category',
            data: activityData.map(item => item.date),
            axisLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.3)'
                }
            },
            axisLabel: {
                color: '#636e72'
            }
        },
        // Y 轴配置
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#636e72'
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.3)'
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(244, 162, 97, 0.1)'
                }
            }
        },
        // 数据系列配置（折线图）
        series: [
            {
                name: '活跃用户',
                type: 'line',
                data: activityData.map(item => item.activeUsers),
                smooth: true, // 平滑曲线
                lineStyle: {
                    width: 3,
                    color: '#a29bfe'
                },
                itemStyle: {
                    color: '#a29bfe'
                },
                areaStyle: {
                    // 区域填充渐变色
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(162, 155, 254, 0.4)' },
                            { offset: 1, color: 'rgba(162, 155, 254, 0.1)' }
                        ]
                    }
                }
            },
            {
                name: '新增用户',
                type: 'line',
                data: activityData.map(item => item.newUsers),
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: '#fdcb6e'
                },
                itemStyle: {
                    color: '#fdcb6e'
                }
            },
            {
                name: '日记用户',
                type: 'line',
                data: activityData.map(item => item.diaryUsers),
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: '#00b894'
                },
                itemStyle: {
                    color: '#00b894'
                }
            },
            {
                name: '咨询用户',
                type: 'line',
                data: activityData.map(item => item.consultationUsers),
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: '#fab1a0'
                },
                itemStyle: {
                    color: '#fab1a0'
                }
            }
        ]
    }
    userActivityChart.setOption(option)

}

/**
 * 组件挂载后执行
 * 1. 调用 API 获取分析概览数据
 * 2. 将数据赋值给 aiData
 * 3. 初始化所有图表
 */
onMounted(() => {
    getAnalyticslOverview().then(res => {
        console.log(res)
        aiData.value = res
        initCharts()
    })
})
</script>
<style lang="scss" scoped>
// 仪表盘容器样式
.dashboard-container {
    // 统计卡片内容区域样式
    .card-content {
        display: flex;
        align-items: center;

        // 图标容器样式
        .avatar {
            margin-right: 12px;
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;

            // 各类卡片的渐变背景色
            &.users {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            &.like {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }

            &.comments {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }

            &.smile {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }
        }

        // 信息区域样式
        .info {
            .title {
                font-size: 14px;
                color: #7f8c8d;
                margin-bottom: 4px;
            }

            .value {
                font-size: 24px;
                font-weight: 700;
                color: #2c3e50;
                margin-bottom: 4px
            }

            .subtitle-title {
                font-size: 12px;
                color: #95a5a6;
            }
        }
    }

    // 图表内容区域样式
    .chart-content {
        padding: 20px;
        height: 300px;
        position: relative;

        // 确保 Canvas 占满容器
        canvas {
            width: 100% !important;
            height: 100% !important;
        }

        // 咨询统计数据展示样式
        .consultation-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;

            .stat-item {
                text-align: center;

                .stat-label {
                    font-size: 12px;
                    color: #7f8c8d;
                    margin-bottom: 4px;
                }

                .stat-value {
                    font-size: 18px;
                    font-weight: 600;
                    color: #2c3e50;
                }
            }
        }
    }
}
</style>