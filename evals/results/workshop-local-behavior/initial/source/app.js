const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const state = {
  guest: '',
  date: '',
  slot: '',
  isFav: false,
  isBooked: false
};

function render() {
  try {
    const saved = localStorage.getItem('workshop-photo-booking-v1');
    if (saved) {
      const data = JSON.parse(saved);
      if (data && data.guest && data.date && data.slot) {
        state.guest = data.guest;
        state.date = data.date;
        state.slot = data.slot;
        state.isBooked = true;
        $('#guest').value = state.guest;
        $('#date').value = state.date;
        $('#slot').value = state.slot;
      }
    }
  } catch (e) {
    console.warn('Storage read failed', e);
  }

  updateFavoriteUI();

  if (state.isBooked) {
    showConfirmation();
  } else {
    $('#booking-form').hidden = false;
    $('#confirmation').hidden = true;
    $('#book').textContent = '일정 선택하고 예약하기';
  }
}

function updateFavoriteUI() {
  const btn = $('#favorite');
  btn.setAttribute('aria-pressed', state.isFav);
  btn.setAttribute('aria-label', state.isFav ? '수업 찜 취소' : '수업 찜하기');
  const img = $('img', btn);
  if (state.isFav) {
    img.src = 'assets/icons/HeartFilled.svg';
  } else {
    img.src = 'assets/icons/Heart.svg';
  }
}

function showConfirmation() {
  $('#booking-form').hidden = true;
  $('#confirmation').hidden = false;
  $('#confirmation-details').textContent = `이름: ${state.guest} / 날짜: ${state.date} / 시간: ${state.slot} / 가격: 55,000원 / 인원: 1명`;
  $('#book').textContent = '예약 내용 확인하기';
  $('#cancel-booking').focus();
}

$('#favorite').addEventListener('click', () => {
  state.isFav = !state.isFav;
  updateFavoriteUI();
});

$('#book').addEventListener('click', () => {
  if (state.isBooked) return;
  $('#booking-dialog').showModal();
});

$('#close-booking').addEventListener('click', () => {
  $('#booking-dialog').close();
});

$('#booking-dialog').addEventListener('close', () => {
  const dialog = $('#booking-dialog');
  if (dialog.returnValue === 'cancel') {
    $('#guest').focus();
  }
});

$('#booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const guestVal = $('#guest').value.trim();
  const dateVal = $('#date').value;
  const slotVal = $('#slot').value;

  if (!guestVal) {
    $('#guest').setCustomValidity('이름을 입력해주세요.');
    return;
  }
  $('#guest').setCustomValidity('');

  if (!dateVal) {
    $('#date').setCustomValidity('날짜를 선택해주세요.');
    return;
  }
  $('#date').setCustomValidity('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(dateVal + 'T00:00:00');
  if (inputDate < today) {
    $('#date').setCustomValidity('오늘 이후의 날짜를 선택해주세요.');
    return;
  }

  if (!slotVal) {
    $('#slot').setCustomValidity('시간을 선택해주세요.');
    return;
  }
  $('#slot').setCustomValidity('');

  try {
    const data = { guest: guestVal, date: dateVal, slot: slotVal };
    localStorage.setItem('workshop-photo-booking-v1', JSON.stringify(data));
    state.guest = guestVal;
    state.date = dateVal;
    state.slot = slotVal;
    state.isBooked = true;
    showConfirmation();
    $('#booking-dialog').close();
  } catch (err) {
    const errEl = $('#storage-error');
    errEl.textContent = '저장 중 오류가 발생했습니다. 다시 시도해주세요.';
    console.error('Storage error:', err);
  }
});

$('#cancel-booking').addEventListener('click', () => {
  try {
    localStorage.removeItem('workshop-photo-booking-v1');
  } catch (e) {
    console.warn('Remove storage failed', e);
  }
  state.guest = '';
  state.date = '';
  state.slot = '';
  state.isBooked = false;
  $('#guest').value = '';
  $('#date').value = '';
  $('#slot').value = '';
  $('#guest').setCustomValidity('');
  $('#date').setCustomValidity('');
  $('#slot').setCustomValidity('');
  $('#confirmation').hidden = true;
  $('#booking-form').hidden = false;
  $('#book').textContent = '일정 선택하고 예약하기';
  $('#guest').focus();
});

$$('input, select').forEach(el => {
  el.addEventListener('input', () => {
    el.setCustomValidity('');
  });
});

render();