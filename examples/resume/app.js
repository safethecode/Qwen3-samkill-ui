                

          
const resumeList = document.getElementById('resume-list');
const resumeForm = document.getElementById('resume-form');
const newResumeBtn = document.getElementById('new-resume-btn');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const cancelBtn = document.getElementById('cancel-btn');
const resumeFormContent = document.getElementById('resume-form-content');

             
const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let resumes = JSON.parse(localStorage.getItem('resumes')) || [];
let currentFilter = 'all';

                   
function renderResumes() {
             
  let filteredResumes = resumes;
  if (currentFilter === 'saved') {
    filteredResumes = resumes.filter(resume => resume.saved);
  } else if (currentFilter === 'all') {
    filteredResumes = resumes.filter(resume => !resume.saved);
  }
  
           
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filteredResumes = filteredResumes.filter(resume => 
      resume.title.toLowerCase().includes(searchTerm) || 
      resume.position.toLowerCase().includes(searchTerm)
    );
  }
  
             
  resumeList.innerHTML = '';
  
  if (filteredResumes.length === 0) {
    document.getElementById('empty-state').classList.remove('hidden');
    return;
  }
  
  document.getElementById('empty-state').classList.add('hidden');
  
  filteredResumes.forEach(resume => {
    const resumeItem = document.createElement('div');
    resumeItem.className = 'resume-item';
    
                
    const date = new Date(resume.date);
    const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    
        resumeItem.innerHTML = `
      <div class="document-stage"><div class="document-paper"><h4>${escapeHtml(resume.name)}</h4><p>${escapeHtml(resume.position)}</p><p>${escapeHtml(resume.intro)}</p></div></div>
      <h3 class="resume-title">${escapeHtml(resume.title)}</h3>
      <p class="resume-position">${escapeHtml(resume.position)}</p>
      <p class="resume-date">${formattedDate}</p>
      ${resume.example ? '<span class="example-label">예시</span>' : ''}
      <div class="resume-actions">
        <button class="action-btn edit-btn" data-id="${resume.id}">편집</button>
        <button class="action-btn clone-btn" data-id="${resume.id}">복제</button>
        <button class="action-btn ${resume.saved ? 'unsaved-btn' : 'save-btn'}" data-id="${resume.id}">
          ${resume.saved ? '보관 해제' : '보관'}
        </button>
      </div>
    `;
    
    resumeList.appendChild(resumeItem);
  });
  
               
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => editResume(e.target.dataset.id));
  });
  
  document.querySelectorAll('.clone-btn').forEach(btn => {
    btn.addEventListener('click', (e) => cloneResume(e.target.dataset.id));
  });
  
  document.querySelectorAll('.save-btn, .unsaved-btn').forEach(btn => {
    btn.addEventListener('click', (e) => toggleSave(e.target.dataset.id));
  });
}

            
function createNewResume() {
  resumeForm.classList.remove('hidden');
  resumeFormContent.reset();
  resumeFormContent.dataset.editingId = '';
  document.querySelector('.form-title').textContent = '이력서 작성';
                                                   
  setTimeout(() => { 
    resumeFormContent.focus(); 
  }, 0);
  renderResumes();
}

         
function editResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
               
  document.getElementById('resume-title').value = resume.title;
  document.getElementById('resume-name').value = resume.name;
  document.getElementById('resume-position').value = resume.position;
  document.getElementById('resume-email').value = resume.email || '';
  document.getElementById('resume-intro').value = resume.intro;
  
                    
  resumeForm.classList.remove('hidden');
  document.querySelector('.form-title').textContent = '이력서 편집';
  resumeFormContent.dataset.editingId = id;
}

         
function cloneResume(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
              
  const newResume = { ...resume };
  newResume.id = generateId();
  newResume.date = new Date().toISOString();
  newResume.saved = false;
  newResume.title += ' (복제)';
  newResume.example = false;
  
  resumes.push(newResume);
  saveResumes();
  renderResumes();
}

               
function toggleSave(id) {
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  
  resume.saved = !resume.saved;
  saveResumes();
  renderResumes();
}

         
function saveResumes() {
  localStorage.setItem('resumes', JSON.stringify(resumes));
}

                         
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

          
resumeFormContent.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const title = document.getElementById('resume-title').value.trim();
  const name = document.getElementById('resume-name').value.trim();
  const position = document.getElementById('resume-position').value.trim();
  const email = document.getElementById('resume-email').value.trim();
  const intro = document.getElementById('resume-intro').value.trim();
  
             
  if (!title || !name || !position) {
    alert('필수 입력란을 모두 입력해주세요.');
    return;
  }
  
             
  const editingId = this.dataset.editingId;
  
  if (editingId) {
             
    const resumeIndex = resumes.findIndex(r => r.id === editingId);
    if (resumeIndex !== -1) {
      resumes[resumeIndex].title = title;
      resumes[resumeIndex].name = name;
      resumes[resumeIndex].position = position;
      resumes[resumeIndex].email = email;
      resumes[resumeIndex].intro = intro;
      resumes[resumeIndex].date = new Date().toISOString();
    }
  } else {
               
    const newResume = {
      id: generateId(),
      title,
      name,
      position,
      email,
      intro,
      date: new Date().toISOString(),
      saved: false
    };
    
    resumes.push(newResume);
  }
  
  saveResumes();
  renderResumes();
  resumeForm.classList.add('hidden');
});

        
searchInput.addEventListener('input', renderResumes);

        
filterBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.filter;
    renderResumes();
  });
});

        
cancelBtn.addEventListener('click', function() {
  resumeForm.classList.add('hidden');
  resumeFormContent.reset();
  resumeFormContent.removeAttribute('editingId');
});

           
newResumeBtn.addEventListener('click', createNewResume);

         
renderResumes();

                   
if (resumes.length === 0) {
  const exampleResumes = [
    {
      id: generateId(),
      title: '프론트엔드 개발자 이력서',
      name: '홍길동',
      position: '프론트엔드 개발자',
      email: 'hong@example.com',
      intro: '웹 개발의 열정을 가진 프론트엔드 개발자입니다. React와 Vue.js에 능숙하며, 웹 접근성과 사용자 경험에 중점을 둡니다.',
      date: new Date(Date.now() - 86400000).toISOString(),
      saved: false,
      example: true
    },
    {
      id: generateId(),
      title: '백엔드 개발자 이력서',
      name: '김철수',
      position: '백엔드 개발자',
      email: 'kim@example.com',
      intro: '대용량 서버 아키텍처 설계에 관심이 많은 백엔드 개발자입니다. Node.js, Python, Go 등을 다룰 수 있으며 RESTful API 설계에 능숙합니다.',
      date: new Date(Date.now() - 172800000).toISOString(),
      saved: false,
      example: true
    },
    {
      id: generateId(),
      title: '디자이너 이력서',
      name: '이민수',
      position: 'UX/UI 디자이너',
      email: 'lee@example.com',
      intro: '사용자 중심 디자인을 중시하는 UX/UI 디자이너입니다. Figma, Adobe XD 등 디자인 툴에 능숙하며 사용자 경험 향상을 위한 통계 분석도 가능합니다.',
      date: new Date(Date.now() - 259200000).toISOString(),
      saved: false,
      example: true
    }
  ];
  
  resumes = exampleResumes;
  saveResumes();
  renderResumes();
}