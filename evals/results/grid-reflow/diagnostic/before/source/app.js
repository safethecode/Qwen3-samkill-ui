const COURSE_DATA = [
  { id: "w1", title: "1주: HTML과 접근성", lessons: [
    { id: "l1", title: "의미 있는 HTML", content: "HTML의 시맨틱 태그를 사용하여 문서의 구조와 의미를 명확히 합니다. heading, list, landmark 등의 요소를 적절히 활용하여 스크린 리더 사용자가 내용을 빠르게 이해할 수 있도록 합니다." },
    { id: "l2", title: "키보드 탐색", content: "모든 인터랙티브 요소는 키보드만으로도 접근 가능해야 합니다. 탭 순서(Tab order)를 논리적으로 구성하고, 포커스 표시기를 명확하게 유지하여 마우스 없이도 작업을 완료할 수 있게 합니다." }
  ]},
  { id: "w2", title: "2주: 시각적 대비와 색상", lessons: [
    { id: "l3", title: "대비와 색상", content: "텍스트와 배경 사이의 명도 대비를 최소 4.5:1 이상 유지합니다. 색상은 정보 전달의 유일한 수단이 되지 않도록 하며, 아이콘이나 텍스트 레이블을 병행하여 사용합니다." },
    { id: "l4", title: "폼 오류 안내", content: "입력 오류 발생 시, 오류 위치를 명확히 지적하고 해결 방법을 구체적으로 안내합니다. 색상만으로 오류를 구분하지 않으며, 텍스트 메시지와 아이콘을 함께 사용하여 가독성을 높입니다." }
  ]},
  { id: "w3", title: "3주: 초점 관리와 상호작용", lessons: [
    { id: "l5", title: "초점 관리", content: "모달이나 팝업이 열릴 때 포커스를 적절한 위치로 이동시키고, 닫힐 때 이전 포커스 위치로 복원합니다. 포커스 트랩(Focus Trap)을 구현하여 사용자가 모달 내부에서만 탐색하도록 합니다." },
    { id: "l6", title: "반응형 확대", content: "화면을 200%까지 확대했을 때 콘텐츠가 잘리거나 겹치지 않도록 유동적 레이아웃을 사용합니다. 텍스트는 상대 단위(em/rem)를 사용하여 사용자의 브라우저 설정에 유연하게 대응합니다." }
  ]},
  { id: "w4", title: "4주: 읽기 순서와 최종 점검", lessons: [
    { id: "l7", title: "읽기 순서", content: "DOM 순서가 시각적 배열과 일치하도록 합니다. 복잡한 레이아웃에서는 tabindex나 aria-order 속성을 활용하여 논리적 읽기 순서를 명시하고, 스크린 리더 사용자의 혼란을 방지합니다." },
    { id: "l8", title: "최종 점검", content: "모든 페이지에 대한 접근성自查를 완료합니다. 키보드 네비게이션, 스크린 리더 호환성, 색상 대비, 폼 라벨 등을 포함하여 사용자가 장애 없이 콘텐츠를 이용할 수 있는지 최종 확인합니다." }
  ]}
];

const STORAGE_KEYS = { completed: "galpi_completed_lessons", notes: "galpi_lesson_notes" };

function loadState() {
  try {
    const rawCompleted = localStorage.getItem(STORAGE_KEYS.completed);
    const rawNotes = localStorage.getItem(STORAGE_KEYS.notes);
    return {
      completed: rawCompleted ? JSON.parse(rawCompleted) : [],
      notes: rawNotes ? JSON.parse(rawNotes) : {}
    };
  } catch (e) {
    return { completed: [], notes: {} };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify(state.completed));
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(state.notes));
  } catch (e) {
    console.warn("localStorage 저장 실패", e);
  }
}

function flattenLessons() {
  return COURSE_DATA.flatMap(w => w.lessons.map(l => ({ ...l, weekId: w.id, weekTitle: w.title })));
}

function getProgress(state) {
  const total = flattenLessons().length;
  const count = state.completed.length;
  return { current: count, total };
}

