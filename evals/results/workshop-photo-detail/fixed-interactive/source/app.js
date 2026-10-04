const key='workshop-photo-booking-v1';
const dialog=document.querySelector('#booking-dialog');
const form=document.querySelector('#booking-form');
const confirmation=document.querySelector('#confirmation');
const error=document.querySelector('#storage-error');
const book=document.querySelector('#book');
const favorite=document.querySelector('#favorite');
let saved=null;
try{const candidate=JSON.parse(localStorage.getItem(key)||'null');if(candidate&&typeof candidate.guest==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(candidate.date)&&['10:00','14:00','18:00'].includes(candidate.slot))saved=candidate;}catch{}
const today=new Date();
document.querySelector('#date').min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
const render=()=>{form.hidden=Boolean(saved);confirmation.hidden=!saved;book.textContent=saved?'예약 내용 확인하기':'일정 선택하고 예약하기';if(saved)document.querySelector('#confirmation-details').textContent=['내 손으로 빚는 첫 번째 도자기 잔',saved.guest,saved.date,saved.slot,'55,000원 · 1명'].join('\n');};
book.addEventListener('click',()=>{render();dialog.showModal();});
document.querySelector('#close-booking').addEventListener('click',()=>dialog.close());
favorite.addEventListener('click',()=>{const active=favorite.getAttribute('aria-pressed')!=='true';favorite.setAttribute('aria-pressed',String(active));favorite.setAttribute('aria-label',active?'수업 찜 해제':'수업 찜하기');});
form.addEventListener('submit',event=>{event.preventDefault();const guest=document.querySelector('#guest');guest.setCustomValidity(guest.value.trim()?'':'이름을 입력해 주세요.');if(!form.reportValidity())return;const next={guest:guest.value.trim(),date:document.querySelector('#date').value,slot:document.querySelector('#slot').value};try{localStorage.setItem(key,JSON.stringify(next));saved=next;error.textContent='';render();document.querySelector('#cancel-booking').focus();}catch{error.textContent='브라우저 저장 공간을 사용할 수 없어 예약하지 못했습니다. 저장 설정을 확인해 주세요.';}});
document.querySelector('#guest').addEventListener('input',event=>event.target.setCustomValidity(''));
document.querySelector('#cancel-booking').addEventListener('click',()=>{try{localStorage.removeItem(key);saved=null;form.reset();render();document.querySelector('#guest').focus();}catch{confirmation.insertAdjacentText('beforeend',' 저장된 예약을 취소하지 못했습니다.');}});
render();
