import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '../components/BackendLayout.vue'
import AuthLayout from '../components/AuthLayout.vue'
import FrontendLayout from '../components/FrontendLayout.vue'



// 后台管理系统路由配置
const backendRoutes = [
  {
    path: '/back',
    redirect:'/back/dashboard',
    component: BackendLayout,
    children: [
        {
            path: 'dashboard',
            component: () => import('../views/dashboard.vue'),
            meta:{
              title:'数据分析',
              icon:'PieChart'
            }
        },
        {
          path:'knowledge',
          component: () => import('../views/knowledge.vue'),
          meta:{
            title:'知识文章',
            icon:'ChatLineSquare'
          }
        },
        {
          path:'consultations',
          component: () => import('../views/consultations.vue'),
          meta:{
            title:'咨询记录',
            icon:'Message'
          }
        },
        {
          path:'emotional',
          component: () => import('../views/emotional.vue'),
          meta:{
            title:'情绪日志',
            icon:'User'
          }
        },
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
        {
            path: 'login',
            component: () => import('../views/login.vue'),
            meta:{
              title:'登录'
            }
        },
        {
          path: 'register',
          component: () => import('../views/register.vue'),
          meta:{
            title:'注册'
          }
        }
    ]
  }

]
// 前台用户页面路由配置
const frontendRoutes = [
  {
    path: '/',
    component: FrontendLayout,
    children: [
        {
          path:'',
          component: () => import('../views/home.vue'),
        },
        {
          path:'consultation',
          component: () => import('../views/consultation.vue'),
        },{
          path:'emotion-diary',
          component: () => import('../views/emotionDiary.vue'),
        },{
          path:'knowledge',
          component: () => import('../views/frontendKnowledge.vue'),
        },
        {
          path:'knowledge/article/:id',
          component: () => import('../views/articleDetail.vue'),
          props: true
        }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [...backendRoutes, ...frontendRoutes]
})
// 路由守卫：控制页面访问权限
router.beforeEach((to, from, next) => {
    // 从localStorage获取token判断用户是否登录
    const token = localStorage.getItem('token')
    if (token) {
      const userInfo =JSON.parse(localStorage.getItem('userInfo'))
      // userType: 2表示后台管理员
      if(userInfo.userType === 2){
        // 管理员访问后台页面放行，其他页面重定向到后台首页
        if(to.path.startsWith('/back')){
          next()
        }else{
          next('/back/dashboard')
        }
      }else if(userInfo.userType === 1){
        // userType: 1表示前台用户
        // 前台用户访问后台或认证页面重定向到前台首页
        if(to.path.startsWith('/back')||to.path.startsWith('/auth')){
          next('/')
        }else{
          next()
        }
      }
    } else {
        // 未登录用户访问后台页面重定向到登录页
        if (to.path.startsWith('/back')) {
            next('/auth/login')
        } else {
            next()
        }
    }
})

export default router   