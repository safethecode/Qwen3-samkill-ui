function renderStaticView() {
  const recordList = document.getElementById('record-list');
  if (!recordList) return;

  const sampleRecords = [
    {
      time: '07:30',
      type: 'glucose',
      label: '공복 혈당',
      value: '105 mg/dL',
      note: '예시 데이터'
    },
    {
      time: '08:15',
      type: 'meal',
      label: '아침 식사',
      value: '밥 한 공기, 계란후레, 김치',
      note: '예시 데이터'
    },
    {
      time: '12:40',
      type: 'activity',
      label: '점심 산책',
      value: '30분, 2,500 보행',
      note: '예시 데이터'
    },
    {
      time: '19:00',
      type: 'meal',
      label: '저녁 식사',
      value: '국물 있는 반찬 위주',
      note: '예시 데이터'
    }
  ];

  recordList.innerHTML = '';

  sampleRecords.forEach(record => {
    const row = document.createElement('div');
    row.className = `timeline-row timeline-row--${record.type}`;

    const timeCell = document.createElement('span');
    timeCell.className = 'timeline-time';
    timeCell.textContent = record.time;

    const contentCell = document.createElement('div');
    contentCell.className = 'timeline-content';

    const typeLabel = document.createElement('span');
    typeLabel.className = `timeline-type-badge timeline-type-badge--${record.type}`;
    typeLabel.textContent = record.label;

    const valueText = document.createElement('p');
    valueText.className = 'timeline-value';
    valueText.textContent = record.value;

    contentCell.appendChild(typeLabel);
    contentCell.appendChild(valueText);

    row.appendChild(timeCell);
    row.appendChild(contentCell);
    recordList.appendChild(row);
  });
}
void 0;
renderStaticView();
document.querySelectorAll('button').forEach(button => { button.disabled = true; });