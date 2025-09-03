// src/api/index.js
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000', // 우리 백엔드 서버 주소
});

// 요청을 보내기 전, 토큰을 헤더에 자동으로 추가하는 설정
apiClient.interceptors.request.use(config => {
  const authStore = useAuthStore();
  const token = authStore.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;