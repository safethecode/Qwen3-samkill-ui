const resumeList = document.getElementById('resume-list');
const newResumeBtn = document.getElementById('new-resume-btn');
const filterAll = document.getElementById('filter-all');
const filterArchived = document.getElementById('filter-archived');
const resumeSearch = document.getElementById('resume-search');
const editorSection = document.getElementById('editor-section');
const resumeForm = document.getElementById('resume-form');
const cancelBtn = document.getElementById('cancel-btn');

let resumes = JSON.parse(localStorage.getItem('resumes')) || [];
let editingId = null;
let currentFilter = 'all';

const exampleResumes = [
  {
    id: '1',
    title: '데이터 분석가 이력서',
    name: '김철수',
    role: '데이터 분석가',
    email: 'kim@example.com',
    intro: '데이터를 통해 비즈니스 인사이트를 도출하는 데에 전문성을 갖춘 데이터 분석가입니다. 머신러닝 알고리즘을 활용한 예측 모델 구축 경험과 대시보드 개발 능력이 뛰어납니다.',
    archived: false,
    createdAt: new Date('2023-01-15').toISOString(),
    updatedAt: new Date('2023-01-15').toISOString()
  },
  {
    id: '2',
    title: '플랫폼 개발자 이력서',
    name: '이영희',
    role: '플랫폼 개발자',
    email: 'lee@example.com',
    intro: '다양한 플랫폼에서의 개발 경험을 바탕으로, 사용자 중심의 제품을 설계하고 구현하는 데 능숙합니다. 클라우드 기반 아키텍처 설계와 API 개발에 특화되어 있습니다.',
    archived: false,
    createdAt: new Date('2023-02-20').toISOString(),
    updatedAt: new Date('2023-02-20').toISOString()
  },
  {
    id: '3',
    title: '제품 디자이너 이력서',
    name: '박민수',
    role: '제품 디자이너',
    email: 'park@example.com',
    intro: '사용자 경험을 중심으로 한 제품 디자인에 열정을 가지고 있습니다. 정보 구조화와 프로토타이핑, 사용자 테스트를 통해 제품 가치를 높이는 데 기여해왔습니다.',
    archived: false,
    createdAt: new Date('2023-03-10').toISOString(),
    updatedAt: new Date('2023-03-10').toISOString()
  }
];

if (resumes.length === 0) {
  resumes = exampleResumes;
  localStorage.setItem('resumes', JSON.stringify(resumes));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderResumes() {
  resumeList.innerHTML = '';
  
  let filteredResumes = resumes;
  
  if (currentFilter === 'archived') {
    filteredResumes = resumes.filter(r => r.archived);
  } else {
    filteredResumes = resumes.filter(r => !r.archived);
  }
  
  const searchQuery = resumeSearch.value.toLowerCase();
  
  if (searchQuery) {
    filteredResumes = filteredResumes.filter(resume => 
      resume.title.toLowerCase().includes(searchQuery) || 
      resume.role.toLowerCase().includes(searchQuery)
    );
  }
  
  if (filteredResumes.length === 0) {
    document.getElementById('empty-state').style.display = 'block';
    return;
  }
  
  document.getElementById('empty-state').style.display = 'none';
  
  filteredResumes.forEach(resume => {
    const resumeCard = document.createElement('div');
    resumeCard.className = 'document-card';
    
    const isExample = exampleResumes.some(e => e.id === resume.id);
    
    const titleHtml = escapeHtml(resume.title);
    const nameHtml = escapeHtml(resume.name);
    const roleHtml = escapeHtml(resume.role);
    const introHtml = escapeHtml(resume.intro);

    resumeCard.innerHTML = `
      <div class="document-stage">
        <div class="document-paper">
          <h3>${nameHtml}</h3>
          <p><strong>${roleHtml}</strong></p>
          <p>${introHtml}</p>
        </div>
      </div>
      <div class="document-meta">
        <h4>${titleHtml}</h4>
        <p class="meta-date">수정일: ${formatDate(resume.updatedAt)}</p>
        <div class="document-actions">
          <button class="action-btn edit-btn" data-id="${resume.id}">편집</button>
          <button class="action-btn duplicate-btn" data-id="${resume.id}">복제</button>
          ${resume.archived ? 
            `<button class="action-btn restore-btn" data-id="${resume.id}">복원</button>` : 
            `<button class="action-btn archive-btn" data-id="${resume.id}">보관</button>`
          }
        </div>
      </div>
      ${isExample ? '<span class="sample-badge">예시</span>' : ''}
    `;
    
    resumeList.appendChild(resumeCard);
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
  
  document.getElementById('form-title').value = resume.title || '';
  document.getElementById('form-name').value = resume.name || '';
  document.getElementById('form-role').value = resume.role || '';
  document.getElementById('form-email').value = resume.email || '';
  document.getElementById('form-intro').value = resume.intro || '';
  
  editorSection.style.display = 'block';
}

function duplicateResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
  const newResume = { ...resume, 
    id: Date.now().toString(), 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  newResume.archived = false;
  
  resumes.push(newResume);
  localStorage.setItem('resumes', JSON.stringify(resumes));
  renderResumes();
}

function archiveResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
  resume.archived = true;
  resume.updatedAt = new Date().toISOString();
  
  localStorage.setItem('resumes', JSON.stringify(resumes));
  renderResumes();
}

function restoreResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
  resume.archived = false;
  resume.updatedAt = new Date().toISOString();
  
  localStorage.setItem('resumes', JSON.stringify(resumes));
  renderResumes();
}

function createResume() {
  editingId = null;
  
  document.getElementById('form-title').value = '';
  document.getElementById('form-name').value = '';
  document.getElementById('form-role').value = '';
  document.getElementById('form-email').value = '';
  document.getElementById('form-intro').value = '';
  
  editorSection.style.display = 'block';
}

function saveResume(e) {
  e.preventDefault();
  
  const title = document.getElementById('form-title').value.trim();
  const name = document.getElementById('form-name').value.trim();
  const role = document.getElementById('form-role').value.trim();
  
  if (!title) {
    alert('제목은 필수입니다.');
    return;
  }
  
  if (!name) {
    alert('이름은 필수입니다.');
    return;
  }
  
  if (!role) {
    alert('직무는 필수입니다.');
    return;
  }
  
  const email = document.getElementById('form-email').value;
  const intro = document.getElementById('form-intro').value;
  
  const now = new Date().toISOString();
  
  if (editingId) {
    const resume = resumes.find(r => r.id === editingId);
    if (resume) {
      resume.title = title;
      resume.name = name;
      resume.role = role;
      resume.email = email;
      resume.intro = intro;
      resume.updatedAt = now;
      
      localStorage.setItem('resumes', JSON.stringify(resumes));
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
      createdAt: now,
      updatedAt: now
    };
    
    resumes.push(newResume);
    localStorage.setItem('resumes', JSON.stringify(resumes));
  }
  
  editorSection.style.display = 'none';
  renderResumes();
}

function cancelEdit() {
  editorSection.style.display = 'none';
  editingId = null;
}

newResumeBtn.addEventListener('click', createResume);
resumeForm.addEventListener('submit', saveResume);
cancelBtn.addEventListener('click', cancelEdit);

filterAll.addEventListener('click', () => {
  currentFilter = 'all';
  filterAll.classList.add('active');
  filterArchived.classList.remove('active');
  renderResumes();
});

filterArchived.addEventListener('click', () => {
  currentFilter = 'archived';
  filterArchived.classList.add('active');
  filterAll.classList.remove('active');
  renderResumes();
});

resumeSearch.addEventListener('input', renderResumes);

renderResumes();