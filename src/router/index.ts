// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import RegisterView from '../views/RegisterView.vue' // <-- 회원가입 페이지 import

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/register' // 이제 기본 주소는 회원가입 페이지로 시작
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    { // <-- 아래 내용을 추가하세요
      path: '/register',
      name: 'register',
      component: RegisterView
    }
  ]
})

export default router