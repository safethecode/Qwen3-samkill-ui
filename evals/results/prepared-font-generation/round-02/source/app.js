function renderStaticView() {
  const container = document.getElementById('mentor-list');
  if (!container) return;

  const mentors = [
    {
      name: '김서연',
      role: '프로덕트 디자이너',
      certification: 'UX/UI 전문가',
      employer: '플랫폼 스타트업',
      avatar: 'assets/reference/avatar-1.png',
      description: '초기 프로덕트의 UX 전략과 인터페이스 디자인을 담당했습니다. 사용자 리서치부터 프로토타이핑까지 전 과정을 경험했습니다.'
    },
    {
      name: '박민준',
      role: '프론트엔드 개발자',
      certification: 'AWS 인증',
      employer: 'SaaS 기업',
      avatar: 'assets/reference/avatar-2.png',
      description: '대규모 트래픽을 처리하는 웹 애플리케이션의 성능 최적화와 아키텍처 설계를 주도했습니다. React와 Node.js 생태계 전문가입니다.'
    }
  ];

  const fragment = document.createDocumentFragment();

  mentors.forEach(mentor => {
    const card = document.createElement('article');
    card.className = 'mentor-card';
    card.setAttribute('aria-label', `멘토 ${mentor.name} 프로필`);

    const header = document.createElement('div');
    header.className = 'card-header';

    const avatarImg = document.createElement('img');
    avatarImg.src = mentor.avatar;
    avatarImg.alt = `${mentor.name} 프로필 이미지`;
    avatarImg.className = 'avatar';

    const name = document.createElement('h2');
    name.className = 'mentor-name';
    name.textContent = mentor.name;

    const role = document.createElement('p');
    role.className = 'mentor-role';
    role.textContent = mentor.role;

    header.appendChild(avatarImg);
    header.appendChild(name);
    header.appendChild(role);

    const metadata = document.createElement('div');
    metadata.className = 'metadata';

    const cert = document.createElement('span');
    cert.className = 'certification';
    cert.textContent = mentor.certification;

    const employer = document.createElement('span');
    employer.className = 'employer';
    employer.textContent = mentor.employer;

    metadata.appendChild(cert);
    metadata.appendChild(employer);

    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = mentor.description;

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const fee = document.createElement('span');
    fee.className = 'fee';
    fee.textContent = '예시: 50,000원/시간';

    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'action-btn';
    actionBtn.disabled = true;
    actionBtn.setAttribute('aria-disabled', 'true');
    actionBtn.textContent = '상담 신청';

    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = 'fav-btn';
    favBtn.disabled = true;
    favBtn.setAttribute('aria-disabled', 'true');
    favBtn.setAttribute('aria-label', '즐겨찾기');

    const heartImg = document.createElement('img');
    heartImg.src = 'assets/reference/heart.svg';
    heartImg.alt = '즐겨찾기';
    heartImg.width = 20;
    heartImg.height = 20;
    favBtn.appendChild(heartImg);

    footer.appendChild(fee);
    footer.appendChild(actionBtn);
    footer.appendChild(favBtn);

    card.appendChild(header);
    card.appendChild(metadata);
    card.appendChild(desc);
    card.appendChild(footer);
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}
void 0;
renderStaticView();
document.querySelectorAll('button').forEach(button => { button.disabled = true; });