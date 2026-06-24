// CLAUDE: Live LED wall preview visualization.
//
// renderGrid() — rebuilds the .grid-stage CSS grid of coloured .cell divs.
//   • Scales wall + human silhouette to fit the .scale-stage box (190px tall)
//   • Cell count driven by pitch (smaller pitch = more cells)
//   • Colors: teal/cyan for indoor, orange/warm for outdoor  (state.location)
//   • Updates #metaRes readout with pixel resolution
//   • Called on every slider change (width, height, distance) and on location toggle
//
// Animation loop (setInterval, ~11 fps) — mutates cell colours with a moving sine wave.
//   animOffset increments each tick to scroll the wave.
//
// Depends on: state.js (state), pricing.js (pitchForDistance)

const gridStage  = document.getElementById('gridStage');
const wallUnit   = document.getElementById('wallUnit');
const wallDim    = document.getElementById('wallDim');
const humanImg   = document.getElementById('humanImg');
const scaleStage = document.getElementById('scaleStage');
const metaRes    = document.getElementById('metaRes');

const HUMAN_HEIGHT_M = 1.6; // reference height for scale figure

function renderGrid() {
  const pitch = pitchForDistance(state.distance);

  // — Scale calculation: fit wall (incl. mount offset) + human inside the stage box —
  const stageH        = scaleStage.clientHeight || 190;
  const stageW        = scaleStage.clientWidth  || 320;
  const humanReserveW = 46;
  // 6px = .scale-stage top padding; 24px = .wall-dim label below grid (7px margin + text)
  // subtracting both prevents the wall from being clipped by overflow:hidden on .led-preview
  const maxWallH      = Math.max(50, stageH - 6 - 24);
  const maxWallW      = Math.max(60, stageW - humanReserveW);

  // Total height from floor to top of wall must fit in the stage
  const totalHeightM = state.mountHeight + state.height;
  const tallestM     = Math.max(totalHeightM, HUMAN_HEIGHT_M * 1.05);
  let scale = maxWallH / tallestM;
  if (state.width * scale > maxWallW) scale = maxWallW / state.width;

  const wallPxW       = Math.max(40, state.width  * scale);
  const wallPxH       = Math.max(30, state.height * scale);
  const humanPxH      = HUMAN_HEIGHT_M * scale;
  const mountOffsetPx = state.mountHeight * scale; // lift wall above floor

  wallUnit.style.width        = wallPxW + 'px';
  wallUnit.style.marginBottom = mountOffsetPx + 'px';
  gridStage.style.width       = wallPxW + 'px';
  gridStage.style.height      = wallPxH + 'px';
  humanImg.style.height       = humanPxH + 'px';
  humanImg.style.width        = (humanPxH * (318 / 1118)) + 'px';

  wallDim.textContent =
    state.width.toFixed(1).replace('.', ',') + ' × ' +
    state.height.toFixed(1).replace('.', ',') + ' m';

  // — Cell density by pitch —
  let cols;
  if      (pitch <= 2.0) cols = 26;
  else if (pitch <= 3.0) cols = 20;
  else if (pitch <= 4.0) cols = 16;
  else if (pitch <= 5.0) cols = 12;
  else if (pitch <= 6.5) cols = 9;
  else                   cols = 7;

  const rows = Math.max(2, Math.round(cols * (state.height / state.width)));
  gridStage.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  gridStage.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;
  gridStage.innerHTML = '';

  const isOutdoor = state.location === 'outdoor';
  for (let i = 0; i < cols * rows; i++) {
    const c   = document.createElement('div');
    c.className = 'cell';
    const col  = i % cols;
    const row  = Math.floor(i / cols);
    const wave = Math.sin((col / cols) * Math.PI * 2 + (row / rows) * Math.PI) * 0.5 + 0.5;
    const v    = wave * (0.85 + Math.random() * 0.15);
    c.style.background = cellColor(isOutdoor, v);
    gridStage.appendChild(c);
  }

  // — Pixel resolution readout —
  const pxW = Math.round((state.width  * 1000) / pitch);
  const pxH = Math.round((state.height * 1000) / pitch);
  metaRes.textContent = `${pxW} × ${pxH} px`;
}

function cellColor(outdoor, v) {
  const c = outdoor
    ? [255, 100 + Math.floor(v * 90), 30]
    : [0, 170 + Math.floor(v * 85), 170 + Math.floor(v * 60)];
  return `rgba(${c[0]},${c[1]},${c[2]},${0.18 + v * 0.55})`;
}

window.addEventListener('resize', renderGrid);

// — Animation loop (~11 fps) —
let animOffset = 0;
setInterval(() => {
  animOffset += 0.12;
  const cells = gridStage.children;
  if (!cells.length) return;
  const cols     = parseInt(getComputedStyle(gridStage).gridTemplateColumns.split(' ').length) || 1;
  const rows     = Math.ceil(cells.length / cols);
  const isOutdoor = state.location === 'outdoor';
  for (let i = 0; i < cells.length; i++) {
    const col  = i % cols;
    const row  = Math.floor(i / cols);
    const wave = Math.sin((col / cols) * Math.PI * 2 + (row / rows) * Math.PI + animOffset) * 0.5 + 0.5;
    cells[i].style.background = cellColor(isOutdoor, wave);
  }
}, 90);
