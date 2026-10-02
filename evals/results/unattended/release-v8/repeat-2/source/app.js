const resumeList = document.getElementById('resume-list');
const newResumeBtn = document.getElementById('new-resume-btn');
const filterAll = document.getElementById('filter-all');
const filterArchive = document.getElementById('filter-archive');
const resumeSearch = document.getElementById('resume-search');
const editorSection = document.getElementById('editor-section');
const resumeForm = document.getElementById('resume-form');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const formName = document.getElementById('form-name');
const formRole = document.getElementById('form-role');
const formEmail = document.getElementById('form-email');
const formIntro = document.getElementById('form-intro');

let resumes = JSON.parse(localStorage.getItem('resumes')) || [];
let editingId = null;
let currentFilter = 'all';

                                                  
if (resumes.length === 0) {
  resumes = [
    {
      id: '1',
      title: '웹 개발자 이력서',
      name: '김철수',
      role: '프론트엔드 개발자',
      email: 'kim@example.com',
      intro: '5년차 프론트엔드 개발자로 웹 애플리케이션 개발에 관심이 많습니다.',
      archived: false,
      sample: true,
      modified: new Date().toISOString()
    },
    {
      id: '2',
      title: '디자인 이력서',
      name: '이영희',
      role: 'UX 디자이너',
      email: 'lee@example.com',
      intro: '사용자 중심 디자인을 추구하며, 웹 및 모바일 플랫폼에서의 경험을 설계합니다.',
      archived: false,
      sample: true,
      modified: new Date().toISOString()
    },
    {
      id: '3',
      title: '데이터 분석 이력서',
      name: '박민수',
      role: '데이터 분석가',
      email: 'park@example.com',
      intro: '데이터 기반 의사결정을 지원하는 분석 프로젝트에 참여했습니다.',
      archived: false,
      sample: true,
      modified: new Date().toISOString()
    }
  ];
  saveResumes();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function saveResumes() {
  localStorage.setItem('resumes', JSON.stringify(resumes));
}

function renderResumeCard(resume) {
  const card = document.createElement('div');
  card.className = 'document-card';
  
  const stage = document.createElement('div');
  stage.className = 'document-stage';
  
  const paper = document.createElement('div');
  paper.className = 'document-paper';
  
  const titleEl = document.createElement('h3');
  titleEl.textContent = resume.title;
  
  const nameEl = document.createElement('p');
  nameEl.textContent = resume.name;
  
  const roleEl = document.createElement('p');
  roleEl.textContent = resume.role;
  
  const introEl = document.createElement('p');
  introEl.textContent = resume.intro;
  
  const sectionHeading = document.createElement('h4');
  sectionHeading.textContent = '개인 정보';
  
  paper.appendChild(titleEl);
  paper.appendChild(nameEl);
  paper.appendChild(roleEl);
  paper.appendChild(introEl);
  paper.appendChild(sectionHeading);
  
  stage.appendChild(paper);
  card.appendChild(stage);
  
  const metadata = document.createElement('div');
  metadata.className = 'document-metadata';
  
  const titleMeta = document.createElement('p');
  titleMeta.textContent = resume.title;
  
  const roleMeta = document.createElement('p');
  roleMeta.textContent = resume.role;
  
  const modifiedMeta = document.createElement('p');
  modifiedMeta.textContent = `수정일: ${formatDate(resume.modified)}`;
  
  metadata.appendChild(titleMeta);
  metadata.appendChild(roleMeta);
  metadata.appendChild(modifiedMeta);
  
  const actions = document.createElement('div');
  actions.className = 'document-actions';
  
  const editBtn = document.createElement('button');
  editBtn.textContent = '편집';
  editBtn.className = 'btn-secondary';
  editBtn.onclick = () => editResume(resume.id);
  
  const duplicateBtn = document.createElement('button');
  duplicateBtn.textContent = '복제';
  duplicateBtn.className = 'btn-secondary';
  duplicateBtn.onclick = () => duplicateResume(resume.id);
  
  const archiveBtn = document.createElement('button');
  archiveBtn.textContent = resume.archived ? '복원' : '보관';
  archiveBtn.className = 'btn-secondary';
  archiveBtn.onclick = () => toggleArchive(resume.id);
  
  actions.appendChild(editBtn);
  actions.appendChild(duplicateBtn);
  actions.appendChild(archiveBtn);
  
  card.appendChild(metadata);
  card.appendChild(actions);
  
  if (resume.sample) {
    const badge = document.createElement('span');
    badge.className = 'sample-badge';
    badge.textContent = '예시';
    card.appendChild(badge);
  }
  
  return card;
}

function renderResumes() {
  resumeList.innerHTML = '';
  
  let filteredResumes = resumes;
  
  if (currentFilter === 'archive') {
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
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = '검색 결과가 없습니다.';
    emptyMessage.className = 'empty-message';
    resumeList.appendChild(emptyMessage);
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
  
  formTitle.value = resume.title;
  formName.value = resume.name;
  formRole.value = resume.role;
  formEmail.value = resume.email || '';
  formIntro.value = resume.intro || '';
  
  editingId = id;
  editorSection.classList.remove('hidden');
}

function duplicateResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
  const newResume = { ...resume, 
    id: Date.now().toString(), 
    title: `${resume.title} (복사본)`,
    modified: new Date().toISOString()
  };
  
  resumes.push(newResume);
  saveResumes();
  renderResumes();
}

function toggleArchive(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
  resume.archived = !resume.archived;
  resume.modified = new Date().toISOString();
  saveResumes();
  renderResumes();
}

function createNewResume() {
  formTitle.value = '';
  formName.value = '';
  formRole.value = '';
  formEmail.value = '';
  formIntro.value = '';
  
  editingId = null;
  editorSection.classList.remove('hidden');
}

function cancelEdit() {
  editorSection.classList.add('hidden');
  editingId = null;
}

function saveResume(e) {
  e.preventDefault();
  
  const title = formTitle.value.trim();
  const name = formName.value.trim();
  const role = formRole.value.trim();
  
  if (!title) {
    alert('제목은 필수 입력입니다.');
    return;
  }
  
  if (!name) {
    alert('이름은 필수 입력입니다.');
    return;
  }
  
  if (!role) {
    alert('직무는 필수 입력입니다.');
    return;
  }
  
  const newResume = {
    id: Date.now().toString(),
    title,
    name,
    role,
    email: formEmail.value.trim() || null,
    intro: formIntro.value.trim() || null,
    archived: false,
    modified: new Date().toISOString()
  };
  
  if (editingId) {
    const index = resumes.findIndex(r => r.id === editingId);
    if (index !== -1) {
      resumes[index] = { ...resumes[index], ...newResume, id: editingId };
    }
  } else {
    resumes.push(newResume);
  }
  
  saveResumes();
  renderResumes();
  cancelEdit();
}

                  
newResumeBtn.addEventListener('click', createNewResume);
filterAll.addEventListener('click', () => {
  currentFilter = 'all';
  filterAll.classList.add('active');
  filterArchive.classList.remove('active');
  renderResumes();
});
filterArchive.addEventListener('click', () => {
  currentFilter = 'archive';
  filterArchive.classList.add('active');
  filterAll.classList.remove('active');
  renderResumes();
});
resumeSearch.addEventListener('input', renderResumes);
resumeForm.addEventListener('submit', saveResume);
cancelBtn.addEventListener('click', cancelEdit);

                 
renderResumes();