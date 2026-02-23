/* ============================================
   お手伝いポイントカード - app.js
   ============================================ */

// ── お手伝い定義 ──
const CHORES = [
  { id: 'souji', name: 'おそうじ', icon: '🧹', stamps: 2 },
  { id: 'kusamushiri', name: 'くさむしり', icon: '🌿', stamps: 2 },
  { id: 'okaimono', name: 'おかいものてつだい', icon: '🛒', stamps: 2 },
  { id: 'shredder', name: 'シュレッダー', icon: '📄', stamps: 2 },
  { id: 'gohan', name: 'ごはんのじゅんび', icon: '🍚', stamps: 1 },
  { id: 'sentaku', name: 'おせんたくたたみ', icon: '👕', stamps: 1 },
  { id: 'futon', name: 'ふとんたたみ', icon: '🛏️', stamps: 1 },
  { id: 'okataduke', name: 'おかたづけ', icon: '📦', stamps: 1 },
  { id: 'mizuyari', name: 'おみずやり', icon: '🌱', stamps: 1 },
  { id: 'kanakun', name: 'かなくんと遊ぶ', icon: '👶', stamps: 1 },
];

const TOTAL_SLOTS = 15;
const STAMP_ICONS = ['🌸', '🌷', '🌺', '🌻', '🌼', '🦋', '🌹', '💐'];
const STORAGE_KEY = 'otetsudai_stamp_card';

// ── State ──
let appState = {
  currentCard: {
    cardNumber: 1,
    stamps: [] // { slot, chore, icon, choreIcon, date }
  },
  completedCards: []
};

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderCard();
  renderChoreList();
  createSparkles();
});

// ── LocalStorage ──
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      appState = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

// ── Screen Navigation ──
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function showMain() {
  showScreen('main-screen');
  renderCard();
}

// ── Sparkle Particles ──
function createSparkles() {
  const container = document.getElementById('sparkles');
  const count = 30;
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.animationDuration = (4 + Math.random() * 6) + 's';
    sparkle.style.animationDelay = (Math.random() * 8) + 's';
    sparkle.style.width = (2 + Math.random() * 4) + 'px';
    sparkle.style.height = sparkle.style.width;
    container.appendChild(sparkle);
  }
}

// ── Render Stamp Card ──
function renderCard() {
  const cardEl = document.getElementById('stamp-card');
  const cardNumEl = document.getElementById('card-number');
  const counterEl = document.getElementById('stamp-counter');

  const card = appState.currentCard;
  cardNumEl.textContent = `🌷 ${card.cardNumber}かいめのカード`;

  const filledCount = card.stamps.length;
  counterEl.textContent = `⭐ ${filledCount} / ${TOTAL_SLOTS}`;

  cardEl.innerHTML = '';
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const slot = document.createElement('div');
    slot.className = 'stamp-slot';

    const stamp = card.stamps.find(s => s.slot === i);
    if (stamp) {
      slot.classList.add('filled');
      const iconSpan = document.createElement('span');
      iconSpan.className = 'stamp-icon';
      iconSpan.textContent = stamp.icon;
      slot.appendChild(iconSpan);

      // Small number
      const numSpan = document.createElement('span');
      numSpan.className = 'stamp-number';
      numSpan.textContent = i + 1;
      slot.appendChild(numSpan);

      slot.title = stamp.chore;

      // Tap to undo
      slot.onclick = () => showUndoConfirm(i);
    } else {
      slot.classList.add('empty');
    }

    cardEl.appendChild(slot);
  }

  // Disable button if card is full
  const btn = document.getElementById('btn-otetsudai');
  if (filledCount >= TOTAL_SLOTS) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  } else {
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

// ── Undo Stamp ──
let undoTargetSlot = null;

function showUndoConfirm(slotIndex) {
  const stamp = appState.currentCard.stamps.find(s => s.slot === slotIndex);
  if (!stamp) return;

  undoTargetSlot = slotIndex;

  document.getElementById('undo-stamp-preview').textContent = stamp.icon;
  document.getElementById('undo-chore-name').textContent = `${stamp.choreIcon || stamp.icon} ${stamp.chore}`;
  document.getElementById('undo-modal').classList.add('active');
}

function undoStamp() {
  if (undoTargetSlot === null) return;

  appState.currentCard.stamps = appState.currentCard.stamps.filter(s => s.slot !== undoTargetSlot);
  undoTargetSlot = null;

  saveState();
  closeUndoModalDirect();
  renderCard();
}

function closeUndoModal(event) {
  if (event.target === event.currentTarget) {
    closeUndoModalDirect();
  }
}

function closeUndoModalDirect() {
  document.getElementById('undo-modal').classList.remove('active');
  undoTargetSlot = null;
}

// ── Chore Modal ──
function renderChoreList() {
  const listEl = document.getElementById('chore-list');
  listEl.innerHTML = '';

  CHORES.forEach(chore => {
    const btn = document.createElement('button');
    btn.className = 'chore-btn';
    btn.onclick = () => addStamp(chore);

    const starsText = chore.stamps === 2 ? '⭐⭐ ×2' : '⭐ ×1';

    btn.innerHTML = `
      <span class="chore-icon">${chore.icon}</span>
      <span class="chore-name">${chore.name}</span>
      <span class="chore-stars">${starsText}</span>
    `;

    listEl.appendChild(btn);
  });
}

function showChoreModal() {
  document.getElementById('chore-modal').classList.add('active');
  document.getElementById('custom-chore-input').value = '';
  document.querySelector('input[name="custom-stamps"][value="1"]').checked = true;
}

function closeChoreModal() {
  document.getElementById('chore-modal').classList.remove('active');
}

function closeModal(event) {
  if (event.target === event.currentTarget) {
    closeChoreModal();
  }
}

// ── Add Custom Chore ──
function addCustomChore() {
  const input = document.getElementById('custom-chore-input');
  const name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }

  const stamps = parseInt(document.querySelector('input[name="custom-stamps"]:checked').value);
  const chore = {
    id: 'custom',
    name: name,
    icon: '✏️',
    stamps: stamps
  };

  addStamp(chore);
}

