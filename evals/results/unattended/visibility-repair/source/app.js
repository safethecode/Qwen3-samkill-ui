const STORAGE_KEY = 'resumes';
const SAMPLE_RESUMES = [
  {
    id: 'sample-1',
    title: '프론트엔드 개발자 이력서',
    name: '김철수',
    role: '프론트엔드 개발자',
    email: 'kim@example.com',
    intro: '웹 개발에 관심이 많습니다.',
    archived: false,
    createdAt: new Date('2023-01-01').toISOString(),
    updatedAt: new Date('2023-01-01').toISOString()
  },
  {
    id: 'sample-2',
    title: '백엔드 개발자 이력서',
    name: '이영희',
    role: '백엔드 개발자',
    email: 'lee@example.com',
    intro: '서버 개발에 특화되어 있습니다.',
    archived: false,
    createdAt: new Date('2023-01-02').toISOString(),
    updatedAt: new Date('2023-01-02').toISOString()
  },
  {
    id: 'sample-3',
    title: '디자이너 이력서',
    name: '박지영',
    role: 'UI/UX 디자이너',
    email: 'park@example.com',
    intro: '사용자 중심 디자인을 추구합니다.',
    archived: false,
    createdAt: new Date('2023-01-03').toISOString(),
    updatedAt: new Date('2023-01-03').toISOString()
  }
];

let resumes = [];
let editingId = null;
let currentFilter = 'all';

const resumeList = document.getElementById('resume-list');
const newResumeBtn = document.getElementById('new-resume-btn');
const resumeSearch = document.getElementById('resume-search');
const filterAllBtn = document.getElementById('filter-all');
const filterArchivedBtn = document.getElementById('filter-archived');
const editorSection = document.getElementById('editor-section');
const resumeForm = document.getElementById('resume-form');
const cancelEditBtn = document.getElementById('cancel-edit');

const titleInput = document.getElementById('resume-title');
const nameInput = document.getElementById('resume-name');
const roleInput = document.getElementById('resume-role');
const emailInput = document.getElementById('resume-email');
const introInput = document.getElementById('resume-intro');

function loadResumes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    resumes = JSON.parse(saved);
  } else {
    resumes = SAMPLE_RESUMES;
    saveResumes();
  }
}

function saveResumes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function renderResumeCard(resume) {
  const card = document.createElement('article');
  card.className = 'document-card';
  card.dataset.id = resume.id;

  const stage = document.createElement('div');
  stage.className = 'document-stage';

  const paper = document.createElement('div');
  paper.className = 'document-paper';

  const titleEl = document.createElement('h3');
  titleEl.textContent = resume.title;
  paper.appendChild(titleEl);

  const nameEl = document.createElement('p');
  nameEl.textContent = resume.name;
  paper.appendChild(nameEl);

  const roleEl = document.createElement('p');
  roleEl.textContent = resume.role;
  paper.appendChild(roleEl);

  const introEl = document.createElement('p');
  introEl.textContent = resume.intro || '소개가 없습니다.';
  paper.appendChild(introEl);

  stage.appendChild(paper);
  card.appendChild(stage);

  const metadata = document.createElement('div');
  metadata.className = 'document-metadata';

  if (resume.id.startsWith('sample-')) {
    const badge = document.createElement('span');
    badge.className = 'sample-badge';
    badge.textContent = '예시';
    metadata.appendChild(badge);
  }

  const dateEl = document.createElement('p');
  dateEl.className = 'document-date';
  dateEl.textContent = `수정일: ${formatDate(resume.updatedAt)}`;
  metadata.appendChild(dateEl);

  const actions = document.createElement('div');
  actions.className = 'document-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'secondary-btn';
  editBtn.textContent = '편집';
  editBtn.onclick = () => editResume(resume.id);
  actions.appendChild(editBtn);

  const duplicateBtn = document.createElement('button');
  duplicateBtn.className = 'secondary-btn';
  duplicateBtn.textContent = '복제';
  duplicateBtn.onclick = () => duplicateResume(resume.id);
  actions.appendChild(duplicateBtn);

  if (resume.archived) {
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'secondary-btn';
    restoreBtn.textContent = '복원';
    restoreBtn.onclick = () => toggleArchive(resume.id, false);
    actions.appendChild(restoreBtn);
  } else {
    const archiveBtn = document.createElement('button');
    archiveBtn.className = 'secondary-btn';
    archiveBtn.textContent = '보관';
    archiveBtn.onclick = () => toggleArchive(resume.id, true);
    actions.appendChild(archiveBtn);
  }

  metadata.appendChild(actions);
  card.appendChild(metadata);

  return card;
}

