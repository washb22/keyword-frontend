<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' // vue-router 가져오기
import { useAuthStore } from '@/stores/auth' // Pinia store 가져오기

const email = ref('')
const password = ref('')
const router = useRouter() // router 사용 준비
const authStore = useAuthStore() // Pinia store 사용 준비

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value)

  if (success) {
    // 로그인이 성공하면 대시보드 페이지로 이동
    router.push('/dashboard')
  } else {
    // 실패 시 에러 메시지 표시
    alert('로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.');
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>로그인</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">아이디</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="input-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit" class="login-button">로그인</button>
      </form>
      <div class="divider">또는</div>
      <button type="button" class="google-login-button">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" class="google-icon">
        Google로 로그인
      </button>
<div class="signup-link">
  계정이 없으신가요? <RouterLink to="/register">회원가입</RouterLink>
</div>
    </div>
  </div>
</template>

<style scoped>
/* 전체 배경 */
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

/* 로그인 박스 */
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
  box-sizing: border-box; /* <-- 이 줄을 추가하세요 */
}

/* 버튼 스타일 */
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
  box-sizing: border-box; /* <-- 이 줄을 추가하세요 */
  transition: background-color 0.2s;
}
.login-button:hover {
  background-color: #444;
}

.google-login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #ffffff;
  color: #202124;
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem; /* 아이콘과 텍스트 사이 간격 */
  box-sizing: border-box; /* <-- 이 줄을 추가하세요 */
  transition: background-color 0.2s;
}
.google-login-button:hover {
  background-color: #f8f9fa;
}

.google-icon {
  width: 18px;
  height: 18px;
}

/* 구분선 */
.divider {
  text-align: center;
  color: #a0a0a0;
  margin-bottom: 1.5rem;
}

/* 회원가입 링크 */
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