function renderNavigation(container, lessons, searchTerm) {
  const term = searchTerm.toLowerCase();
  const filtered = lessons.filter(l => l.title.toLowerCase().includes(term));
  
  container.innerHTML = "";
  if (filtered.length === 0) {
    const emptyEl = document.getElementById("empty-state");
    if (emptyEl) emptyEl.classList.remove("hidden");
    return;
  }
  if (document.getElementById("empty-state")) document.getElementById("empty-state").classList.add("hidden");

  COURSE_DATA.forEach(week => {
    const weekLessons = filtered.filter(l => l.weekId === week.id);
    if (weekLessons.length === 0) return;

    const weekDiv = document.createElement("div");
    weekDiv.className = "nav-week";
    
    const weekTitle = document.createElement("h3");
    weekTitle.textContent = week.title;
    weekTitle.className = "week-title";
    weekDiv.appendChild(weekTitle);

    const lessonList = document.createElement("div");
    lessonList.className = "nav-lessons";
    
    weekLessons.forEach(lesson => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nav-lesson-btn";
      btn.dataset.lessonId = lesson.id;
      btn.textContent = lesson.title;
      lessonList.appendChild(btn);
    });

    weekDiv.appendChild(lessonList);
    container.appendChild(weekDiv);
  });
}

function renderProgress(container, progress) {
  const text = `${progress.current}/${progress.total} 학습 완료`;
  if (container.textContent !== text) {
    container.textContent = text;
  }
}

function renderEmptyView(titleContainer, contentContainer) {
  titleContainer.textContent = "강의를 선택하세요";
  contentContainer.textContent = "왼쪽 메뉴에서 학습할 강의를 선택하면 상세 내용이 표시됩니다.";
}

document.addEventListener('DOMContentLoaded', () => {
  const state = loadState();
  const navContainer = document.querySelector('#course-nav .nav-weeks');
  const titleEl = document.getElementById('lesson-title');
  const contentEl = document.getElementById('lesson-content');
  const searchInput = document.getElementById('search');

  let currentLessonId = null;

  function render() {
    const allLessons = flattenLessons();
    renderNavigation(navContainer, allLessons, searchInput.value);
    renderProgress(document.getElementById('progress'), getProgress(state));
    if (currentLessonId) {
      const lesson = allLessons.find(l => l.id === currentLessonId);
      if (lesson) {
        titleEl.textContent = lesson.title;
        contentEl.textContent = lesson.content;
      } else {
        currentLessonId = null;
        renderEmptyView(titleEl, contentEl);
      }
    } else {
      renderEmptyView(titleEl, contentEl);
    }
  }

  navContainer.addEventListener('click', (e) => {
    if (e.target.matches('.nav-lesson-btn')) {
      currentLessonId = e.target.dataset.lessonId;
      render();
    }
  });

  searchInput.addEventListener('input', () => {
    render();
  });

  render();
});
document.addEventListener('DOMContentLoaded', () => {
  const state = loadState();
  const navContainer = document.querySelector('#course-nav .nav-weeks');
  const titleEl = document.getElementById('lesson-title');
  const contentEl = document.getElementById('lesson-content');
  const completeBtn = document.getElementById('complete');
  const noteArea = document.getElementById('note');
  const noteForm = document.getElementById('note-form');
  let currentLessonId = null;

  function render() {
    const allLessons = flattenLessons();
    renderNavigation(navContainer, allLessons, document.getElementById('search').value);
    renderProgress(document.getElementById('progress'), getProgress(state));
    if (currentLessonId) {
      const lesson = allLessons.find(l => l.id === currentLessonId);
      if (lesson) {
        titleEl.textContent = lesson.title;
        contentEl.textContent = lesson.content;
        completeBtn.disabled = state.completed.includes(currentLessonId);
        noteArea.value = state.notes[currentLessonId] || '';
        return;
      } else {
        currentLessonId = null;
      }
    }
    renderEmptyView(titleEl, contentEl);
    completeBtn.disabled = false;
    noteArea.value = '';
  }

  navContainer.addEventListener('click', (e) => {
    if (e.target.matches('.nav-lesson-btn')) {
      currentLessonId = e.target.dataset.lessonId;
      render();
    }
  });

  document.getElementById('search').addEventListener('input', () => render());

  completeBtn.addEventListener('click', () => {
    if (!currentLessonId) return;
    state.completed.push(currentLessonId);
    saveState(state);
    render();
  });

  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentLessonId) return;
    state.notes[currentLessonId] = noteArea.value;
    saveState(state);
  });

  render();
});