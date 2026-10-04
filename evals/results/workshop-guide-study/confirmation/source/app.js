const CLASSES = [
  {
    id: "class-1",
    title: "도자기 첫 잔",
    category: "도자기",
    price: 55000,
    duration: "90분",
    capacity: 6,
    description: "내 손으로 만드는 첫 번째 찻잔. 성형부터 유약 발림까지 기본을 배워보세요."
  },
  {
    id: "class-2",
    title: "가죽 카드 지갑",
    category: "가죽",
    price: 48000,
    duration: "120분",
    capacity: 5,
    description: "소형 카드와 명함을 수납할 수 있는 심플한 지갑을 제작합니다."
  },
  {
    id: "class-3",
    title: "나무 트레이",
    category: "우드",
    price: 62000,
    duration: "150분",
    capacity: 4,
    description: "원목을 다듬고 손질하여 식탁 위에 놓을 예쁜 트레이를 완성합니다."
  }
];

const STORAGE_KEY = "samkill-ui-booking-demo";

let state = {
  classes: CLASSES,
  selectedClassId: null,
  searchQuery: "",
  confirmation: null
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.confirmation) {
        state.confirmation = parsed.confirmation;
      }
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      confirmation: state.confirmation
    }));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

function renderCatalogue() {
  const container = document.getElementById("catalogue-list");
  if (!container) return;

  const filtered = state.classes.filter(cls =>
    cls.title.includes(state.searchQuery) ||
    cls.category.includes(state.searchQuery)
  );

  container.innerHTML = "";

  if (filtered.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "empty-state";
    emptyMsg.textContent = "검색 결과가 없습니다.";
    container.appendChild(emptyMsg);
    return;
  }

  filtered.forEach(cls => {
    const card = document.createElement("article");
    card.className = "catalogue-card";
    card.dataset.id = cls.id;

    const illustration = document.createElement("div");
    illustration.className = "card-illustration";

    const title = document.createElement("h3");
    title.textContent = cls.title;

    const category = document.createElement("span");
    category.className = "card-category";
    category.textContent = cls.category;

    const desc = document.createElement("p");
    desc.className = "card-description";
    desc.textContent = cls.description;

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const duration = document.createElement("span");
    const durationIcon = document.createElement("img");
    durationIcon.src = "assets/icons/Clock.svg";
    durationIcon.alt = "";
    durationIcon.style.width = "20px";
    durationIcon.style.height = "20px";
    durationIcon.style.verticalAlign = "middle";
    durationIcon.style.marginRight = "4px";
    duration.textContent = cls.duration;
    duration.prepend(durationIcon);
    const capacity = document.createElement("span");
    const capacityIcon = document.createElement("img");
    capacityIcon.src = "assets/icons/Users.svg";
    capacityIcon.alt = "";
    capacityIcon.style.width = "20px";
    capacityIcon.style.height = "20px";
    capacityIcon.style.verticalAlign = "middle";
    capacityIcon.style.marginRight = "4px";
    capacity.textContent = `정원 ${cls.capacity}명`;
    capacity.prepend(capacityIcon);
    meta.append(duration, capacity);

    const price = document.createElement("div");
    price.className = "card-price";
    price.textContent = `${cls.price.toLocaleString()}원`;

    const btn = document.createElement("button");
    btn.className = "btn-detail";
    btn.textContent = "상세";
    btn.dataset.id = cls.id;

    card.append(illustration, title, category, desc, meta, price, btn);
    container.appendChild(card);
  });
}

function renderSelectedClass() {
  const section = document.getElementById("booking-section");
  const info = document.getElementById("selected-class-info");
  if (!section || !info) return;

  if (!state.selectedClassId) {
    section.style.display = "none";
    return;
  }

  const cls = state.classes.find(c => c.id === state.selectedClassId);
  if (!cls) {
    section.style.display = "none";
    return;
  }

  info.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = cls.title;
  const cat = document.createElement("p");
  cat.textContent = `${cls.category} | ${cls.duration} | 정원 ${cls.capacity}명`;
  const desc = document.createElement("p");
  desc.textContent = cls.description;
  const price = document.createElement("p");
  price.className = "selected-price";
  price.textContent = `${cls.price.toLocaleString()}원`;

  info.append(title, cat, desc, price);
  section.style.display = "block";
  document.getElementById("reveal-booking").style.display = "block";
  document.getElementById("booking-form").style.display = "none";
  document.getElementById("confirmation").style.display = "none";
}

function renderConfirmation() {
  const section = document.getElementById("confirmation");
  const details = document.getElementById("confirmation-details");
  if (!section || !details) return;

  if (!state.confirmation) {
    section.style.display = "none";
    return;
  }

  details.innerHTML = "";
  const title = document.createElement("h3");
  title.textContent = state.confirmation.className;
  details.appendChild(title);
  const rows = [
    { label: "예약자", value: state.confirmation.guest },
    { label: "방문일", value: state.confirmation.date },
    { label: "시간", value: state.confirmation.slot }
  ];

  rows.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "confirm-row";
    const lbl = document.createElement("span");
    lbl.textContent = row.label + ": ";
    const val = document.createElement("span");
    val.textContent = row.value;
    rowDiv.append(lbl, val);
    details.appendChild(rowDiv);
  });

  section.style.display = "block";
}

function initRender() {
  loadState();
  renderCatalogue();
  renderSelectedClass();
  renderConfirmation();
}
document.getElementById("search").addEventListener("input", (e) => {
  state.searchQuery = e.target.value;
  renderCatalogue();
});

document.getElementById("catalogue-list").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-detail");
  if (!btn) return;

  state.selectedClassId = btn.dataset.id;
  renderSelectedClass();
  document.getElementById("booking-section").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("booking-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const guest = document.getElementById("guest");
  const date = document.getElementById("date");
  const slot = document.getElementById("slot");
  if (!guest.value || !date.value || !slot.value) return;

  state.confirmation = {
    classId: state.selectedClassId,
    className: state.classes.find(c => c.id === state.selectedClassId)?.title,
    guest: guest.value,
    date: date.value,
    slot: slot.value
  };
  saveState();
  renderConfirmation();
  document.getElementById("booking-section").style.display = "none";
});

document.getElementById("reveal-booking").addEventListener("click", () => {
  const form = document.getElementById("booking-form");
  form.style.display = "block";
  document.getElementById("guest").focus();
});

document.getElementById("cancel-booking").addEventListener("click", () => {
  state.confirmation = null;
  saveState();
  renderConfirmation();
});

initRender();