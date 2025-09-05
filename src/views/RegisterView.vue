<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/api'  // axios 대신 apiClient import

const email = ref('')
const password = ref('')
const router = useRouter()

const handleRegister = async () => {
  try {
    await apiClient.post('/auth/register', {  // apiClient 사용
      email: email.value,
      password: password.value
    });
    
    alert('회원가입 성공! 로그인 페이지로 이동합니다.');
    // 회원가입 성공 시 로그인 페이지로 이동
    router.push('/login');

  } catch (error) {
    console.error('회원가입 실패:', error);
    alert(error.response.data.message || '회원가입에 실패했습니다.');
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>회원가입</h2>
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <label for="email">아이디 (이메일)</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="input-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit" class="login-button">회원가입</button>
      </form>
      <div class="signup-link">
        이미 계정이 있으신가요? <RouterLink to="/login">로그인</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 전체 배경: 화면 전체를 차지하고 콘텐츠를 중앙 정렬 */
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

/* 로그인 박스: 적당한 너비를 가진 중앙의 박스 */
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

/* 회원가입 페이지에는 구글 버튼과 구분선이 없으므로 주석 처리하거나 지워도 됩니다. */
/* .google-login-button { ... }
.divider { ... } 
*/

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
</style>