// ── Add Stamp ──
function addStamp(chore) {
  const card = appState.currentCard;
  const filledSlots = card.stamps.map(s => s.slot);
  const emptySlots = [];

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    if (!filledSlots.includes(i)) {
      emptySlots.push(i);
    }
  }

  if (emptySlots.length === 0) return;

  const stampsToAdd = Math.min(chore.stamps, emptySlots.length);
  const slotsToFill = emptySlots.slice(0, stampsToAdd);

  closeChoreModal();

  const today = new Date().toLocaleDateString('ja-JP');

  // Add stamps with staggered animation
  slotsToFill.forEach((slotIndex, i) => {
    setTimeout(() => {
      const randomIcon = STAMP_ICONS[Math.floor(Math.random() * STAMP_ICONS.length)];

      card.stamps.push({
        slot: slotIndex,
        chore: chore.name,
        choreIcon: chore.icon,
        icon: randomIcon,
        date: today
      });

      saveState();
      renderCard();

      // Trigger stamp animation
      const slotEl = document.querySelectorAll('.stamp-slot')[slotIndex];
      if (slotEl) {
        slotEl.classList.add('stamping');
        slotEl.addEventListener('animationend', () => {
          slotEl.classList.remove('stamping');
        }, { once: true });
      }

      // Play sound-like visual feedback
      createStampBurst(slotEl);

      // Check completion after last stamp
      if (i === slotsToFill.length - 1) {
        setTimeout(() => {
          checkCompletion();
        }, 400);
      }
    }, i * 500);
  });
}

