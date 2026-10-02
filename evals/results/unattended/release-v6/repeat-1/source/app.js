const resumeList = document.getElementById('resume-list');
const newResumeBtn = document.getElementById('new-resume-btn');
const searchForm = document.getElementById('search-form');
const resumeSearch = document.getElementById('resume-search');
const filterAll = document.getElementById('filter-all');
const filterArchive = document.getElementById('filter-archive');
const editorSection = document.getElementById('editor-section');
const resumeForm = document.getElementById('resume-form');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const formName = document.getElementById('form-name');
const formRole = document.getElementById('form-role');
const formEmail = document.getElementById('form-email');
const formIntroduction = document.getElementById('form-introduction');

let resumes = JSON.parse(localStorage.getItem('resumes')) || [];
let editingId = null;
let currentFilter = 'all';

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function renderResumes(resumesToRender) {
  resumeList.innerHTML = '';

  if (resumesToRender.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = '검색 결과가 없습니다.';
    emptyMessage.style.gridColumn = 'span 3';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.marginTop = '40px';
    resumeList.appendChild(emptyMessage);
    return;
  }

  resumesToRender.forEach(resume => {
    const card = document.createElement('div');
    card.className = 'document-card';

    const stage = document.createElement('div');
    stage.className = 'document-stage';

    const paper = document.createElement('div');
    paper.className = 'document-paper';

    const title = document.createElement('h3');
    title.textContent = resume.title;

    const role = document.createElement('p');
    role.textContent = resume.role;

    const introduction = document.createElement('p');
    introduction.textContent = resume.introduction || '';

    const sectionHeading = document.createElement('h4');
    sectionHeading.textContent = '개인 정보';

    const name = document.createElement('p');
    name.textContent = `이름: ${resume.name}`;

    const email = document.createElement('p');
    email.textContent = `이메일: ${resume.email || ''}`;

    const modifiedDate = document.createElement('p');
    modifiedDate.textContent = `수정일: ${formatDate(resume.modified)}`;

    paper.appendChild(title);
    paper.appendChild(role);
    paper.appendChild(introduction);
    paper.appendChild(sectionHeading);
    paper.appendChild(name);
    paper.appendChild(email);
    stage.appendChild(paper);

    const actions = document.createElement('div');
    actions.className = 'document-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = '편집';
    editBtn.onclick = () => editResume(resume.id);

    const duplicateBtn = document.createElement('button');
    duplicateBtn.type = 'button';
    duplicateBtn.textContent = '복제';
    duplicateBtn.onclick = () => duplicateResume(resume.id);

    const archiveBtn = document.createElement('button');
    archiveBtn.type = 'button';
    archiveBtn.textContent = resume.archived ? '복원' : '보관';
    archiveBtn.onclick = () => toggleArchive(resume.id);

    actions.appendChild(editBtn);
    actions.appendChild(duplicateBtn);
    actions.appendChild(archiveBtn);

    card.appendChild(stage);
    card.appendChild(actions);

    if (resume.example) {
      const exampleBadge = document.createElement('div');
      exampleBadge.className = 'example-badge';
      exampleBadge.textContent = '예시';
      card.appendChild(exampleBadge);
    }

    resumeList.appendChild(card);
  });
}

function editResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;

  editingId = id;
  formTitle.value = resume.title || '';
  formName.value = resume.name || '';
  formRole.value = resume.role || '';
  formEmail.value = resume.email || '';
  formIntroduction.value = resume.introduction || '';

  editorSection.classList.remove('editor-hidden');
}

function duplicateResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;

  const newResume = { ...resume, id: generateId(), modified: new Date().toISOString() };
  resumes.push(newResume);
  saveResumes();
  renderResumes(getFilteredResumes());
}

function toggleArchive(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;

  resume.archived = !resume.archived;
  saveResumes();
  renderResumes(getFilteredResumes());
}

function getFilteredResumes() {
  let filtered = resumes.filter(r => r.archived === (currentFilter === 'archive'));

  if (resumeSearch.value) {
    const searchTerm = resumeSearch.value.toLowerCase();
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(searchTerm) || 
      r.role.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
}

function saveResumes() {
  localStorage.setItem('resumes', JSON.stringify(resumes));
}

function showEditor() {
  editorSection.classList.remove('editor-hidden');
  editingId = null;
  formTitle.value = '';
  formName.value = '';
  formRole.value = '';
  formEmail.value = '';
  formIntroduction.value = '';
}

function hideEditor() {
  editorSection.classList.add('editor-hidden');
}

resumeForm.addEventListener('submit', function(e) {
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
    id: editingId || generateId(),
    title,
    name,
    role,
    email: formEmail.value,
    introduction: formIntroduction.value,
    modified: new Date().toISOString(),
    archived: false
  };

  if (editingId) {
    const index = resumes.findIndex(r => r.id === editingId);
    if (index !== -1) {
      resumes[index] = newResume;
    }
  } else {
    resumes.push(newResume);
  }

  saveResumes();
  renderResumes(getFilteredResumes());
  hideEditor();
});

cancelBtn.addEventListener('click', hideEditor);

newResumeBtn.addEventListener('click', showEditor);

searchForm.addEventListener('submit', function(e) {
  e.preventDefault();
  renderResumes(getFilteredResumes());
});

resumeSearch.addEventListener('input', () => {
  renderResumes(getFilteredResumes());
});

filterAll.addEventListener('click', function() {
  currentFilter = 'all';
  filterAll.classList.add('active');
  filterArchive.classList.remove('active');
  renderResumes(getFilteredResumes());
});

filterArchive.addEventListener('click', function() {
  currentFilter = 'archive';
  filterArchive.classList.add('active');
  filterAll.classList.remove('active');
  renderResumes(getFilteredResumes());
});

                                                   
if (resumes.length === 0) {
  resumes = [
    {
      id: generateId(),
      title: '이력서 예시 1',
      name: '홍길동',
      role: '프론트엔드 개발자',
      email: 'hong@example.com',
      introduction: '웹 개발에 관심이 많습니다.',
      modified: new Date().toISOString(),
      archived: false,
      example: true
    },
    {
      id: generateId(),
      title: '이력서 예시 2',
      name: '김철수',
      role: '백엔드 개발자',
      email: 'kim@example.com',
      introduction: '서버 개발에 특화되어 있습니다.',
      modified: new Date().toISOString(),
      archived: false,
      example: true
    },
    {
      id: generateId(),
      title: '이력서 예시 3',
      name: '이영희',
      role: '디자이너',
      email: 'lee@example.com',
      introduction: '사용자 경험을 중요하게 생각합니다.',
      modified: new Date().toISOString(),
      archived: false,
      example: true
    }
  ];
  saveResumes();
}

renderResumes(getFilteredResumes());