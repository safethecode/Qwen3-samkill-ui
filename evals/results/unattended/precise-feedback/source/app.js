const resumeList = document.getElementById('resume-list');
const newResumeBtn = document.getElementById('new-resume-btn');
const searchForm = document.getElementById('search-form');
const resumeSearch = document.getElementById('resume-search');
const filterButtons = document.querySelectorAll('.filter-btn');
const editorSection = document.getElementById('editor-section');
const resumeForm = document.getElementById('resume-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

let resumes = JSON.parse(localStorage.getItem('resumes')) || [];
let editingId = null;
let currentFilter = 'all';

if (resumes.length === 0) {
  resumes = [
    {
      id: '1',
      title: '개발자 이력서',
      name: '김개발',
      role: '프론트엔드 개발자',
      email: 'kim@example.com',
      intro: '5 년차 프론트엔드 개발자로 웹 애플리케이션 개발에 능숙합니다.',
      archived: false,
      modified: new Date().toISOString(),
      sample: true
    },
    {
      id: '2',
      title: '디자이너 이력서',
      name: '이디자인',
      role: 'UX 디자이너',
      email: 'lee@example.com',
      intro: '사용자 중심 디자인을 중시하며, 다양한 프로젝트에서 성공적인 결과를 도출했습니다.',
      archived: false,
      modified: new Date().toISOString(),
      sample: true
    },
    {
      id: '3',
      title: '기획자 이력서',
      name: '박기획',
      role: '프로덕트 기획자',
      email: 'park@example.com',
      intro: '시장 분석과 사용자 요구를 바탕으로 전략적인 프로덕트 기획을 수행합니다.',
      archived: false,
      modified: new Date().toISOString(),
      sample: true
    }
  ];
  saveResumes();
}

function saveResumes() {
  localStorage.setItem('resumes', JSON.stringify(resumes));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
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
      resume.role.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filteredResumes.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = '검색 결과가 없습니다.';
    emptyMessage.style.gridColumn = '1 / -1';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.marginTop = '2rem';
    resumeList.appendChild(emptyMessage);
    return;
  }
  
  filteredResumes.forEach(resume => {
    const resumeCard = document.createElement('div');
    resumeCard.className = 'document-card';
    
    const stage = document.createElement('div');
    stage.className = 'document-stage';
    
    const paper = document.createElement('div');
    paper.className = 'document-paper';
    
    if (resume.sample) {
      const badgeEl = document.createElement('span');
      badgeEl.textContent = '예시';
      stage.appendChild(badgeEl);
    }
    
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
    introEl.textContent = resume.intro;
    paper.appendChild(introEl);
    
    stage.appendChild(paper);
    
    const metadata = document.createElement('div');
    metadata.className = 'document-metadata';
    
    const emailEl = document.createElement('p');
    emailEl.textContent = resume.email;
    metadata.appendChild(emailEl);
    
    const modifiedEl = document.createElement('p');
    modifiedEl.textContent = `수정일: ${formatDate(resume.modified)}`;
    metadata.appendChild(modifiedEl);
    
    resumeCard.appendChild(stage);
    resumeCard.appendChild(metadata);
    
    const actions = document.createElement('div');
    actions.className = 'document-actions';
    
    const editBtn = document.createElement('button');
    editBtn.textContent = '편집';
    editBtn.className = 'secondary-action';
    editBtn.onclick = () => {
      editingId = resume.id;
      populateForm(resume);
      editorSection.classList.remove('editor-hidden');
    };
    
    const duplicateBtn = document.createElement('button');
    duplicateBtn.textContent = '복제';
    duplicateBtn.className = 'secondary-action';
    duplicateBtn.onclick = () => {
      const newResume = { ...resume, id: Date.now().toString(), modified: new Date().toISOString() };
      resumes.push(newResume);
      saveResumes();
      renderResumes();
    };
    
    const archiveBtn = document.createElement('button');
    archiveBtn.textContent = resume.archived ? '복원' : '보관';
    archiveBtn.className = 'secondary-action';
    archiveBtn.onclick = () => {
      const targetResume = resumes.find(r => r.id === resume.id);
      if (targetResume) {
        targetResume.archived = !targetResume.archived;
        saveResumes();
        renderResumes();
      }
    };
    
    actions.appendChild(editBtn);
    actions.appendChild(duplicateBtn);
    actions.appendChild(archiveBtn);
    resumeCard.appendChild(actions);
    
    resumeList.appendChild(resumeCard);
  });
}

function populateForm(resume) {
  document.getElementById('resume-title').value = resume.title;
  document.getElementById('resume-name').value = resume.name;
  document.getElementById('resume-role').value = resume.role;
  document.getElementById('resume-email').value = resume.email;
  document.getElementById('resume-intro').value = resume.intro;
}

function clearForm() {
  document.getElementById('resume-title').value = '';
  document.getElementById('resume-name').value = '';
  document.getElementById('resume-role').value = '';
  document.getElementById('resume-email').value = '';
  document.getElementById('resume-intro').value = '';
}

newResumeBtn.addEventListener('click', () => {
  editingId = null;
  clearForm();
  editorSection.classList.remove('editor-hidden');
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  renderResumes();
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    renderResumes();
  });
});

resumeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const title = document.getElementById('resume-title').value.trim();
  const name = document.getElementById('resume-name').value.trim();
  const role = document.getElementById('resume-role').value.trim();
  
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
    email: document.getElementById('resume-email').value,
    intro: document.getElementById('resume-intro').value,
    archived: false,
    modified: new Date().toISOString()
  };
  
  if (editingId) {
    const index = resumes.findIndex(r => r.id === editingId);
    if (index !== -1) {
      resumes[index] = { ...resumes[index], ...newResume, modified: new Date().toISOString() };
    }
  } else {
    resumes.push(newResume);
  }
  
  saveResumes();
  renderResumes();
  editorSection.classList.add('editor-hidden');
});

cancelEditBtn.addEventListener('click', () => {
  editorSection.classList.add('editor-hidden');
  editingId = null;
});

renderResumes();