// ── Stamp Burst Effect ──
function createStampBurst(slotEl) {
  if (!slotEl) return;
  const rect = slotEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 6px;
      height: 6px;
      background: ${['#F5A3B8', '#E8789A', '#FDDDE6', '#B4A0D6'][i % 4]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 50;
      left: ${centerX}px;
      top: ${centerY}px;
    `;

    document.body.appendChild(particle);

    const angle = (i / 8) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    particle.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
    ], {
      duration: 500,
      easing: 'ease-out'
    }).onfinish = () => particle.remove();
  }
}

// ── Check Completion ──
function checkCompletion() {
  if (appState.currentCard.stamps.length >= TOTAL_SLOTS) {
    celebrate();
  }
}

// ── Celebration ──
function celebrate() {
  const overlay = document.getElementById('celebration-overlay');
  const titleEl = document.getElementById('celebration-title');
  const msgEl = document.getElementById('celebration-message');

  const cardNum = appState.currentCard.cardNumber;
  titleEl.textContent = '🎊 やったね！ 🎊';
  msgEl.textContent = `カード ${cardNum}かいめ たっせい！！`;

  overlay.classList.add('active');

  // Star particles
  createCelebrationStars();

  // Confetti
  startConfetti();
}

function createCelebrationStars() {
  const container = document.getElementById('celebration-stars');
  container.innerHTML = '';

  const icons = ['🌸', '🌷', '🌺', '🌻', '🌼', '🦋', '🌹', '💐', '🌿', '💮'];

  for (let i = 0; i < 30; i++) {
    const star = document.createElement('div');
    star.className = 'celebration-star';
    star.textContent = icons[Math.floor(Math.random() * icons.length)];
    star.style.left = Math.random() * 100 + '%';
    star.style.animationDuration = (2 + Math.random() * 3) + 's';
    star.style.animationDelay = (Math.random() * 2) + 's';
    star.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    container.appendChild(star);
  }
}

// ── Confetti Canvas ──
let confettiAnimation = null;

function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#F5A3B8', '#E8789A', '#FDDDE6', '#B4A0D6', '#FFD1DC', '#FFF0F5', '#C45B7C'];
  const confetti = [];

  for (let i = 0; i < 150; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      drift: (Math.random() - 0.5) * 2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    confetti.forEach(c => {
      if (c.y < canvas.height + 20) {
        active = true;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();

        c.y += c.speed;
        c.x += c.drift;
        c.angle += c.spin;
      }
    });

    if (active) {
      confettiAnimation = requestAnimationFrame(draw);
    }
  }

  if (confettiAnimation) {
    cancelAnimationFrame(confettiAnimation);
  }
  draw();
}

// ── Start New Card ──
function startNewCard() {
  // Save current card to history
  appState.completedCards.push({
    ...appState.currentCard,
    completedDate: new Date().toLocaleDateString('ja-JP')
  });

  // Create new card
  appState.currentCard = {
    cardNumber: appState.currentCard.cardNumber + 1,
    stamps: []
  };

  saveState();

  // Close celebration
  const overlay = document.getElementById('celebration-overlay');
  overlay.classList.remove('active');
  if (confettiAnimation) {
    cancelAnimationFrame(confettiAnimation);
    confettiAnimation = null;
  }
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderCard();
}

// ── History ──
function showHistory() {
  showScreen('history-screen');
  renderHistoryList();
}

function renderHistoryList() {
  const listEl = document.getElementById('history-list');
  listEl.innerHTML = '';

  if (appState.completedCards.length === 0) {
    listEl.innerHTML = '<div class="history-empty">🌷 まだカードをたっせいしていないよ<br>がんばろう！</div>';
    return;
  }

  // Show newest first
  const sorted = [...appState.completedCards].reverse();

  sorted.forEach(card => {
    const item = document.createElement('div');
    item.className = 'history-card-item fade-in';
    item.onclick = () => showHistoryDetail(card.cardNumber);

    const choresText = getChoresSummary(card.stamps);

    item.innerHTML = `
      <div class="history-title">🌷 ${card.cardNumber}かいめのカード 🎊</div>
      <div class="history-date">たっせい日: ${card.completedDate}</div>
      <div class="history-date" style="margin-top: 4px">${choresText}</div>
    `;

    listEl.appendChild(item);
  });
}

function getChoresSummary(stamps) {
  const choreCounts = {};
  stamps.forEach(s => {
    choreCounts[s.chore] = (choreCounts[s.chore] || 0) + 1;
  });

  return Object.entries(choreCounts)
    .map(([name, count]) => `${name}(${count})`)
    .join(' ');
}

// ── History Detail ──
function showHistoryDetail(cardNumber) {
  const card = appState.completedCards.find(c => c.cardNumber === cardNumber);
  if (!card) return;

  showScreen('history-detail-screen');

  document.getElementById('history-detail-title').textContent = `📖 ${cardNumber}かいめのカード`;

  // Render card grid
  const cardEl = document.getElementById('history-stamp-card');
  cardEl.innerHTML = '';

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const slot = document.createElement('div');
    slot.className = 'stamp-slot';

    const stamp = card.stamps.find(s => s.slot === i);
    if (stamp) {
      slot.classList.add('filled');
      const iconSpan = document.createElement('span');
      iconSpan.className = 'stamp-icon';
      iconSpan.textContent = stamp.icon;
      slot.appendChild(iconSpan);

      const numSpan = document.createElement('span');
      numSpan.className = 'stamp-number';
      numSpan.textContent = i + 1;
      slot.appendChild(numSpan);

      slot.title = stamp.chore;
    } else {
      slot.classList.add('empty');
    }

    cardEl.appendChild(slot);
  }

  // Render chore list
  const choreListEl = document.getElementById('history-chore-list');
  choreListEl.innerHTML = '';

  card.stamps.forEach((stamp, index) => {
    const item = document.createElement('div');
    item.className = 'history-chore-item fade-in';
    item.style.animationDelay = (index * 0.05) + 's';

    item.innerHTML = `
      <span class="hc-icon">${stamp.choreIcon || stamp.icon}</span>
      <span class="hc-name">${stamp.chore}</span>
      <span class="hc-date">${stamp.date}</span>
    `;

    choreListEl.appendChild(item);
  });
}
