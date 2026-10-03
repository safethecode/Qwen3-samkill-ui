function renderStaticView() {
  const container = document.getElementById('itinerary-list');
  if (!container) return;

  const days = [
    {
      id: 'day1',
      label: 'Day 1',
      date: '2023-10-01',
      places: [
        { id: 'p1', name: '해변 산책', region: '성산구', type: '명소', img: 'assets/reference/photo-1.png' },
        { id: 'p2', name: '오래된 골목 카페', region: '제주시', type: '카페', img: 'assets/reference/photo-2.png' }
      ]
    },
    {
      id: 'day2',
      label: 'Day 2',
      date: '2023-10-02',
      places: [
        { id: 'p3', name: '오름 전망대', region: '서귀포시', type: '명소', img: 'assets/reference/photo-3.png' },
        { id: 'p4', name: '저녁 시장', region: '문익점로', type: '시장', img: 'assets/reference/photo-fragment.png' }
      ]
    }
  ];

  const fragment = document.createDocumentFragment();

  days.forEach(day => {
    const dayGroup = document.createElement('div');
    dayGroup.className = 'day-group';

    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.innerHTML = `<span class="day-label">${day.label}</span><span class="day-date">${day.date}</span>`;
    dayGroup.appendChild(dayHeader);

    const placesList = document.createElement('div');
    placesList.className = 'places-list';

    day.places.forEach(place => {
      const row = document.createElement('div');
      row.className = 'place-row';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `check-${place.id}`;
      checkbox.disabled = true;
      checkbox.checked = place.id === 'p1' || place.id === 'p3';

      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'place-content-wrapper';

      const imgContainer = document.createElement('div');
      imgContainer.className = 'place-image';
      const img = document.createElement('img');
      img.src = place.img;
      img.alt = place.name;
      img.loading = 'lazy';
      imgContainer.appendChild(img);

      const infoWrapper = document.createElement('div');
      infoWrapper.className = 'place-info';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'place-name';
      nameSpan.textContent = place.name;

      const metaDiv = document.createElement('div');
      metaDiv.className = 'place-meta';
      metaDiv.innerHTML = `<span class="place-region">${place.region}</span><span class="place-type">${place.type}</span>`;

      infoWrapper.appendChild(nameSpan);
      infoWrapper.appendChild(metaDiv);

      contentWrapper.appendChild(imgContainer);
      contentWrapper.appendChild(infoWrapper);

      const handle = document.createElement('button');
      handle.className = 'reorder-handle';
      handle.setAttribute('aria-label', '드래그하여 순서 변경');
      handle.innerHTML = '<img src="assets/icons/GripVertical.svg" alt="" width="16" height="16">';

      row.appendChild(checkbox);
      row.appendChild(contentWrapper);
      row.appendChild(handle);
      placesList.appendChild(row);
    });

    dayGroup.appendChild(placesList);
    fragment.appendChild(dayGroup);
  });

  container.appendChild(fragment);
}
void 0;
renderStaticView();
document.querySelectorAll('button').forEach(button => { button.disabled = true; });