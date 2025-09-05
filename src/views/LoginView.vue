<template>
  <div class="login-container">
    <div class="login-box">
      <h2>로그인</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">이메일</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="input-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit" class="login-button">로그인</button>
      </form>
      
      <div class="divider">
        <span>또는</span>
      </div>
      
      <!-- 구글 로그인 버튼 -->
      <div id="g_id_onload"
           :data-client_id="googleClientId"
           data-callback="handleGoogleResponse"
           data-auto_prompt="false">
      </div>
      <div class="g_id_signin" 
           data-type="standard"
           data-size="large"
           data-theme="filled_black"
           data-text="signin_with"
           data-shape="rectangular"
           data-logo_alignment="left">
      </div>
      
      <div class="signup-link">
        계정이 없으신가요? <RouterLink to="/register">회원가입</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api'  // 추가


const email = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()
const googleClientId = ref(import.meta.env.VITE_GOOGLE_CLIENT_ID || '')

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/dashboard')
  } else {
    alert('로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.')
  }
}

// 구글 로그인 응답 처리
window.handleGoogleResponse = async (response) => {
  try {
    const res = await apiClient.post('/auth/google-login', {  // axios 대신 apiClient
      credential: response.credential
    })
    
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
      authStore.token = res.data.token
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('구글 로그인 실패:', error)
    alert('구글 로그인에 실패했습니다.')
  }
}

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  document.head.appendChild(script)
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #121212;
  color: #e0e0e0;
  font-family: sans-serif;
  padding: 1rem;
  box-sizing: border-box;
}

.login-box {
  background: #1e1e1e;
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  border: 1px solid #2a2a2a;
  width: 100%;
  max-width: 450px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #ffffff;
  font-weight: 300;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #a0a0a0;
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 1rem;
  box-sizing: border-box;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #333;
  color: #e0e0e0;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  box-sizing: border-box;
}

.login-button:hover {
  background-color: #444;
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider span {
  background: #1e1e1e;
  padding: 0 1rem;
  position: relative;
  color: #666;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #333;
  z-index: -1;
}

.g_id_signin {
  width: 100%;
  margin-bottom: 1.5rem;
}

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #a0a0a0;
}

.signup-link a {
  color: #4a90e2;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>