const mentorData = [
  {
    id: 'mentor-1',
    name: '김서연',
    role: '프로덕트 디자이너',
    certification: 'Google UX Design',
    employer: '네이버',
    employerColor: '#3b82f6',
    description: 'B2C 서비스의 사용자 경험을 설계하고, 데이터 기반의 디자인 의사결정을 통해 전환율을 개선하는 데 특화되어 있습니다. Figma와 프로토타이핑에 능숙하며, 크로스 기능 팀과의 협업을 중요하게 생각합니다.',
    isFavorite: false
  },
  {
    id: 'mentor-2',
    name: '박민준',
    role: '프론트엔드 개발자',
    certification: 'AWS Certified Developer',
    employer: '토스',
    employerColor: '#3b82f6',
    description: 'React와 TypeScript를 활용한 고성능 웹 애플리케이션 개발 경험을 가지고 있습니다. 성능 최적화, 접근성 준수, 그리고 코드 품질 관리를 통해 사용자 중심의 기술적 솔루션을 제공합니다.',
    isFavorite: true
  }
];

function renderMentors() {
  const list = document.getElementById('mentor-list');
  if (!list) return;

  list.innerHTML = '';

  mentorData.forEach(mentor => {
    const card = document.createElement('article');
    card.className = 'mentor-card';
    card.setAttribute('role', 'listitem');
    card.dataset.id = mentor.id;

    const avatarUrl = mentor.id === 'mentor-1'
      ? 'assets/reference/avatar-1.png'
      : 'assets/reference/avatar-2.png';

    card.innerHTML = `
      <div class="card-header">
        <img src="${avatarUrl}" alt="${mentor.name} 프로필" class="mentor-avatar">
        <div class="mentor-info">
          <h3 class="mentor-name">${mentor.name}</h3>
          <p class="mentor-role">${mentor.role}</p>
          <div class="mentor-meta">
            <span class="certification-badge" style="color: #6d28d9;">${mentor.certification}</span>
            <span class="employer-badge" style="color: ${mentor.employerColor};">${mentor.employer}</span>
          </div>
        </div>
        <button type="button" class="favorite-btn" aria-label="즐겨찾기" data-action="toggle-favorite">
          <img src="assets/reference/heart.svg" alt="즐겨찾기" width="20" height="20">
        </button>
      </div>
      <p class="mentor-description">${mentor.description}</p>
      <div class="card-footer">
        <span class="fee-display">상담료 50,000원</span>
        <button type="button" class="action-btn" disabled aria-disabled="true">상담 신청</button>
      </div>
    `;

    list.appendChild(card);
  });
}

void 0;
                                                                          
                                                            
void 0;