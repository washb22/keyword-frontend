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
const checkingId = ref(null);
const isEditModalOpen = ref(false);
const editingKeyword = ref(null);

const fetchKeywords = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/keyword/keywords');
    keywords.value = response.data.keywords; // 백엔드에서 이미 정렬해서 줌
  } catch (error) {
    console.error("키워드 목록을 불러오는 데 실패했습니다:", error);
    alert('키워드 목록을 불러오는 데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchKeywords);

// --- 다른 함수들은 이전과 동일하게 유지 ---

const handleCreateKeyword = async () => {
  if (!newKeyword.value.keyword_text || !newKeyword.value.post_url) {
    alert('키워드와 URL을 모두 입력해주세요.'); return;
  }
  try {
    await apiClient.post('/keyword/keywords', newKeyword.value);
    newKeyword.value = { keyword_text: '', post_url: '', priority: '중' };
    fetchKeywords();
  } catch (error) { console.error("키워드 생성 실패:", error); alert('키워드 생성에 실패했습니다.'); }
};

const handleCheckRank = async (keywordId) => {
  checkingId.value = keywordId;
  try {
    const response = await apiClient.post(`/keyword/keywords/${keywordId}/check`);
    alert(`순위 확인 완료! 결과: ${response.data.message}`);
    await fetchKeywords();
  } catch (error) { console.error("순위 확인 실패:", error); alert('순위 확인 중 오류가 발생했습니다.');
  } finally { checkingId.value = null; }
};

const handleDeleteKeyword = async (keywordId) => {
  if (!confirm('정말로 이 키워드를 삭제하시겠습니까?')) return;
  try {
    await apiClient.delete(`/keyword/keywords/${keywordId}`);
    alert('키워드가 삭제되었습니다.');
    fetchKeywords();
  } catch (error) { console.error("키워드 삭제 실패:", error); alert('키워드 삭제에 실패했습니다.'); }
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
    const { id, keyword_text, post_url, priority } = editingKeyword.value;
    await apiClient.put(`/keyword/keywords/${id}`, { keyword_text, post_url, priority });
    alert('키워드가 성공적으로 수정되었습니다.');
    closeEditModal();
    fetchKeywords();
  } catch (error) { console.error("키워드 수정 실패:", error); alert('키워드 수정에 실패했습니다.'); }
};

// --- 상태(순위) 표시를 위한 포맷팅 함수 ---
const formatStatus = (keyword) => {
  if (keyword.ranking) {
    // section 이름이 있으면 함께 표시, 없으면 기존 상태 표시
    const sectionName = keyword.section ? `${keyword.section} ` : `${keyword.ranking_status} `;
    return `${sectionName} (${keyword.ranking}위)`;
  }
  return keyword.ranking_status; // 순위가 없으면 그냥 상태만 표시
}

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
              {{ formatStatus(keyword) }}
            </td>
            <td>{{ keyword.last_checked_at ? new Date(keyword.last_checked_at).toLocaleString('ko-KR') : '아직 확인 안 함' }}</td>
            <td class="management-buttons">
              <button @click="handleCheckRank(keyword.id)" :disabled="checkingId === keyword.id" class="check-btn">
                {{ checkingId === keyword.id ? '확인중' : '순위확인' }}
              </button>
              <button @click="openEditModal(keyword)" class="edit-btn">수정</button>
              <button @click="handleDeleteKeyword(keyword.id)" class="delete-btn">삭제</button>
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
              <input type="url" v-model="newKeyword.post_url" placeholder="https://..." class="url-input">
            </td>
            <td colspan="2"></td>
            <td>
              <button @click="handleCreateKeyword" class="add-btn">추가</button>
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
/* CSS는 이전과 동일하게 유지해도 됩니다. */
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.dashboard-header { margin-bottom: 2rem; }
h1 { font-size: 2rem; }
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
.keyword-table th { background-color: #f8f9fa; }
.keyword-text { font-weight: bold; }
.keyword-url {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
  word-break: break-all;
}
.add-new-row input, .add-new-row select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.add-new-row .url-input { margin-top: 0.5rem; }
.no-keywords-msg {
  text-align: center;
  margin-top: 2rem;
  color: #888;
}

.management-buttons {
  display: flex;
  gap: 0.5rem;
}

.check-btn, .add-btn, .edit-btn, .delete-btn, .save-btn, .cancel-btn {
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
}

.check-btn { background-color: #28a745; color: white; }
.check-btn:disabled { background-color: #6c757d; cursor: not-allowed; }
.add-btn { background-color: #007bff; color: white; }
.edit-btn { background-color: #ffc107; color: #212529; }
.delete-btn { background-color: #dc3545; color: white; }

.modal-overlay {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background-color: white; padding: 2rem; border-radius: 8px;
  width: 90%; max-width: 500px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
.modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input, .form-group select {
  width: 100%; padding: 0.75rem; border: 1px solid #ccc;
  border-radius: 4px; font-size: 1rem;
}
.modal-buttons {
  margin-top: 2rem; display: flex;
  justify-content: flex-end; gap: 0.5rem;
}
.save-btn { background-color: #007bff; color: white; }
.cancel-btn { background-color: #6c757d; color: white; }
</style>