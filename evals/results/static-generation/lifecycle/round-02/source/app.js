  
         
                                               
   

const mentors = [
  {
    id: 'mentor-1',
    name: '김서연',
    role: '프로덕트 디자이너',
    avatar: 'assets/reference/avatar-1.png',
    certification: { label: 'UX 전문가', color: '#6b46c1' },          
    employer: { label: '현재: 테크 주식회사', color: '#2563eb' },        
    description: '사용자 경험 개선과 데이터 기반 디자인 의사결정을 전문으로 합니다. 복잡한 시스템을 직관적인 인터페이스로 변환하는 데 중점을 둡니다.',
    isFavorite: false
  },
  {
    id: 'mentor-2',
    name: '박민준',
    role: '프론트엔드 개발자',
    avatar: 'assets/reference/avatar-2.png',
    certification: { label: 'AWS 솔루션 아키텍트', color: '#6b46c1' },          
    employer: { label: '현재: 클라우드 스타트업', color: '#2563eb' },        
    description: '반응형 웹 애플리케이션 및 고성능 UI 구현에 대한 깊은 이해를 가지고 있습니다. 접근성과 성능 최적화를 중요하게 생각합니다.',
    isFavorite: false
  }
];

function renderStaticView() {
  const list = document.getElementById('mentor-list');
  if (!list) return;

                        
  mentors.forEach(mentor => {
    const card = document.createElement('article');
    card.className = 'mentor-card';
    card.dataset.id = mentor.id;

                                           
    const header = document.createElement('div');
    header.className = 'card-header';

    const avatar = document.createElement('img');
    avatar.src = mentor.avatar;
    avatar.alt = `${mentor.name} 프로필`;
    avatar.className = 'mentor-avatar';

    const info = document.createElement('div');
    info.className = 'mentor-info';

    const name = document.createElement('h2');
    name.textContent = mentor.name;
    name.className = 'mentor-name';

    const role = document.createElement('p');
    role.textContent = mentor.role;
    role.className = 'mentor-role';

    info.appendChild(name);
    info.appendChild(role);

    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = 'favorite-btn';
    favBtn.setAttribute('aria-label', `${mentor.name} 즐겨찾기`);
                                                                               
    favBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

    header.appendChild(avatar);
    header.appendChild(info);
    header.appendChild(favBtn);

                                         
    const meta = document.createElement('div');
    meta.className = 'mentor-meta';

    const certBadge = document.createElement('span');
    certBadge.textContent = mentor.certification.label;
    certBadge.style.backgroundColor = `${mentor.certification.color}20`;               
    certBadge.style.color = mentor.certification.color;
    certBadge.className = 'badge';

    const empBadge = document.createElement('span');
    empBadge.textContent = mentor.employer.label;
    empBadge.style.backgroundColor = `${mentor.employer.color}20`;
    empBadge.style.color = mentor.employer.color;
    empBadge.className = 'badge';

    meta.appendChild(certBadge);
    meta.appendChild(empBadge);

                  
    const desc = document.createElement('p');
    desc.textContent = mentor.description;
    desc.className = 'mentor-desc';

                                                              
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    
    const fee = document.createElement('span');
    fee.textContent = '상담료';
    fee.className = 'fee-label';

    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'action-btn';
    actionBtn.textContent = '상담 신청';
    actionBtn.disabled = true;                                        

    footer.appendChild(fee);
    footer.appendChild(actionBtn);

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(desc);
    card.appendChild(footer);
    list.appendChild(card);
  });
}

void 0;
renderStaticView();
document.querySelectorAll('button').forEach(button => { button.disabled = true; });