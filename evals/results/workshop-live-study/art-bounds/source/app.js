const CLASSES = [
  { id: 'c1', title: '도자기 첫 잔', category: '도자기', price: 65000, duration: '90분', capacity: 8, desc: '원반을 돌려 기본 그릇의 형태를 익힙니다.' },
  { id: 'c2', title: '가죽 카드 지갑', category: '가죽공예', price: 55000, duration: '120분', capacity: 6, desc: '실뜨기와 바느질로 튼튼한 지갑을 만들어요.' },
  { id: 'c3', title: '나무 트레이', category: '목공예', price: 70000, duration: '150분', capacity: 5, desc: '사포부터 도장까지, 나만의 나무 쟁반을 제작합니다.' }
];

let state = { classes: [], bookings: [], selectedClassId: null };

function loadState() {
  try {
    const raw = localStorage.getItem('timworkshop_state');
    if (raw) state = JSON.parse(raw);
  } catch (e) { console.warn('State load failed', e); }
}

function saveState() {
  try { localStorage.setItem('timworkshop_state', JSON.stringify(state)); } catch (e) { console.warn('State save failed', e); }
}

function renderCatalogue(filter = '') {
  const container = document.getElementById('class-list');
  if (!container) return;
  container.innerHTML = '';
  const filtered = state.classes.filter(c => c.title.includes(filter));
  if (filtered.length === 0) {
    container.textContent = '일치하는 수업이 없습니다.';
    return;
  }
  filtered.forEach(c => {
    const card = document.createElement('article');
    card.className = 'class-card';
    card.dataset.id = c.id;

    const art = document.createElement('div');
    art.className = 'class-art';
    art.dataset.kind = c.category;
    art.setAttribute('aria-hidden', 'true');
    card.appendChild(art);

    const cat = document.createElement('p');
    cat.className = 'class-category';
    cat.textContent = c.category;
    card.appendChild(cat);

    const title = document.createElement('h3');
    title.textContent = c.title;
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'class-description';
    desc.textContent = c.desc;
    card.appendChild(desc);

    const log = document.createElement('p');
    log.className = 'class-logistics';
    const clockIcon = document.createElement('img');
    clockIcon.src = 'assets/icons/Clock.svg';
    clockIcon.alt = '';
    clockIcon.width = 20;
    clockIcon.height = 20;
    clockIcon.setAttribute('aria-hidden', 'true');
    log.appendChild(clockIcon);
    log.appendChild(document.createTextNode(` ${c.duration}`));

    const usersIcon = document.createElement('img');
    usersIcon.src = 'assets/icons/Users.svg';
    usersIcon.alt = '';
    usersIcon.width = 20;
    usersIcon.height = 20;
    usersIcon.setAttribute('aria-hidden', 'true');
    log.appendChild(usersIcon);
    log.appendChild(document.createTextNode(` ${c.capacity}명`));
    card.appendChild(log);

    const price = document.createElement('p');
    price.className = 'class-price';
    price.textContent = `${c.price.toLocaleString()}원`;
    card.appendChild(price);

    const btn = document.createElement('button');
    btn.textContent = '상세';
    btn.addEventListener('click', () => selectClass(c.id));
    card.appendChild(btn);

    container.appendChild(card);
  });
}

function renderConfirmation() {
  const section = document.getElementById('confirmation');
  const content = document.getElementById('confirmation-content');
  if (!section || !content) return;
  if (!state.selectedClassId) { section.hidden = true; return; }
  const booking = state.bookings.find(b => b.classId === state.selectedClassId);
  if (!booking) { section.hidden = true; return; }
  const cls = state.classes.find(c => c.id === booking.classId);
  section.hidden = false;
  content.innerHTML = '';
  const p1 = document.createElement('p');
  p1.textContent = `수업: ${cls.title}`;
  const p2 = document.createElement('p');
  p2.textContent = `예약자: ${booking.guest}`;
  const p3 = document.createElement('p');
  p3.textContent = `방문일: ${booking.date}`;
  const p4 = document.createElement('p');
  p4.textContent = `시간: ${booking.slot}`;
  content.append(p1, p2, p3, p4);
}

function renderBookingSummary() {
  const summary = document.getElementById('booking-summary');
  if (!summary || !state.selectedClassId) return;
  const cls = state.classes.find(c => c.id === state.selectedClassId);
  if (!cls) return;
  summary.innerHTML = '';
  const p = document.createElement('p');
  p.textContent = `수업: ${cls.title} (${cls.category})`;
  summary.appendChild(p);
}

function initRender() {
  renderCatalogue();
  renderConfirmation();
}
function selectClass(id) {
  state.selectedClassId = id;
  const cls = state.classes.find(c => c.id === id);
  if (!cls) return;
  const panel = document.getElementById('details-panel');
  const content = document.getElementById('details-content');
  const closeBtn = document.getElementById('close-details');
  const bookingBtn = document.getElementById('open-booking-btn');

  content.innerHTML = '';
  const h3 = document.createElement('h3');
  h3.textContent = cls.title;
  const pCat = document.createElement('p');
  pCat.textContent = `${cls.category} · ${cls.duration} · ${cls.capacity}명 · ${cls.price.toLocaleString()}원`;
  const pDesc = document.createElement('p');
  pDesc.textContent = cls.desc;
  content.append(h3, pCat, pDesc);

  panel.hidden = false;
  closeBtn.focus();
}

document.addEventListener('click', (e) => {
  const card = e.target.closest('.class-card');
  if (card) selectClass(card.dataset.id);

  const closeBtn = document.getElementById('close-details');
  if (e.target === closeBtn) {
    document.getElementById('details-panel').hidden = true;
  }
});

document.getElementById('search').addEventListener('input', (e) => {
  renderCatalogue(e.target.value);
});
document.getElementById('booking-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const guest = document.getElementById('guest').value.trim();
  const date = document.getElementById('date').value;
  const slot = document.getElementById('slot').value;
  if (!state.selectedClassId || !guest || !date || !slot) return;
  state.bookings = [{ classId: state.selectedClassId, guest, date, slot }];
  saveState();
  document.getElementById('booking-form').hidden = true;
  document.getElementById('details-panel').hidden = true;
  renderConfirmation();
});

document.getElementById('cancel-booking-btn').addEventListener('click', () => {
  state.bookings = [];
  saveState();
  renderConfirmation();
});

document.getElementById('open-booking-btn').addEventListener('click', () => {
  if (!state.selectedClassId) return;
  const form = document.getElementById('booking-form');
  const detailsPanel = document.getElementById('details-panel');
  const confirmation = document.getElementById('confirmation');

  renderBookingSummary();
  form.hidden = false;
  detailsPanel.hidden = true;
  confirmation.hidden = true;
  document.getElementById('guest').focus();
});

function init() {
  loadState();
  if (!state.classes.length) state.classes = CLASSES;
  renderCatalogue();
  renderConfirmation();
}

init();