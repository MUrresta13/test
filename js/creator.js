// Simple character builder that writes to localStorage and shows a live preview.

const form = document.getElementById('creatorForm');
const nameEl = document.getElementById('charName');
const classEl = document.getElementById('charClass');
const colorEl = document.getElementById('charColor');
const accentEl = document.getElementById('accentColor');

const strEl = document.getElementById('str');
const agiEl = document.getElementById('agi');
const intEl = document.getElementById('int');

const strOut = document.getElementById('strOut');
const agiOut = document.getElementById('agiOut');
const intOut = document.getElementById('intOut');
const pointsLeft = document.getElementById('pointsLeft');

const namePrev = document.getElementById('namePrev');
const classPrev = document.getElementById('classPrev');
const statsPrev = document.getElementById('statsPrev');
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');

const randomizeBtn = document.getElementById('randomizeBtn');

const TOTAL_POINTS = 10;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function updatePoints() {
  const s = Number(strEl.value), a = Number(agiEl.value), i = Number(intEl.value);
  const used = s + a + i;
  let left = TOTAL_POINTS - used;
  // If over budget, reduce INT then AGI then STR in that order.
  if (left < 0) {
    let iNew = clamp(Number(intEl.value) + left, 0, 10);
    left += Number(intEl.value) - iNew;
    intEl.value = iNew;
  }
  if (left < 0) {
    let aNew = clamp(Number(agiEl.value) + left, 0, 10);
    left += Number(agiEl.value) - aNew;
    agiEl.value = aNew;
  }
  if (left < 0) {
    let sNew = clamp(Number(strEl.value) + left, 0, 10);
    left += Number(strEl.value) - sNew;
    strEl.value = sNew;
  }
  strOut.textContent = strEl.value;
  agiOut.textContent = agiEl.value;
  intOut.textContent = intEl.value;
  pointsLeft.textContent = left;
  statsPrev.textContent = `${strEl.value} / ${agiEl.value} / ${intEl.value}`;
}

function drawPreview() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Simple floor grid
  ctx.fillStyle = '#0c121b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#1e2a3d';
  for (let x = 0; x < canvas.width; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // Character: colored body + accent outline + eyes
  const body = colorEl.value;
  const accent = accentEl.value;

  const cx = canvas.width * 0.5, cy = canvas.height * 0.6;
  const w = 40, h = 52;

  // Accent outline
  ctx.fillStyle = accent;
  ctx.fillRect(cx - w/2 - 3, cy - h/2 - 3, w + 6, h + 6);

  // Body
  ctx.fillStyle = body;
  ctx.fillRect(cx - w/2, cy - h/2, w, h);

  // Head (circle)
  ctx.beginPath();
  ctx.arc(cx, cy - h/2 - 18, 16, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 8, cy - h/2 - 20, 6, 6);
  ctx.fillRect(cx + 2, cy - h/2 - 20, 6, 6);
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 6, cy - h/2 - 18, 3, 3);
  ctx.fillRect(cx + 4, cy - h/2 - 18, 3, 3);

  // Nameplate
  ctx.fillStyle = '#e9f2ff';
  ctx.font = '16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(nameEl.value || '—', cx, cy - h/2 - 40);
}

function updatePreview() {
  namePrev.textContent = nameEl.value || '—';
  classPrev.textContent = classEl.value;
  updatePoints();
  drawPreview();
}

function randomize() {
  const classes = ['Warrior','Rogue','Mage','Ranger'];
  nameEl.value = ['Aerin','Kade','Lyra','Rook','Sable','Thorne'][Math.floor(Math.random()*6)];
  classEl.value = classes[Math.floor(Math.random()*classes.length)];
  colorEl.value = '#'+Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0');
  accentEl.value = '#'+Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0');

  // Random stats total = 10
  const a = Math.floor(Math.random()*11);
  const b = Math.floor(Math.random()*(11-a));
  const c = 10 - a - b;
  strEl.value = a; agiEl.value = b; intEl.value = c;
  updatePreview();
}

[nameEl, classEl, colorEl, accentEl, strEl, agiEl, intEl].forEach(el => {
  el.addEventListener('input', updatePreview);
});

randomizeBtn.addEventListener('click', randomize);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = (nameEl.value || '').trim();
  if (!name) {
    alert('Please enter a name.');
    nameEl.focus();
    return;
  }
  const data = {
    name,
    class: classEl.value,
    color: colorEl.value,
    accent: accentEl.value,
    stats: {
      str: Number(strEl.value),
      agi: Number(agiEl.value),
      int: Number(intEl.value)
    },
    createdAt: Date.now()
  };
  localStorage.setItem('rpg.character', JSON.stringify(data));
  window.location.href = './game.html';
});

// Initial
updatePreview();
