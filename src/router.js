import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./components/AccountList.vue'),
    meta: { title: '账号共享平台' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./components/AdminLogin.vue'),
    meta: { title: '管理员登录' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('./components/admin/AdminLayout.vue'),
    meta: { 
      requiresAuth: true
    },
    children: [
      {
        path: '',
        redirect: '/admin/accounts'
      },
      {
        path: 'accounts',
        name: 'admin-accounts',
        component: () => import('./components/admin/AccountManage.vue'),
        meta: { title: '账号管理' }
      },
      {
        path: 'notifications',
        name: 'admin-notifications',
        component: () => import('./components/admin/NotificationManage.vue'),
        meta: { title: '通知管理' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '账号共享平台'
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !localStorage.getItem('isAdmin')) {
    next('/login')
  } else {
    next()
  }
})

export default router 