const track = document.getElementById("carousel");

const CARD_WIDTH = 162; // card + gap
const SPEED = 550;
const DELAY = 1200;

let index = 1;
let timer = null;
let isUserInteracting = false;
let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;

/* ================= SHUFFLE ================= */
const shuffled = [...products].sort(() => Math.random() - 0.5);

/* ================= INFINITE DATA ================= */
const items = [
  shuffled[shuffled.length - 1],
  ...shuffled,
  shuffled[0]
];

/* ================= RENDER (ONCE) ================= */
track.innerHTML = "";
items.forEach(p => {
  const el = document.createElement("div");
  el.className = "carousel-item";
  el.innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <div class="carousel-title">${p.name}</div>
  `;
  track.appendChild(el);
});

/* ================= INIT POSITION ================= */
track.style.transition = "none";
track.style.transform = `translateX(${-CARD_WIDTH * index}px)`;

/* ================= CORE SLIDE ================= */
function slide() {
  track.style.transition = `transform ${SPEED}ms cubic-bezier(.4,0,.2,1)`;
  track.style.transform = `translateX(${-CARD_WIDTH * index}px)`;
}

/* ================= AUTO ================= */
function startAuto() {
  stopAuto();
  timer = setInterval(() => {
    if (!isUserInteracting) {
      index++;
      slide();
    }
  }, SPEED + DELAY);
}

function stopAuto() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

/* ================= SEAMLESS LOOP ================= */
track.addEventListener("transitionend", () => {
  if (index === items.length - 1) {
    track.style.transition = "none";
    index = 1;
    track.style.transform = `translateX(${-CARD_WIDTH * index}px)`;
  }

  if (index === 0) {
    track.style.transition = "none";
    index = items.length - 2;
    track.style.transform = `translateX(${-CARD_WIDTH * index}px)`;
  }
});

/* ================= RESET ON TAB RETURN ================= */
function resetPosition() {
  track.style.transition = "none";
  index = 1;
  track.style.transform = `translateX(${-CARD_WIDTH * index}px)`;
  track.offsetHeight; // force reflow
}

/* ================= VISIBILITY FIX ================= */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAuto();
  } else {
    resetPosition();
    startAuto();
  }
});

/* ================= USER INTERACTION ================= */

track.addEventListener("mousedown", e => dragStart(e.clientX));
window.addEventListener("mousemove", e => dragMove(e.clientX));
window.addEventListener("mouseup", dragEnd);

track.addEventListener("touchstart", e => dragStart(e.touches[0].clientX));
track.addEventListener("touchmove", e => dragMove(e.touches[0].clientX));
track.addEventListener("touchend", dragEnd);


function getTranslateX() {
  const style = window.getComputedStyle(track);
  const matrix = new DOMMatrixReadOnly(style.transform);
  return matrix.m41;
}

function dragStart(x) {
  isDragging = true;
  isUserInteracting = true;
  stopAuto();

  startX = x;
  prevTranslate = getTranslateX();
  track.style.transition = "none";
}

function dragMove(x) {
  if (!isDragging) return;

  const delta = x - startX;
  currentTranslate = prevTranslate + delta;
  track.style.transform = `translateX(${currentTranslate}px)`;
}

function dragEnd() {
  if (!isDragging) return;

  isDragging = false;
  isUserInteracting = false;

  const moved = currentTranslate - prevTranslate;

  if (moved < -CARD_WIDTH / 3) index++;
  if (moved > CARD_WIDTH / 3) index--;

  slide();
  startAuto();
}



/* ================= START ================= */
startAuto();
