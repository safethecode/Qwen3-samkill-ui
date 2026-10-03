function renderStaticView() {
  const container = document.getElementById('mentor-list');
  if (!container) return;

  const mentors = [
    {
      name: '김서연',
      role: '프로덕트 디자이너',
      avatar: 'assets/reference/avatar-1.png',
      certification: 'PD Certification',
      employer: '현직 A사',
      description: '서비스 기획과 디자인 시스템 구축에 강점이 있습니다. 0부터 1을 만드는 과정을 함께 경험해 보세요.',
      reviews: '전문분야 45회 / 노하우 12회'
    },
    {
      name: '박민준',
      role: '프론트엔드 개발자',
      avatar: 'assets/reference/avatar-2.png',
      certification: 'FE Expert',
      employer: '현직 B사',
      description: '리액트와 성능 최적화에 집중하고 있습니다. 복잡한 UI를 깔끔하게 구현하는 노하우를 공유합니다.',
      reviews: '전문분야 32회 / 노하우 8회'
    }
  ];

  const fragment = document.createDocumentFragment();

  mentors.forEach(mentor => {
    const card = document.createElement('article');
    card.className = 'mentor-card';

    card.innerHTML = `
      <div class="card-header">
        <img class="avatar" src="${mentor.avatar}" alt="${mentor.name} 프로필 이미지" width="48" height="48">
        <div class="meta">
          <h2 class="name">${mentor.name}</h2>
          <span class="role">${mentor.role}</span>
          <span class="certification">${mentor.certification}</span>
          <span class="employer">${mentor.employer}</span>
        </div>
        <button type="button" class="fav-btn" aria-label="찜">
          <img src="assets/icons/Heart.svg" alt="" width="20" height="20">
        </button>
      </div>
      <p class="description">${mentor.description}</p>
      <div class="footer">
        <span class="reviews">${mentor.reviews}</span>
        <button type="button" class="action-btn disabled">상담 신청</button>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}
void 0;
renderStaticView();
document.querySelectorAll('button').forEach(button => { button.disabled = true; });