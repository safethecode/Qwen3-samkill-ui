const itineraryData = [
  {
    id: 'place-1',
    name: '해변 산책',
    region: '서귀포시',
    type: '야외',
    photo: 'assets/reference/photo-1.png',
    day: 1
  },
  {
    id: 'place-2',
    name: '오래된 골목 카페',
    region: '제주시',
    type: '카페',
    photo: 'assets/reference/photo-2.png',
    day: 1
  },
  {
    id: 'place-3',
    name: '오름 전망대',
    region: '성산군',
    type: '경관',
    photo: 'assets/reference/photo-3.png',
    day: 2
  },
  {
    id: 'place-4',
    name: '저녁 시장',
    region: '서귀포시',
    type: '식도락',
    photo: 'assets/reference/photo-fragment.png',
    day: 2
  }
];

function renderStaticView() {
  const listEl = document.getElementById('itinerary-list');
  if (!listEl) return;

  let currentDay = null;
  const fragment = document.createDocumentFragment();

  itineraryData.forEach((place, index) => {
    if (place.day !== currentDay) {
      currentDay = place.day;
      const heading = document.createElement('h2');
      heading.className = 'day-heading';
      heading.id = `day-${currentDay}-heading`;
      heading.textContent = `Day ${currentDay}`;
      fragment.appendChild(heading);
    }

    const row = document.createElement('div');
    row.className = 'place-row';
    row.id = `row-${place.id}`;

    const checkboxWrapper = document.createElement('label');
    checkboxWrapper.className = 'checkbox-wrapper';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `check-${place.id}`;
    checkbox.disabled = true;
    checkboxWrapper.appendChild(checkbox);

    const media = document.createElement('div');
    media.className = 'place-media';
    const img = document.createElement('img');
    img.src = place.photo;
    img.alt = place.name + ' 사진';
    img.loading = 'lazy';
    media.appendChild(img);

    const info = document.createElement('div');
    info.className = 'place-info';
    const name = document.createElement('div');
    name.className = 'place-name';
    name.id = `name-${place.id}`;
    name.textContent = place.name;
    const meta = document.createElement('div');
    meta.className = 'place-meta';
    meta.textContent = `${place.region} · ${place.type}`;
    info.appendChild(name);
    info.appendChild(meta);

    const handle = document.createElement('button');
    handle.className = 'reorder-handle';
    handle.type = 'button';
    handle.disabled = true;
    handle.id = `handle-${place.id}`;
    const gripImg = document.createElement('img');
    gripImg.src = 'assets/icons/GripVertical.svg';
    gripImg.alt = '순서 변경';
    gripImg.width = 16;
    gripImg.height = 16;
    handle.appendChild(gripImg);

    row.appendChild(checkboxWrapper);
    row.appendChild(media);
    row.appendChild(info);
    row.appendChild(handle);
    fragment.appendChild(row);
  });

  listEl.appendChild(fragment);
}
void 0;
renderStaticView();
document.querySelectorAll('button').forEach(button => { button.disabled = true; });