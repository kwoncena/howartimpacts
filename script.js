// login
const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');
const loginPass = document.getElementById('login-pass');

const LOGIN_SECRET = 'carakwon@gagosian';



if (loginPass) {
  loginPass.value = LOGIN_SECRET;
  setTimeout(() => loginPass.focus(), 50);
}

function completeLogin() {
  if (!loginScreen) return;
  loginScreen.classList.add('hidden');
  setTimeout(() => {
    loginScreen.style.display = 'none';
  }, 250);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (loginPass.value === LOGIN_SECRET) {
      completeLogin();
    } else {
      loginPass.value = LOGIN_SECRET;
    }
  });
}

// live camera background
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('bg-camera');
    video.srcObject = stream;
  } catch (err) {
    console.error('Camera access denied or unavailable:', err);
  }
}

// run after login completes
function completeLogin() {
  if (!loginScreen) return;
  loginScreen.classList.add('hidden');
  setTimeout(() => {
    loginScreen.style.display = 'none';
    startCamera(); 
  }, 250);
}

// clock
const clock = document.getElementById('clock');
const tick = () =>
  (clock.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }));
tick();
setInterval(tick, 1000);

// helpers
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];
const hintChip = qs('#hint-chip');

if (hintChip) {
  const toggleHint = () => {
    hintChip.classList.toggle('active');
  };

  hintChip.addEventListener('click', toggleHint);

  hintChip.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleHint();
    }
  });
}

// random icon positions
(function randomizeIcons() {
  const icons = qsa('.icon');
  const paddingX = 40;
  const topOffset = 70;
  const bottomSafe = 260;

  icons.forEach((icon) => {
    if (icon.id === 'icon-locked') return;
    const maxX = window.innerWidth - 140;
    const maxY = window.innerHeight - bottomSafe;
    const x = Math.random() * (maxX - paddingX) + paddingX;
    const y = Math.random() * (maxY - topOffset) + topOffset;
    icon.style.left = x + 'px';
    icon.style.top = y + 'px';
  });
})();

// draggable icons
qsa('.icon').forEach(makeDraggable);
function makeDraggable(el) {
  if (el.id === 'icon-locked') return;
  el.tabIndex = 0;
  let offX = 0,
    offY = 0,
    dragging = false;

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
    const y = Math.max(52, Math.min(window.innerHeight - 140, cy - offY));
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

// open/close windows
qsa('.icon').forEach((icon) => {
  const winId = icon.dataset.window;
  if (!winId) return;
  icon.addEventListener('dblclick', () => qs('#' + winId).classList.add('active'));
  icon.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') qs('#' + winId).classList.add('active');
  });
});

qsa('[data-close]').forEach((btn) =>
  btn.addEventListener('click', (e) =>
    e.currentTarget.closest('.window').classList.remove('active')
  )
);

// drag windows
qsa('.window .titlebar').forEach(handleWindowDrag);
function handleWindowDrag(bar) {
  const win = bar.closest('.window');
  let ox = 0,
    oy = 0,
    dragging = false;

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
    const y = Math.max(60, Math.min(window.innerHeight - 160, cy - oy));
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

// dock puzzle
const order = [
  'icon-sticky',
  'icon-letter',
  'icon-email',
  'icon-package',
  'icon-postbox',
  'icon-box',
];

const validIconIds = new Set(order);

const dock = qs('#dock');
const slots = qsa('.slot');
const placed = new Map();

slots.forEach((slot) => {
  slot.addEventListener('dragover', (e) => {
    if (slot.dataset.locked === 'true') return;
    e.preventDefault();
  });

  slot.addEventListener('drop', (e) => {
    e.preventDefault();
    if (slot.dataset.locked === 'true') return;

    const id = e.dataTransfer.getData('text/plain');
    const index = parseInt(slot.dataset.index, 10);
    const expected = order[index];

    if (!id || !validIconIds.has(id)) {
      slot.classList.add('shake');
      setTimeout(() => slot.classList.remove('shake'), 250);
      return;
    }

    if (id !== expected) {
      slot.classList.add('shake');
      setTimeout(() => slot.classList.remove('shake'), 250);
      return;
    }

    const glyph = qs('#' + id).querySelector('.glyph').cloneNode(true);
    slot.innerHTML = '';
    slot.appendChild(glyph);
    slot.classList.add('filled', 'correct');
    slot.dataset.locked = 'true';

    const originalIcon = qs('#' + id);
    if (originalIcon) {
      originalIcon.style.visibility = 'hidden';
      originalIcon.setAttribute('draggable', 'false');
    }

    placed.set(index, id);
    validatePuzzle();
  });
});

// draggable icons to dock
qsa('.icon').forEach((icon) => {
  if (icon.id === 'icon-locked') return;
  icon.setAttribute('draggable', 'true');
  icon.addEventListener('dragstart', (e) =>
    e.dataTransfer.setData('text/plain', icon.id)
  );
});

function validatePuzzle() {
  if (placed.size !== order.length) return;
  for (let i = 0; i < order.length; i++) {
    if (placed.get(i) !== order[i]) return;
  }
  showModal();
}

// locked icon + modal password
const modal = qs('#modal');
const pass = qs('#pass');
const unlockBtn = qs('#unlock');
const lockedIcon = qs('#icon-locked');

function showModal() {
  modal.classList.add('active');
  setTimeout(() => pass?.focus(), 50);
}
lockedIcon.addEventListener('dblclick', showModal);
lockedIcon.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') showModal();
});

