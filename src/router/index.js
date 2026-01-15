import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import MainLayout from '@/components/MainLayout.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Profile from '@/views/Profile.vue'
import WhatsappMessages from '@/views/WhatsappMessages.vue'
import ContactPage from '@/views/ContactPage.vue'
import BlogPage from '@/views/BlogPage.vue'
import Groups from '@/views/Groups.vue'
import GroupDetail from '@/views/GroupDetail.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true },
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
      },
      {
        path: 'messages',
        name: 'Messages',
        component: WhatsappMessages,
      },
      {
        path: 'contacts',
        name: 'Contacts',
        component: ContactPage,
      },
      {
        path: 'groups',
        name: 'Groups',
        component: Groups,
      },
      {
        path: 'groups/:id',
        name: 'GroupDetail',
        component: GroupDetail,
      },
      {
        path: 'blogs',
        name: 'Blogs',
        component: BlogPage,
      },
      {
        path: 'templates',
        name: 'Templates',
        component: () => import('@/views/Templates.vue'),
      },
      {
        path: 'send-files',
        name: 'FileSender',
        component: () => import('@/views/FileSender.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else if (to.matched.some((record) => record.meta.guest)) {
    if (isAuthenticated) {
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
