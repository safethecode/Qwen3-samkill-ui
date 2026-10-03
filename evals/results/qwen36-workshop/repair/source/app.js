              
const EXAMPLE_CLASSES = [
  {
    id: 'pottery-cup',
    name: '도자기 첫 잔',
    category: '도자기',
    price: 55000,
    duration: '90분',
    capacity: 6,
    description: '손으로 빚는 첫 번째 그릇. 기본 테크닉과 굽기 과정을 경험합니다.'
  },
  {
    id: 'leather-wallet',
    name: '가죽 카드 지갑',
    category: '가죽',
    price: 60000,
    duration: '120분',
    capacity: 4,
    description: '내 손길이 간직한 가죽 지갑. 컷팅부터 마감까지 전 과정을 배웁니다.'
  },
  {
    id: 'wooden-tray',
    name: '나무 트레이',
    category: '우드',
    price: 45000,
    duration: '60분',
    capacity: 8,
    description: '천연 재질의 따뜻한 느낌. 샌딩과 코팅으로 완성하는 실용적인 트레이.'
  }
];

        
const STORAGE_KEY = 'timgong_bookings';
let state = {
  classes: [],
  bookings: [],
  searchQuery: ''
};

                 
function loadState() {
  try {
    const savedBookings = localStorage.getItem(STORAGE_KEY);
    if (savedBookings) {
      state.bookings = JSON.parse(savedBookings);
    }
  } catch (e) {
    console.warn('로컬 스토리지 로드 실패:', e);
    state.bookings = [];
  }
                       
  state.classes = [...EXAMPLE_CLASSES];
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bookings));
  } catch (e) {
    console.warn('로컬 스토리지 저장 실패:', e);
  }
}

           
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderClassList() {
  const container = document.getElementById('class-list');
  if (!container) return;
  
  const filtered = state.classes.filter(cls => 
    cls.name.includes(state.searchQuery) || 
    cls.category.includes(state.searchQuery)
  );

  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty-state">검색 결과가 없습니다.</p>';
    return;
  }

                                    
  container.innerHTML = '';

  filtered.forEach(cls => {
    const card = document.createElement('article');
    card.className = 'class-card';
    
    const header = document.createElement('div');
    header.className = 'class-header';
    
    const title = document.createElement('h3');
    title.textContent = cls.name;
    
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'category-badge';
    categoryBadge.textContent = cls.category;

    header.appendChild(title);
    header.appendChild(categoryBadge);

    const details = document.createElement('div');
    details.className = 'class-details';
    
    const price = document.createElement('p');
    price.textContent = `${escapeHtml(String(cls.price))}원`;
    
    const meta = document.createElement('p');
    meta.textContent = `${cls.duration} | 최대 ${cls.capacity}명`;

    details.appendChild(price);
    details.appendChild(meta);

    const desc = document.createElement('p');
    desc.className = 'class-desc';
    desc.textContent = cls.description;

    const btn = document.createElement('button');
    btn.className = 'btn-detail';
    btn.textContent = '상세';
    btn.dataset.id = cls.id;

    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(desc);
    card.appendChild(btn);
    container.appendChild(card);
  });
}
                
const searchInput = document.getElementById('search');
const classListEl = document.getElementById('class-list');
const bookingPanel = document.getElementById('booking-panel');
const bookingForm = document.getElementById('booking-form');

function openBooking(classId) {
  const cls = state.classes.find(c => c.id === classId);
  if (!cls) return;

                 
  bookingForm.reset();
  
                              
  bookingPanel.dataset.classId = classId;
  bookingPanel.querySelector('h2').textContent = `${cls.name} 예약하기`;
  
  bookingPanel.classList.remove('hidden');
  bookingForm.guest.focus();
}

function closeBooking() {
  bookingPanel.classList.add('hidden');
  delete bookingPanel.dataset.classId;
}

         
searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value.trim().toLowerCase();
  renderClassList();
});

                  
classListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-detail');
  if (btn) {
    openBooking(btn.dataset.id);
    return;
  }
});

                                          
                                 

                  
const confirmationEl = document.getElementById('confirmation');
const confirmDetails = document.getElementById('confirmation-details');

function renderConfirmation(booking) {
  confirmDetails.innerHTML = `
    <p><strong>수업:</strong> ${escapeHtml(booking.className)}</p>
    <p><strong>예약자:</strong> ${escapeHtml(booking.guest)}</p>
    <p><strong>방문일:</strong> ${escapeHtml(booking.date)}</p>
    <p><strong>시간:</strong> ${escapeHtml(booking.slot)}</p>
    <button class="btn-cancel" data-id="${booking.id}">예약 취소</button>
  `;
  confirmationEl.classList.remove('hidden');
  bookingPanel.classList.add('hidden');
  saveState();
}

function cancelBooking(id) {
  state.bookings = state.bookings.filter(b => b.id !== id);
  saveState();
  renderBookings();
  confirmationEl.classList.add('hidden');
}

function renderBookings() {
                                      
  if (state.bookings.length > 0) {
    const lastBooking = state.bookings[state.bookings.length - 1];
    renderConfirmation(lastBooking);
  }
}

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const classId = bookingPanel.dataset.classId;
  if (!classId) return;

  const cls = state.classes.find(c => c.id === classId);
  if (!cls) return;

  const guestVal = document.getElementById('guest').value.trim();
  const dateVal = document.getElementById('date').value;
  const slotVal = document.getElementById('slot').value;

  if (!guestVal || !dateVal || !slotVal) {
    alert('모든 필수 항목을 입력해주세요.');
    return;
  }

  const newBooking = {
    id: Date.now().toString(),
    classId: cls.id,
    className: cls.name,
    guest: guestVal,
    date: dateVal,
    slot: slotVal
  };

  state.bookings.push(newBooking);
  saveState();
  renderConfirmation(newBooking);
});

               
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-cancel')) {
    cancelBooking(e.target.dataset.id);
  }
});

      
loadState();
renderClassList();
if (state.bookings.length > 0) renderBookings();