const SECRET = normalize('the things we send');

unlockBtn.addEventListener('click', tryUnlock);
pass.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') tryUnlock();
});

function normalize(s) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function tryUnlock() {
  if (normalize(pass.value) === SECRET) {
    modal.classList.remove('active');
    pass.value = '';

    const lockedWin = qs('#win-locked');
    if (lockedWin) {
      lockedWin.classList.add('active');

      
      requestAnimationFrame(() => {
        const rect = lockedWin.getBoundingClientRect();
        const x = (window.innerWidth - rect.width) / 2;
        const y = (window.innerHeight - rect.height) / 2;
        lockedWin.style.left = x + 'px';
        lockedWin.style.top = y + 'px';
      });
    }
  } else {
    modal.classList.remove('active');
    pass.value = '';
    pass.placeholder = 'try again…';
  }
}

// open ttws.pdf card
const openFullPoemBtn = qs('#open-full-poem');
const fullPoemWin = qs('#win-poem-full');
const openVideoBtn = document.querySelector('#open-video');
openVideoBtn.addEventListener('click', () => {
  window.open('classified.pdf', '_blank');
});


if (openFullPoemBtn && fullPoemWin) {
  const openPoem = () => fullPoemWin.classList.add('active');
  openFullPoemBtn.addEventListener('click', openPoem);
  openFullPoemBtn.addEventListener('dblclick', openPoem);
}


const openThingsWeSendBtn = qs('#open-things-we-send');
if (openThingsWeSendBtn) {
  openThingsWeSendBtn.addEventListener('click', () => {
    
  });
}

// folder layout → final credits
const sendBtn = qs('#send-folder');
if (sendBtn) {
  sendBtn.addEventListener('click', () => {
    qs('#win-poem-full')?.classList.remove('active');
    qs('#win-locked')?.classList.remove('active');
    spillPapers();
    setTimeout(() => qs('#credits').classList.add('show'), 900);
  });
}

// paper spill + credits
function spillPapers() {
  const N = 26;
  for (let i = 0; i < N; i++) {
    const p = document.createElement('div');
    p.className = 'paper';
    const dx =
      (Math.random() * window.innerWidth - window.innerWidth / 2).toFixed(0) + 'px';
    const dy =
      (Math.random() * window.innerHeight - window.innerHeight / 2).toFixed(0) + 'px';
    const rot = (Math.random() * 20 - 10).toFixed(1) + 'deg';
    p.style.setProperty('--dx', dx);
    p.style.setProperty('--dy', dy);
    p.style.setProperty('--rot', rot);
    p.style.left = window.innerWidth / 2 - 80 + 'px';
    p.style.top = window.innerHeight / 2 - 55 + 'px';
    p.textContent = i % 2 ? 'Gagosian Gallery' : 'Gagosian Gallery';
    document.body.appendChild(p);
  }
}

// ASCII selfie from spacebar
function openAndCenterSelfieWindow() {
  const win = qs('#win-selfie');
  if (!win) return;
  win.classList.add('active');

  requestAnimationFrame(() => {
    const pre = qs('#ascii-selfie-output');
    if (pre) {
      const preRect = pre.getBoundingClientRect();
      const paddingX = 80; // 
      const paddingY = 120;

      const targetWidth = Math.min(window.innerWidth - 40, preRect.width + paddingX);
      const targetHeight = Math.min(window.innerHeight - 80, preRect.height + paddingY);

      win.style.width = targetWidth + 'px';
      win.style.height = targetHeight + 'px';
    }

    const rect = win.getBoundingClientRect();
    const x = (window.innerWidth - rect.width) / 2;
    const y = (window.innerHeight - rect.height) / 2;
    win.style.left = x + 'px';
    win.style.top = y + 'px';
  });
}

function captureAsciiSelfie() {
  const video = document.getElementById('bg-camera');
  if (!video || video.readyState < 2) {
    console.warn('Camera not ready for ASCII selfie');
    return;
  }

  const outputEl = document.getElementById('ascii-selfie-output');
  if (!outputEl) return;

  const w = 80;
  const h = 45;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(video, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h).data;

  const chars = '@%#*+=-:. ';
  let ascii = '';

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const t = lum / 255;
      const ci = Math.floor(t * (chars.length - 1));
      ascii += chars[ci];
    }
    ascii += '\n';
  }

 

  // put ASCII into the window
  outputEl.textContent = ascii;
  openAndCenterSelfieWindow();

  // download ASCII as a .txt file
  const blob = new Blob([ascii], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ascii-selfie.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// global key handler for space
document.addEventListener('keydown', (e) => {
  // ignore when typing in inputs
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    captureAsciiSelfie();
  }
});


// restart
qs('#restart')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.reload();
});

// highlight keywords in fragments
(function highlightCodeWords() {
  const wordRegex = /\b(the|things|we|send)\b/gi;
  const elements = document.querySelectorAll('.txt:not(.ascii), .sticky');

  elements.forEach((el) => {
    const original = el.innerHTML;
    const replaced = original.replace(wordRegex, (match) => {
      const lower = match.toLowerCase();
      const cls =
        lower === 'the'
          ? 'word-the'
          : lower === 'things'
          ? 'word-things'
          : lower === 'we'
          ? 'word-we'
          : 'word-send';
      return `<span class="${cls}">${match}</span>`;
    });
    el.innerHTML = replaced;
  });
})();
