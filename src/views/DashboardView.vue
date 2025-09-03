<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api';

const keywords = ref([]);
const isLoading = ref(true);
const newKeyword = ref({
  keyword_text: '',
  post_url: '',
  priority: '중'
});

// --- '확인 중' 상태를 관리할 변수 추가 ---
const checkingId = ref(null);

const fetchKeywords = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/keyword/keywords');
    keywords.value = response.data.keywords;
  } catch (error) {
    console.error("키워드 목록을 불러오는 데 실패했습니다:", error);
    alert('키워드 목록을 불러오는 데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchKeywords);

const handleCreateKeyword = async () => {
  if (!newKeyword.value.keyword_text || !newKeyword.value.post_url) {
    alert('키워드와 URL을 모두 입력해주세요.');
    return;
  }
  try {
    await apiClient.post('/keyword/keywords', newKeyword.value);
    newKeyword.value = { keyword_text: '', post_url: '', priority: '중' };
    fetchKeywords();
  } catch (error) {
    console.error("키워드 생성에 실패했습니다:", error);
    alert('키워드 생성에 실패했습니다.');
  }
};

// --- '순위 확인' 버튼을 눌렀을 때 실행될 함수 추가 ---
const handleCheckRank = async (keywordId) => {
  checkingId.value = keywordId; // '확인 중' 상태로 설정
  try {
    const response = await apiClient.post(`/keyword/keywords/${keywordId}/check`);
    alert(`순위 확인 완료! 결과: ${response.data.message}`);
    await fetchKeywords(); // 목록 새로고침
  } catch (error) {
    console.error("순위 확인에 실패했습니다:", error);
    alert('순위 확인 중 오류가 발생했습니다.');
  } finally {
    checkingId.value = null; // '확인 중' 상태 해제
  }
};
</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>대시보드</h1>
    </header>

    <div v-if="isLoading">
      <p>키워드 목록을 불러오는 중...</p>
    </div>
    <div v-else>
      <table class="keyword-table">
        <thead>
          <tr>
            <th>우선순위</th>
            <th>키워드 / URL</th>
            <th>상태 (순위)</th>
            <th>마지막 확인</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="keyword in keywords" :key="keyword.id">
            <td>{{ keyword.priority }}</td>
            <td>
              <div class="keyword-text">{{ keyword.keyword_text }}</div>
              <div class="keyword-url">{{ keyword.post_url }}</div>
            </td>
            <td>
              {{ keyword.ranking_status }}
              <span v-if="keyword.ranking" class="rank"> ({{ keyword.ranking }}위)</span>
            </td>
            <td>{{ keyword.last_checked_at ? new Date(keyword.last_checked_at).toLocaleString('ko-KR') : '아직 확인 안 함' }}</td>
            <td>
              <button @click="handleCheckRank(keyword.id)" :disabled="checkingId === keyword.id" class="check-btn">
                {{ checkingId === keyword.id ? '확인 중...' : '순위 확인' }}
              </button>
            </td>
          </tr>
          
          <tr class="add-new-row">
            <td>
              <select v-model="newKeyword.priority">
                <option>상</option>
                <option>중</option>
                <option>하</option>
              </select>
            </td>
            <td>
              <input type="text" v-model="newKeyword.keyword_text" placeholder="새 키워드를 입력하세요">
              <input type="url" v-model="newKeyword.post_url" placeholder="https://..." class="url-input">
            </td>
            <td colspan="2"></td>
            <td>
              <button @click="handleCreateKeyword" class="add-btn">추가</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="keywords.length === 0" class="no-keywords-msg">등록된 키워드가 없습니다. 아래 칸에 새 키워드를 추가해보세요.</p>
    </div>
  </div>
</template>

<style scoped>
/* (CSS 코드는 이전과 동일합니다) */
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.dashboard-header {
  margin-bottom: 2rem;
}
h1 {
  font-size: 2rem;
}
.keyword-table {
  width: 100%;
  border-collapse: collapse;
}
.keyword-table th, .keyword-table td {
  border-bottom: 1px solid #ddd;
  padding: 1rem;
  text-align: left;
  vertical-align: middle;
}
.keyword-table th {
  background-color: #f8f9fa;
}
.keyword-text {
  font-weight: bold;
}
.keyword-url {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
  word-break: break-all;
}
.check-btn, .add-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
.check-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
.add-new-row input, .add-new-row select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.add-new-row .url-input {
  margin-top: 0.5rem;
}
.no-keywords-msg {
  text-align: center;
  margin-top: 2rem;
  color: #888;
}
</style>