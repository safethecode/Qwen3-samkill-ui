                                           

                         
const classes = [
  {
    id: 'c01',
    name: '도자기 첫 잔',
    category: 'ceramics',
    price: 35000,
    duration: 90,
    capacity: 6,
    description: '흙과 불의 온도를 느끼며 첫 도자기를 만듭니다.'
  },
  {
    id: 'c02',
    name: '가죽 카드 지갑',
    category: 'leather',
    price: 45000,
    duration: 120,
    capacity: 4,
    description: '기본적인 도구를 이용해 내 손맛의 지갑을 만듭니다.'
  },
  {
    id: 'c03',
    name: '나무 트레이',
    category: 'wood',
    price: 28000,
    duration: 60,
    capacity: 5,
    description: '간단한 목공을 통해 실용적인 나무 테이블트레이를 만듭니다.'
  }
];

                    
function renderClasses(filterText = '') {
  const list = document.getElementById('class-list');
  if (!list) return;

                           
  list.innerHTML = '';

  classes.forEach(c => {
    if (c.name.includes(filterText)) {
      const li = document.createElement('li');
      li.className = 'class-card';
      li.setAttribute('role', 'listitem');
      li.dataset.id = c.id;

                                           
      const safeName = escapeHtml(c.name);
      const safeDesc = escapeHtml(c.description);
      const priceStr = new Intl.NumberFormat('ko-KR').format(c.price) + '원';

      li.innerHTML = `
        <article>
          <div class="class-header">
            <h3>${safeName}</h3>
            <span class="price-tag">${priceStr}</span>
          </div>
          <p class="category-label">${escapeHtml(c.category)}</p>
          <ul class="meta-info" aria-hidden="true">
            <li><strong>시간:</strong> ${c.duration}분</li>
            <li><strong>인원:</strong> 최대 ${c.capacity}</li>
          </ul>
          <p>${safeDesc}</p>
          <button class="btn-detail" aria-label="${safeName} 상세 보기">상세 보기</button>
        </article>
      `;

                                         
      list.appendChild(li);
    }
  });
}

                                      
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

                                    
function renderConfirmation() {
  const section = document.getElementById('confirmation');
  if (!section) return;

                             
  section.innerHTML = `<p id="conf-message" class="empty-state">예약된 수업이 없습니다.</p>`;
}

                           
function initData() {
  renderClasses();
  renderConfirmation();
}
                                             
(function() {
  const searchInput = document.getElementById('search');
  const bookingForm = document.getElementById('booking-form');
  const guestInput = document.getElementById('guest');
  const dateInput = document.getElementById('date');
  const slotSelect = document.getElementById('slot');
  const confirmationSection = document.getElementById('confirmation');
  
                                          
  if (searchInput) {
    searchInput.addEventListener('input', () => renderClasses(searchInput.value));
  }
  
                                   
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const guest = guestInput.value.trim();
      const date = dateInput.value;
      const slot = slotSelect.value;
      
                                                
      if (!guest || !date || !slot) {
        alert('모든 필드를 채워주세요.');
        return;
      }
      
                                       
      try {
        const selectedClassId = guestInput.dataset.classId;                                        
        if (!selectedClassId) throw new Error('수업이 선택되지 않았습니다.');
        
        const classData = classes.find(c => c.id === selectedClassId);
        
                                                         
        confirmationSection.innerHTML = `
          <article class="confirmation-card" aria-live="polite">
            <h3>예약 완료</h3>
            <p><strong>${classData.name}</strong></p>
            <ul>
              <li><span class="meta-label">날짜:</span> ${date}</li>
              <li><span class="meta-label">시간:</span> ${slot}</li>
              <li><span class="meta-label">예약자:</span> ${guest}</li>
            </ul>
            <button id="cancel-btn" type="button">예약 취소</button>
          </article>
        `;
      } catch (err) {
        confirmationSection.innerHTML = `<p class="error-state">${escapeHtml(err.message)}</p>`;
      }
    });
  }
  
                         
  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn && bookingForm) {
    cancelBtn.addEventListener('click', () => {
      guestInput.value = '';
      dateInput.value = '';
      slotSelect.value = '10:00';                         
      confirmationSection.innerHTML = '<p id="conf-message" class="empty-state">예약된 수업이 없습니다.</p>';
    });
  }
})();