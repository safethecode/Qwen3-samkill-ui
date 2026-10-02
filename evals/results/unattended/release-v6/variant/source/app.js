const STORAGE_KEY = 'resumes';
const RESUME_FORM = document.getElementById('resume-form');
const RESUME_LIST = document.getElementById('resume-list');
const NEW_RESUME_BTN = document.getElementById('new-resume-btn');
const CANCEL_EDIT_BTN = document.getElementById('cancel-edit-btn');
const RESUME_SEARCH = document.getElementById('resume-search');
const FILTER_ALL = document.getElementById('filter-all');
const FILTER_ARCHIVED = document.getElementById('filter-archived');

let resumes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingId = null;
let currentFilter = 'all';

                                                 
if (resumes.length === 0) {
  resumes = [
    {
      id: '1',
      title: '이력서 제목 1',
      name: '김철수',
      role: '데이터 분석가',
      email: 'kim@example.com',
      intro: '경험 많은 데이터 분석가입니다. 다양한 산업에서 데이터를 분석하고 전략을 수립하는 데 기여했습니다.',
      archived: false,
      modified: new Date().toISOString()
    },
    {
      id: '2',
      title: '이력서 제목 2',
      name: '이영희',
      role: '플랫폼 개발자',
      email: 'lee@example.com',
      intro: '웹 플랫폼 개발에 특화된 개발자입니다. 사용자 중심의 솔루션을 설계하고 구현하는 데 강점을 가지고 있습니다.',
      archived: false,
      modified: new Date().toISOString()
    },
    {
      id: '3',
      title: '이력서 제목 3',
      name: '박민수',
      role: '제품 디자이너',
      email: 'park@example.com',
      intro: '사용자 경험을 중심으로 한 제품 디자인에 전문성을 가지고 있습니다. 직관적이고 효율적인 디자인을 제공합니다.',
      archived: false,
      modified: new Date().toISOString()
    }
  ];
  saveResumes();
}

function saveResumes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function renderResumes() {
  RESUME_LIST.innerHTML = '';
  
  let filteredResumes = resumes;
  if (currentFilter === 'archived') {
    filteredResumes = resumes.filter(r => r.archived);
  } else {
    filteredResumes = resumes.filter(r => !r.archived);
  }
  
                        
  const searchTerm = RESUME_SEARCH.value.toLowerCase();
  if (searchTerm) {
    filteredResumes = filteredResumes.filter(resume => 
      resume.title.toLowerCase().includes(searchTerm) ||
      resume.role.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filteredResumes.length === 0) {
    RESUME_LIST.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
    return;
  }
  
  filteredResumes.forEach(resume => {
    const resumeElement = document.createElement('article');
    resumeElement.className = 'document-card';
    resumeElement.innerHTML = `
      <div class="document-stage">
        <div class="document-paper">
          <h3 class="paper-title">${resume.title}</h3>
          <p class="paper-role">${resume.role}</p>
          <p class="paper-intro">${resume.intro || '소개가 없습니다.'}</p>
        </div>
      </div>
      <div class="document-meta">
        <h4 class="meta-title">${resume.name}</h4>
        <p class="meta-role">${resume.role}</p>
        <p class="meta-date">수정일: ${formatDate(resume.modified)}</p>
        <div class="document-actions">
          <button class="btn btn-secondary edit-btn" data-id="${resume.id}">편집</button>
          <button class="btn btn-secondary duplicate-btn" data-id="${resume.id}">복제</button>
          ${resume.archived ? 
            `<button class="btn btn-restore restore-btn" data-id="${resume.id}">복원</button>` : 
            `<button class="btn btn-archive archive-btn" data-id="${resume.id}">보관</button>`
          }
        </div>
      </div>
    `;
    RESUME_LIST.appendChild(resumeElement);
  });
  
                                   
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      editResume(id);
    });
  });
  
  document.querySelectorAll('.duplicate-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      duplicateResume(id);
    });
  });
  
  document.querySelectorAll('.archive-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      archiveResume(id);
    });
  });
  
  document.querySelectorAll('.restore-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      restoreResume(id);
    });
  });
}

function editResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
  editingId = id;
  document.getElementById('resume-title').value = resume.title || '';
  document.getElementById('resume-name').value = resume.name || '';
  document.getElementById('resume-role').value = resume.role || '';
  document.getElementById('resume-email').value = resume.email || '';
  document.getElementById('resume-intro').value = resume.intro || '';
  
  document.getElementById('editor-section').classList.remove('hidden');
}

function duplicateResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
  const newResume = { ...resume, id: Date.now().toString(), archived: false };
  resumes.push(newResume);
  saveResumes();
  renderResumes();
}

function archiveResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
  resume.archived = true;
  saveResumes();
  renderResumes();
}

function restoreResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
  resume.archived = false;
  saveResumes();
  renderResumes();
}

function createNewResume() {
  editingId = null;
  document.getElementById('resume-form').reset();
  document.getElementById('editor-section').classList.remove('hidden');
}

function cancelEdit() {
  editingId = null;
  document.getElementById('editor-section').classList.add('hidden');
  document.getElementById('resume-form').reset();
}

function validateForm() {
  const title = document.getElementById('resume-title').value.trim();
  
  if (!title) {
    alert('제목은 필수 입력입니다.');
    return false;
  }
  
                               
  if (/(한국어|ko|korean)/i.test(title)) {
    alert('제목에 한국어를 사용할 수 없습니다.');
    return false;
  }
  
  return true;
}

function submitForm(e) {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  const title = document.getElementById('resume-title').value.trim();
  const name = document.getElementById('resume-name').value.trim();
  const role = document.getElementById('resume-role').value.trim();
  const email = document.getElementById('resume-email').value.trim();
  const intro = document.getElementById('resume-intro').value.trim();
  
  const now = new Date().toISOString();
  
  if (editingId) {
                             
    const index = resumes.findIndex(r => r.id === editingId);
    if (index !== -1) {
      resumes[index] = {
        ...resumes[index],
        title,
        name,
        role,
        email,
        intro,
        modified: now
      };
    }
  } else {
                        
    const newResume = {
      id: Date.now().toString(),
      title,
      name,
      role,
      email,
      intro,
      archived: false,
      modified: now
    };
    resumes.push(newResume);
  }
  
  saveResumes();
  renderResumes();
  cancelEdit();
}

                  
NEW_RESUME_BTN.addEventListener('click', createNewResume);
CANCEL_EDIT_BTN.addEventListener('click', cancelEdit);
RESUME_FORM.addEventListener('submit', submitForm);

RESUME_SEARCH.addEventListener('input', renderResumes);

FILTER_ALL.addEventListener('click', () => {
  currentFilter = 'all';
  FILTER_ALL.classList.add('active');
  FILTER_ARCHIVED.classList.remove('active');
  renderResumes();
});

FILTER_ARCHIVED.addEventListener('click', () => {
  currentFilter = 'archived';
  FILTER_ARCHIVED.classList.add('active');
  FILTER_ALL.classList.remove('active');
  renderResumes();
});

                 
renderResumes();