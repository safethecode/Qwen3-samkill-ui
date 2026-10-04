function renderStaticView() {
  const container = document.getElementById('mentor-list');
  if (!container) return;

  const mentors = [
    {
      id: 'm1',
      name: '김서연',
      role: '프로덕트 디자이너',
      avatar: 'assets/reference/avatar-1.png',
      certification: 'Adobe Certified Expert',
      certificationColor: '#6d28d9',
      employer: '현재 재직: 스타트업 A',
      employerColor: '#2563eb',
      description: '사용자 중심 디자인과 데이터 기반 의사결정을 통해 복잡한 프로덕트를 직관적이고 아름다운 경험으로 전환합니다. Figma, 프로토타이핑 및 디자인 시스템 구축에 강점이 있습니다.'
    },
    {
      id: 'm2',
      name: '박민준',
      role: '프론트엔드 개발자',
      avatar: 'assets/reference/avatar-2.png',
      certification: 'Google UX Design Certificate',
      certificationColor: '#6d28d9',
      employer: '현재 재직: 플랫폼 B',
      employerColor: '#2563eb',
      description: '반응형 웹과 접근성을 고려한 견고한 UI 구현을 전문으로 합니다. React, TypeScript 기반의 컴포넌트 개발과 퍼포먼스 최적화에 대한 깊은 이해를 가지고 있습니다.'
    }
  ];

  const fragment = document.createDocumentFragment();

  mentors.forEach(mentor => {
    const card = document.createElement('article');
    card.className = 'mentor-card';
    card.setAttribute('aria-label', `멘토 ${mentor.name}, ${mentor.role}`);

    const headerRow = document.createElement('div');
    headerRow.className = 'card-header';

    const avatarImg = document.createElement('img');
    avatarImg.src = mentor.avatar;
    avatarImg.alt = `${mentor.name} 프로필`;
    avatarImg.className = 'avatar';
    avatarImg.width = 48;
    avatarImg.height = 48;

    const metaContainer = document.createElement('div');
    metaContainer.className = 'meta-container';

    const nameEl = document.createElement('h2');
    nameEl.className = 'mentor-name';
    nameEl.textContent = mentor.name;

    const roleEl = document.createElement('span');
    roleEl.className = 'mentor-role';
    roleEl.textContent = mentor.role;

    metaContainer.appendChild(nameEl);
    metaContainer.appendChild(roleEl);

    headerRow.appendChild(avatarImg);
    headerRow.appendChild(metaContainer);

    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'mentor-details';

    const certPill = document.createElement('span');
    certPill.className = 'pill';
    certPill.style.color = mentor.certificationColor;
    certPill.textContent = mentor.certification;

    const empPill = document.createElement('span');
    empPill.className = 'pill';
    empPill.style.color = mentor.employerColor;
    empPill.textContent = mentor.employer;

    detailsContainer.appendChild(certPill);
    detailsContainer.appendChild(empPill);

    const descEl = document.createElement('p');
    descEl.className = 'mentor-description';
    descEl.textContent = mentor.description;

    const actionRow = document.createElement('div');
    actionRow.className = 'action-row';

    const feeEl = document.createElement('span');
    feeEl.className = 'fee-label';
    feeEl.textContent = '상담비';

    const favoriteBtn = document.createElement('button');
    favoriteBtn.type = 'button';
    favoriteBtn.className = 'favorite-btn disabled-example';
    favoriteBtn.disabled = true;
    favoriteBtn.setAttribute('aria-label', `${mentor.name} 찜하기`);

    const heartImg = document.createElement('img');
    heartImg.src = 'assets/icons/Heart.svg';
    heartImg.alt = '';
    heartImg.width = 20;
    heartImg.height = 20;

    favoriteBtn.appendChild(heartImg);

    actionRow.appendChild(feeEl);
    actionRow.appendChild(favoriteBtn);

    card.appendChild(headerRow);
    card.appendChild(detailsContainer);
    card.appendChild(descEl);
    card.appendChild(actionRow);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}
void 0;
renderStaticView();
document.querySelectorAll('button').forEach(button => { button.disabled = true; });