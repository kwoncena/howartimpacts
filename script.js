// ===== clock =====
const clock = document.getElementById('clock');
const tick = () => (clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
tick();
setInterval(tick, 1000);

// ===== qs helpers =====
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];

// ===== draggable icons (free move on desktop) =====
qsa('.icon').forEach(makeDraggable);
function makeDraggable(el) {
  el.tabIndex = 0;
  let startX = 0, startY = 0, offX = 0, offY = 0, dragging = false;

  const down = (e) => {
    dragging = true;
    const r = el.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    offX = cx - r.left;
    offY = cy - r.top;
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', up);
  };

  const move = (e) => {
    if (!dragging) return;
    e.preventDefault?.();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.max(8, Math.min(window.innerWidth - 110, cx - offX));
    const y = Math.max(52, Math.min(window.innerHeight - 110, cy - offY));
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  };

  const up = () => {
    dragging = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    document.removeEventListener('touchmove', move);
    document.removeEventListener('touchend', up);
  };

  el.addEventListener('mousedown', down);
  el.addEventListener('touchstart', down, { passive: true });
}

// ===== windows: open/close + drag by titlebar =====
qsa('.icon').forEach((icon) => {
  const winId = icon.dataset.window;
  if (!winId) return;
  icon.addEventListener('dblclick', () => qs('#' + winId).classList.add('active'));
  icon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') qs('#' + winId).classList.add('active');
  });
});

qsa('[data-close]').forEach((btn) =>
  btn.addEventListener('click', (e) => e.currentTarget.closest('.window').classList.remove('active'))
);

qsa('.window .titlebar').forEach(handleWindowDrag);
function handleWindowDrag(bar) {
  const win = bar.closest('.window');
  let ox = 0, oy = 0, dragging = false;

  const down = (e) => {
    dragging = true;
    const r = win.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    ox = cx - r.left;
    oy = cy - r.top;
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', up);
  };

  const move = (e) => {
    if (!dragging) return;
    e.preventDefault?.();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.max(8, Math.min(window.innerWidth - 120, cx - ox));
    const y = Math.max(60, Math.min(window.innerHeight - 120, cy - oy));
    win.style.left = x + 'px';
    win.style.top = y + 'px';
  };

  const up = () => {
    dragging = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
    document.removeEventListener('touchmove', move);
    document.removeEventListener('touchend', up);
  };

  bar.addEventListener('mousedown', down);
  bar.addEventListener('touchstart', down, { passive: true });
}

// ===== dock puzzle (drag icons into slots) =====
const order = ['icon-letter', 'icon-postbox', 'icon-email', 'icon-sticky', 'icon-package', 'icon-box']; // adjust if you change the flow
const dock = qs('#dock');
const slots = qsa('.slot');
const placed = new Map();

slots.forEach((slot) => {
  slot.addEventListener('dragover', (e) => e.preventDefault());
  slot.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    slot.textContent = '';
    slot.classList.add('filled');
    const label = document.createElement('div');
    label.textContent = qs('#' + id).querySelector('.label').textContent;
    label.style.fontSize = '.8rem';
    label.style.opacity = '.85';
    slot.replaceChildren(label);
    placed.set(parseInt(slot.dataset.index, 10), id);
    validatePuzzle();
  });
});

qsa('.icon').forEach((icon) => {
  icon.setAttribute('draggable', 'true');
  icon.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', icon.id));
});

function validatePuzzle() {
  if (placed.size !== order.length) return;
  for (let i = 0; i < order.length; i++) {
    if (placed.get(i) !== order[i]) return;
  }
  // puzzle solved → reveal modal as a hint to unlock
  showModal();
}

// ===== locked icon + modal password =====
const modal = qs('#modal');
const pass = qs('#pass');
const unlockBtn = qs('#unlock');
const lockedIcon = qs('#icon-locked');

function showModal() {
  modal.classList.add('active');
  setTimeout(() => pass?.focus(), 50);
}
lockedIcon.addEventListener('dblclick', showModal);
lockedIcon.addEventListener('keydown', (e) => { if (e.key === 'Enter') showModal(); });

const SECRET = normalize('the things we send'); // change if you rename the poem
unlockBtn.addEventListener('click', tryUnlock);
pass.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });

function normalize(s) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function tryUnlock() {
  if (normalize(pass.value) === SECRET) {
    modal.classList.remove('active');
    spillPapers();
    setTimeout(() => qs('#credits').classList.add('show'), 900);
  } else {
    pass.value = '';
    pass.placeholder = 'try again…';
  }
}

// ===== paper spill + credits =====
function spillPapers() {
  const N = 26;
  for (let i = 0; i < N; i++) {
    const p = document.createElement('div');
    p.className = 'paper';
    const dx = (Math.random() * window.innerWidth - window.innerWidth / 2).toFixed(0) + 'px';
    const dy = (Math.random() * window.innerHeight - window.innerHeight / 2).toFixed(0) + 'px';
    const rot = (Math.random() * 20 - 10).toFixed(1) + 'deg';
    p.style.setProperty('--dx', dx);
    p.style.setProperty('--dy', dy);
    p.style.setProperty('--rot', rot);
    p.style.left = window.innerWidth / 2 - 80 + 'px';
    p.style.top = window.innerHeight / 2 - 55 + 'px';
    p.textContent = i % 2 ? '✉︎' : 'poem.pdf';
    document.body.appendChild(p);
  }
}

// ===== restart =====
qs('#restart')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.reload();
});