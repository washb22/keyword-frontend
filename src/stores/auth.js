// src/stores/auth.js 수정 버전
import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // 사용자의 토큰을 저장할 변수
  const token = ref(localStorage.getItem('token') || null)

  // 로그인 액션
  async function login(email, password) {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email: email,
        password: password
      });
      // 성공 시 토큰을 변수에 저장하고, 브라우저 저장소에도 저장
      token.value = response.data.token
      localStorage.setItem('token', token.value)
      return true // 성공 여부 반환
    } catch (error) {
      console.error('Login failed:', error)
      return false // 실패 여부 반환
    }
  }

  // 로그아웃 액션 (새로 추가)
  function logout() {
    token.value = null
    localStorage.removeItem('token')
  }

  return { token, login, logout }
})