function renderResumes() {
  resumeList.innerHTML = '';

  let filteredResumes = resumes;
  if (currentFilter === 'archived') {
    filteredResumes = resumes.filter(r => r.archived);
  } else {
    filteredResumes = resumes.filter(r => !r.archived);
  }

  const searchTerm = resumeSearch.value.toLowerCase();
  if (searchTerm) {
    filteredResumes = filteredResumes.filter(resume => 
      resume.title.toLowerCase().includes(searchTerm) ||
      resume.name.toLowerCase().includes(searchTerm) ||
      resume.role.toLowerCase().includes(searchTerm)
    );
  }

  if (filteredResumes.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'empty-message';
    emptyMsg.textContent = '검색 결과가 없습니다.';
    resumeList.appendChild(emptyMsg);
    return;
  }

  filteredResumes.forEach(resume => {
    const card = renderResumeCard(resume);
    resumeList.appendChild(card);
  });
}

function editResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;

  editingId = id;
  titleInput.value = resume.title || '';
  nameInput.value = resume.name || '';
  roleInput.value = resume.role || '';
  emailInput.value = resume.email || '';
  introInput.value = resume.intro || '';

  editorSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function duplicateResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;

  const newId = `resume-${Date.now()}`;
  const newResume = { ...resume, id: newId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  resumes.push(newResume);
  saveResumes();
  renderResumes();
}

function toggleArchive(id, archived) {
  const resume = resumes.find(r => r.id === id);
  if (resume) {
    resume.archived = archived;
    resume.updatedAt = new Date().toISOString();
    saveResumes();
    renderResumes();
  }
}

function createResume() {
  editingId = null;
  titleInput.value = '';
  nameInput.value = '';
  roleInput.value = '';
  emailInput.value = '';
  introInput.value = '';

  editorSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveResume(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const name = nameInput.value.trim();
  const role = roleInput.value.trim();

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

  const now = new Date().toISOString();

  if (editingId) {
                      
    const resume = resumes.find(r => r.id === editingId);
    if (resume) {
      resume.title = title;
      resume.name = name;
      resume.role = role;
      resume.email = emailInput.value.trim();
      resume.intro = introInput.value.trim();
      resume.updatedAt = now;
      saveResumes();
    }
  } else {
                 
    const newId = `resume-${Date.now()}`;
    const newResume = {
      id: newId,
      title,
      name,
      role,
      email: emailInput.value.trim(),
      intro: introInput.value.trim(),
      archived: false,
      createdAt: now,
      updatedAt: now
    };
    resumes.push(newResume);
    saveResumes();
  }

  editorSection.classList.add('hidden');
  renderResumes();
}

function cancelEdit() {
  editorSection.classList.add('hidden');
  editingId = null;
}

function setupEventListeners() {
  newResumeBtn.addEventListener('click', createResume);
  resumeSearch.addEventListener('input', renderResumes);
  filterAllBtn.addEventListener('click', () => {
    currentFilter = 'all';
    filterAllBtn.classList.add('active');
    filterArchivedBtn.classList.remove('active');
    renderResumes();
  });
  filterArchivedBtn.addEventListener('click', () => {
    currentFilter = 'archived';
    filterArchivedBtn.classList.add('active');
    filterAllBtn.classList.remove('active');
    renderResumes();
  });
  resumeForm.addEventListener('submit', saveResume);
  cancelEditBtn.addEventListener('click', cancelEdit);
}

function init() {
  loadResumes();
  setupEventListeners();
  renderResumes();
}

init();