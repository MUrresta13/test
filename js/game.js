// Minimal canvas "scene" that loads the saved character and renders a movable avatar.

const hud = document.getElementById('hud');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');

const SPEED = 3; // px per frame
const TILE = 40;

// Load character or bounce back
const raw = localStorage.getItem('rpg.character');
if (!raw) window.location.replace('./index.html');
const character = raw ? JSON.parse(raw) : null;

// Basic player state
const player = {
  x: 80,
  y: 80,
  w: 28,
  h: 36,
  vx: 0,
  vy: 0,
  color: character?.color || '#0aa5ff',
  accent: character?.accent || '#ffd166',
  name: character?.name || '—',
  class: character?.class || 'Warrior',
  stats: character?.stats || { str: 3, agi: 3, int: 4 },
};

function writeHUD() {
  hud.innerHTML = `
    <li><b>Name:</b> ${player.name}</li>
    <li><b>Class:</b> ${player.class}</li>
    <li><b>Color:</b> <span style="background:${player.color}; padding:0 6px; border-radius:4px;">&nbsp;</span></li>
    <li><b>Accent:</b> <span style="background:${player.accent}; padding:0 6px; border-radius:4px;">&nbsp;</span></li>
    <li><b>STR/AGI/INT:</b> ${player.stats.str} / ${player.stats.agi} / ${player.stats.int}</li>
  `;
}
writeHUD();

resetBtn.addEventListener('click', () => {
  localStorage.removeItem('rpg.character');
  window.location.href = './index.html';
});

// Input
const keys = new Set();
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)) e.preventDefault();
  keys.add(k);
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

// Simple map: walls rectangle + pillars
const walls = [
  // Outer border
  { x: 0, y: 0, w: canvas.width, h: TILE },
  { x: 0, y: canvas.height - TILE, w: canvas.width, h: TILE },
  { x: 0, y: 0, w: TILE, h: canvas.height },
  { x: canvas.width - TILE, y: 0, w: TILE, h: canvas.height },
  // Pillars
  { x: 240, y: 120, w: TILE, h: TILE },
  { x: 420, y: 220, w: TILE, h: TILE },
  { x: 560, y: 100, w: TILE, h: TILE }
];

function rectsOverlap(a, b) {
  return (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
}

function moveAndCollide(px, py) {
  const next = { x: px, y: py, w: player.w, h: player.h };
  for (const wall of walls) {
    if (rectsOverlap(next, wall)) return false;
  }
  // canvas bounds safety (inside outer border)
  const minX = TILE, minY = TILE, maxX = canvas.width - TILE - player.w, maxY = canvas.height - TILE - player.h;
  if (next.x < minX || next.y < minY || next.x > maxX || next.y > maxY) return false;
  player.x = next.x; player.y = next.y;
  return true;
}

function update() {
  // Velocity from input
  let vx = 0, vy = 0;
  if (keys.has('arrowleft') || keys.has('a')) vx -= SPEED;
  if (keys.has('arrowright') || keys.has('d')) vx += SPEED;
  if (keys.has('arrowup') || keys.has('w')) vy -= SPEED;
  if (keys.has('arrowdown') || keys.has('s')) vy += SPEED;

  // Normalize diagonal speed
  if (vx && vy) { vx *= 0.7071; vy *= 0.7071; }
  // Agility gives a tiny speed bonus
  const bonus = Math.min(0.8, player.stats.agi * 0.03);
  vx *= (1 + bonus);
  vy *= (1 + bonus);

  // Attempt move (split for sliding along walls)
  if (vx) moveAndCollide(player.x + vx, player.y);
  if (vy) moveAndCollide(player.x, player.y + vy);
}

function draw() {
  // Background grid
  ctx.fillStyle = '#0b111a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#152234';
  for (let x = 0; x < canvas.width; x += TILE) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += TILE) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // Walls
  ctx.fillStyle = '#1a2a3f';
  walls.forEach(w => ctx.fillRect(w.x, w.y, w.w, w.h));

  // Player (accent border)
  ctx.fillStyle = player.accent;
  ctx.fillRect(player.x - 3, player.y - 3, player.w + 6, player.h + 6);

  // Player body
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Head
  ctx.beginPath();
  ctx.arc(player.x + player.w/2, player.y - 12, 10, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();

  // Name floating
  ctx.fillStyle = '#e9f2ff';
  ctx.font = '14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(player.name, player.x + player.w/2, player.y - 28);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
