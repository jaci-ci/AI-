# 云策 AI · 智能工作平台

AI 驱动的个人效率与知识管理平台，基于 **Vue 3 + Vite + Element Plus** 构建。

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建工具 | Vite 8 |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 图表 | ECharts 6 |
| HTTP 客户端 | Axios |
| 富文本编辑器 | WangEditor |
| 样式预处理 | Sass |
| PWA | Service Worker + Web App Manifest |

## 功能模块

### 🏠 前台

| 功能 | 说明 |
|------|------|
| 智能对话 | AI 大模型实时流式对话，支持 Markdown 渲染和语音输入 |
| 随手记 | 日常笔记记录，支持 Markdown，标签分类管理 |
| 知识库 | 多领域知识文章，涵盖技术、生活、效率等 |
| AI 写作 | 日报、周报、邮件、总结等多模板 AI 写作助手 |
| 专注计时 | 番茄钟专注模式，环形进度动画，白噪音沉浸体验 |
| 个人中心 | 用户信息与设置管理 |

### 📊 后台管理

| 功能 | 说明 |
|------|------|
| 数据看板 | 用户数、笔记、会话、评分等核心指标概览 |
| 数据大屏 | 全屏数据可视化大屏，多图表联动 |
| 知识文章管理 | 文章发布、编辑与管理 |
| 对话记录 | 用户咨询对话日志查询 |
| 笔记日志 | 用户笔记与日常记录管理 |

### 🔧 可组合函数

`useClipboard` · `useCommandPalette` · `useCountUp` · `useDebounce` · `useFullscreen` · `useInfiniteScroll` · `useLazyImage` · `useLocalStorage` · `useOnlineStatus` · `useSSE` · `useTheme` · `useThrottle` · `useTitle` · `useVirtualList` · `useVoiceInput`

## 快速开始

```bash
cd code/ai-vue

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
├── code/ai-vue/
│   ├── public/
│   │   ├── manifest.json      # PWA 清单
│   │   └── sw.js              # Service Worker
│   ├── src/
│   │   ├── components/        # 公共组件 (Navbar, Sidebar, CommandPalette…)
│   │   ├── composables/       # 可组合函数 (15 个)
│   │   ├── views/             # 页面视图
│   │   │   ├── home.vue               # 首页
│   │   │   ├── consultation.vue       # AI 智能对话
│   │   │   ├── emotionDiary.vue       # 随手记
│   │   │   ├── frontendKnowledge.vue  # 知识库
│   │   │   ├── aiWrite.vue            # AI 写作
│   │   │   ├── focusTimer.vue         # 专注计时
│   │   │   ├── profile.vue            # 个人中心
│   │   │   ├── dashboard.vue          # 数据看板
│   │   │   ├── screen.vue             # 数据大屏
│   │   │   ├── consultations.vue      # 对话记录
│   │   │   └── emotional.vue          # 笔记日志
│   │   ├── router/index.js   # 路由配置
│   │   ├── App.vue           # 根组件
│   │   ├── main.js           # 入口
│   │   └── style.css         # 全局样式
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 用户角色

- **普通用户** — 访问前台，使用 AI 对话、随手记、知识库、AI 写作、专注计时等功能
- **管理员** — 访问后台管理面板，查看数据看板、管理文章与日志

## License

Private
