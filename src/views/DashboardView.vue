<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api';

const router = useRouter();
const authStore = useAuthStore();
const keywords = ref([]);
const isLoading = ref(true);
const newKeyword = ref({
  keyword_text: '',
  post_title: '',
  post_url: '',
  priority: '중'
});
const checkingId = ref(null);
const isEditModalOpen = ref(false);
const editingKeyword = ref(null);
const isCheckingAll = ref(false);

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

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    authStore.logout();
    router.push('/login');
  }
};

const exportToExcel = () => {
  const data = [
    ['중요도', '키워드', '게시물 제목', 'URL', '순위', '섹션', '마지막 확인'],
    ...keywords.value.map(keyword => [
      keyword.priority,
      keyword.keyword_text,
      keyword.post_title || '',
      keyword.post_url,
      keyword.ranking || '',
      keyword.section || '',
      formatKoreanTime(keyword.last_checked_at)
    ])
  ];
  
  let excelContent = '<table>';
  data.forEach(row => {
    excelContent += '<tr>';
    row.forEach(cell => {
      excelContent += `<td>${cell}</td>`;
    });
    excelContent += '</tr>';
  });
  excelContent += '</table>';
  
  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `키워드_순위_${new Date().toISOString().split('T')[0]}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleCreateKeyword = async () => {
  if (!newKeyword.value.keyword_text || !newKeyword.value.post_url) {
    alert('키워드와 URL을 모두 입력해주세요.');
    return;
  }
  try {
    await apiClient.post('/keyword/keywords', newKeyword.value);
    newKeyword.value = { keyword_text: '', post_title: '', post_url: '', priority: '중' };
    fetchKeywords();
  } catch (error) {
    console.error("키워드 생성 실패:", error);
    alert('키워드 생성에 실패했습니다.');
  }
};

const handleCheckRank = async (keywordId, isBatch = false) => {
  checkingId.value = keywordId;
  try {
    const response = await apiClient.post(`/keyword/keywords/${keywordId}/check`);
    if (!isBatch) {
      alert(`순위 확인 완료!\n${response.data.message}`);
    }
    await fetchKeywords();
  } catch (error) {
    console.error("순위 확인 실패:", error);
    const errorMessage = error.response?.data?.message || '순위 확인 중 오류가 발생했습니다.';
    if (!isBatch) {
      alert(errorMessage);
    }
    throw error;
  } finally {
    checkingId.value = null;
  }
};

const handleCheckAllRanks = async () => {
  if (!confirm(`총 ${keywords.value.length}개의 키워드 순위를 모두 확인하시겠습니까?\n시간이 다소 걸릴 수 있습니다.`)) {
    return;
  }
  isCheckingAll.value = true;
  try {
    for (const keyword of keywords.value) {
      console.log(`'${keyword.keyword_text}' 순위 확인 시작 (전체 확인)`);
      await handleCheckRank(keyword.id, true);
    }
    alert('모든 키워드의 순위 확인이 완료되었습니다!');
  } catch (error) {
    console.error("전체 순위 확인 중 오류 발생:", error);
    alert('전체 순위 확인을 진행하던 중 오류가 발생했습니다.');
  } finally {
    isCheckingAll.value = false;
  }
};

const handleDeleteKeyword = async (keywordId) => {
  if (!confirm('정말로 이 키워드를 삭제하시겠습니까?')) return;
  try {
    await apiClient.delete(`/keyword/keywords/${keywordId}`);
    alert('키워드가 삭제되었습니다.');
    fetchKeywords();
  } catch (error) {
    console.error("키워드 삭제 실패:", error);
    alert('키워드 삭제에 실패했습니다.');
  }
};

const openEditModal = (keyword) => {
  editingKeyword.value = { ...keyword };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  editingKeyword.value = null;
};

const handleUpdateKeyword = async () => {
  if (!editingKeyword.value) return;
  try {
    const { id, keyword_text, post_title, post_url, priority } = editingKeyword.value;
    await apiClient.put(`/keyword/keywords/${id}`, {
      keyword_text,
      post_title,
      post_url,
      priority
    });
    alert('키워드가 성공적으로 수정되었습니다.');
    closeEditModal();
    fetchKeywords();
  } catch (error) {
    console.error("키워드 수정 실패:", error);
    alert('키워드 수정에 실패했습니다.');
  }
};

const formatStatus = (keyword) => {
  if (keyword.ranking && keyword.ranking > 0 && keyword.section) {
    return `${keyword.section} (${keyword.ranking}위)`;
  }
  return keyword.ranking_status || '확인 대기';
};

const getStatusClass = (keyword) => {
  if (keyword.ranking && keyword.ranking > 0) {
    if (keyword.ranking <= 3) return 'status-excellent';
    if (keyword.ranking <= 10) return 'status-good';
    return 'status-normal';
  }
  if (keyword.ranking_status === '노출X') {
    return 'status-not-exposed';
  }
  return 'status-waiting';
};

const formatKoreanTime = (utcIsoString) => {
  if (!utcIsoString) {
    return '아직 확인 안 함';
  }
  let dateString = utcIsoString;
  if (!dateString.endsWith('Z')) {
    dateString += 'Z';
  }
  return new Date(dateString).toLocaleString('ko-KR');
};
</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>대시보드</h1>
      <div class="header-actions">
        <button @click="exportToExcel" class="export-btn">Excel 내보내기</button>
        <button @click="handleCheckAllRanks" :disabled="isCheckingAll" class="check-all-btn">
          {{ isCheckingAll ? '전체 순위 확인 중...' : '전체 순위 확인' }}
        </button>
        <button @click="handleLogout" class="logout-btn">로그아웃</button>
      </div>
    </header>

    <div v-if="isLoading">
      <p>키워드 목록을 불러오는 중...</p>
    </div>
    <div v-else>
      <table class="keyword-table">
        <colgroup>
          <col style="width: 100px;">
          <col style="width: 40%;">
          <col style="width: 220px;">
          <col style="width: 180px;">
          <col style="width: 220px;">
        </colgroup>
        <thead>
          <tr>
            <th>중요도</th>
            <th>키워드 / URL</th>
            <th>탭 (순위)</th>
            <th>마지막 확인</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="keyword in keywords" :key="keyword.id">
            <td>{{ keyword.priority }}</td>
            <td>
              <div class="keyword-text">{{ keyword.keyword_text }}</div>
              <div class="keyword-title" v-if="keyword.post_title">📝 {{ keyword.post_title }}</div>
              <div class="keyword-url">{{ keyword.post_url }}</div>
            </td>
            <td>
              <span :class="['status-badge', getStatusClass(keyword)]">
                {{ formatStatus(keyword) }}
              </span>
            </td>
            <td>{{ formatKoreanTime(keyword.last_checked_at) }}</td>
            <td>
              <div class="management-buttons">
                <button @click="handleCheckRank(keyword.id)" :disabled="checkingId === keyword.id || isCheckingAll" class="check-btn">
                  {{ checkingId === keyword.id ? '확인중...' : '순위확인' }}
                </button>
                <button @click="openEditModal(keyword)" class="edit-btn">수정</button>
                <button @click="handleDeleteKeyword(keyword.id)" class="delete-btn">삭제</button>
              </div>
            </td>
          </tr>
          
          <tr class="add-new-row">
            <td>
              <select v-model="newKeyword.priority">
                <option>상</option><option selected>중</option><option>하</option>
              </select>
            </td>
            <td>
              <input type="text" v-model="newKeyword.keyword_text" placeholder="새 키워드를 입력하세요">
              <input type="text" v-model="newKeyword.post_title" placeholder="게시물 제목" class="title-input">
              <input type="url" v-model="newKeyword.post_url" placeholder="https://..." class="url-input">
            </td>
            <td colspan="3"></td>
            <td>
              <div class="management-buttons">
                <button @click="handleCreateKeyword" class="add-btn">추가</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="keywords.length === 0" class="no-keywords-msg">등록된 키워드가 없습니다.</p>
    </div>
  </div>

  <div v-if="isEditModalOpen" class="modal-overlay" @click.self="closeEditModal">
    <div class="modal-content">
      <h2>키워드 수정</h2>
      <form @submit.prevent="handleUpdateKeyword" v-if="editingKeyword">
        <div class="form-group">
          <label for="edit-priority">우선순위</label>
          <select id="edit-priority" v-model="editingKeyword.priority">
            <option>상</option><option>중</option><option>하</option>
          </select>
        </div>
        <div class="form-group">
          <label for="edit-keyword">키워드</label>
          <input type="text" id="edit-keyword" v-model="editingKeyword.keyword_text" required>
        </div>
        <div class="form-group">
          <label for="edit-title">게시물 제목</label>
          <input type="text" id="edit-title" v-model="editingKeyword.post_title" placeholder="게시물 제목 (선택사항)">
        </div>
        <div class="form-group">
          <label for="edit-url">URL</label>
          <input type="url" id="edit-url" v-model="editingKeyword.post_url" required>
        </div>
        <div class="modal-buttons">
          <button type="button" @click="closeEditModal" class="cancel-btn">취소</button>
          <button type="submit" class="save-btn">저장</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.export-btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  background-color: #6c757d;
  color: white;
  white-space: nowrap;
}

.export-btn:hover {
  background-color: #5a6268;
}

.logout-btn {
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  background-color: #dc3545;
  color: white;
  white-space: nowrap;
}

.logout-btn:hover {
  background-color: #c82333;
}

h1 { 
  font-size: 2rem; 
}

.keyword-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.keyword-table th, .keyword-table td {
  padding: 1rem;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid #ddd;
  height: 60px; /* 🔥 모든 셀에 동일한 높이 적용 */
}

.keyword-table th { 
  background-color: #f8f9fa;
  font-weight: bold;
  height: 50px; /* 헤더는 조금 작게 */
}

.keyword-table td:first-child,
.keyword-table th:first-child {
  text-align: center;
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

.keyword-title {
  font-size: 0.85rem;
  color: #555;
  margin: 0.2rem 0;
  font-style: italic;
}

/* 🔥 관리 버튼 컨테이너 */
.management-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  height: 100%; /* 부모 셀 높이에 맞춤 */
  justify-content: flex-start;
}

/* 🔥 모든 버튼 스타일 통일 */
.check-btn, .add-btn, .edit-btn, .delete-btn, .save-btn, .cancel-btn {
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  height: 32px; /* 고정 높이 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-btn { 
  background-color: #28a745; 
  color: white; 
}

.check-btn:disabled { 
  background-color: #6c757d; 
  cursor: not-allowed; 
}

.add-btn { 
  background-color: #007bff; 
  color: white; 
}

.edit-btn { 
  background-color: #ffc107; 
  color: #212529; 
}

.delete-btn { 
  background-color: #dc3545; 
  color: white; 
}

.check-all-btn {
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  background-color: #17a2b8;
  color: white;
}

.check-all-btn:disabled { 
  background-color: #6c757d; 
  cursor: not-allowed; 
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  white-space: nowrap;
}

.status-excellent { 
  background-color: #d4edda; 
  color: #155724; 
  border: 1px solid #c3e6cb; 
}

.status-good { 
  background-color: #d1ecf1; 
  color: #0c5460; 
  border: 1px solid #bee5eb; 
}

.status-normal { 
  background-color: #fff3cd; 
  color: #856404; 
  border: 1px solid #ffeeba; 
}

.status-not-exposed { 
  background-color: #f8d7da; 
  color: #721c24; 
  border: 1px solid #f5c6cb; 
}

.status-waiting { 
  background-color: #e2e3e5; 
  color: #495057; 
  border: 1px solid #d6d8db; 
}

/* 추가 행 스타일 */
.add-new-row input, .add-new-row select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.add-new-row .url-input { 
  margin-top: 0.5rem; 
}

.title-input {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.no-keywords-msg {
  text-align: center;
  margin-top: 2rem;
  color: #888;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed; 
  top: 0; 
  left: 0;
  width: 100%; 
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; 
  justify-content: center; 
  align-items: center; 
  z-index: 1000;
}

.modal-content {
  background-color: white; 
  padding: 2rem; 
  border-radius: 8px;
  width: 90%; 
  max-width: 500px; 
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.modal-content h2 { 
  margin-top: 0; 
  margin-bottom: 1.5rem; 
}

.form-group { 
  margin-bottom: 1rem; 
}

.form-group label { 
  display: block; 
  margin-bottom: 0.5rem; 
}

.form-group input, .form-group select {
  width: 100%; 
  padding: 0.75rem; 
  border: 1px solid #ccc;
  border-radius: 4px; 
  font-size: 1rem;
}

.modal-buttons {
  margin-top: 2rem; 
  display: flex;
  justify-content: flex-end; 
  gap: 0.5rem;
}

.save-btn { 
  background-color: #007bff; 
  color: white; 
}

.cancel-btn { 
  background-color: #6c757d; 
  color: white; 
}
</style>