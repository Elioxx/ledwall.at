// LED-Wand-Renderer: zeichnet eine laufende Wand auf ein <canvas> — als geschlossenes Bild
// ohne sichtbare Pixel, so wie man sie aus dem richtigen Abstand sieht.
// mountLedWall(canvas, opts) → { update(opts) }
//   opts.cols / opts.rows   Anzahl Cabinets (bestimmt das Seitenverhältnis)
//   opts.seams              Cabinet-Raster ganz dezent andeuten (Konfigurator)
//   opts.mirror             zweites <canvas>, das die Bodenspiegelung bekommt (optional)
//   opts.glow               Element, dessen box-shadow in der Bildfarbe leuchtet (optional)
// Inhalt: vier Szenen im Wechsel (Alpenpanorama, Bühne, Anzeigetafel, Präsentation).
// Bei prefers-reduced-motion wird nur ein Standbild gezeichnet.

function mountLedWall(canvas, opts) {
  const ctx = canvas.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const probe = document.createElement('canvas');
  probe.width = probe.height = 1;
  const pctx = probe.getContext('2d', { willReadFrequently: true });
  const FONT = 'Archivo, Arial, sans-serif';
  const SCENE_S = 6, FADE_S = 0.8;
  let o = {}, W = 0, H = 0, t0 = performance.now(), frame = 0;

  // — Szenen: jede zeichnet auf (c, W, H) zum Zeitpunkt t (Sekunden) —
  function ridge(c, base, amp, seed, color, shift) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, H);
    for (let x = 0; x <= W; x += Math.max(2, W / 240)) {
      const u = x / W * 6 + seed + shift;
      const y = base - amp * (0.55 * Math.abs(Math.sin(u * 1.3)) + 0.3 * Math.abs(Math.sin(u * 2.9 + seed)) + 0.15 * Math.sin(u * 7.1));
      c.lineTo(x, y);
    }
    c.lineTo(W, H);
    c.fill();
  }

  function sceneAlps(c, t) {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1b2a6b'); g.addColorStop(0.45, '#c2477a'); g.addColorStop(0.72, '#ff9a3c'); g.addColorStop(1, '#ffd58a');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const sx = W * 0.68, sy = H * (0.6 - 0.03 * Math.sin(t * 0.3));
    const sun = c.createRadialGradient(sx, sy, 0, sx, sy, H * 0.55);
    sun.addColorStop(0, 'rgba(255,250,220,1)'); sun.addColorStop(0.12, 'rgba(255,225,150,.95)'); sun.addColorStop(1, 'rgba(255,170,80,0)');
    c.fillStyle = sun; c.fillRect(0, 0, W, H);
    ridge(c, H * 0.78, H * 0.42, 1.7, '#7d3f78', t * 0.010);
    ridge(c, H * 0.88, H * 0.38, 4.2, '#472a5e', t * 0.018);
    ridge(c, H * 1.00, H * 0.34, 9.1, '#1a1430', t * 0.030);
  }

  function sceneStage(c, t) {
    c.fillStyle = '#07030f'; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    const cols = ['255,40,120', '60,120,255', '170,60,255', '0,220,200', '255,150,30'];
    cols.forEach((rgb, i) => {
      const ox = W * (0.1 + i * 0.2);
      const ang = Math.sin(t * (0.5 + i * 0.13) + i * 1.9) * 0.55;
      const len = H * 1.5, half = W * 0.07;
      const ex = ox + Math.sin(ang) * len, ey = Math.cos(ang) * len;
      const g = c.createLinearGradient(ox, 0, ex, ey);
      g.addColorStop(0, `rgba(${rgb},.85)`); g.addColorStop(1, `rgba(${rgb},0)`);
      c.fillStyle = g;
      c.beginPath(); c.moveTo(ox - W * 0.006, 0); c.lineTo(ox + W * 0.006, 0); c.lineTo(ex + half, ey); c.lineTo(ex - half, ey); c.fill();
    });
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `900 ${H * 0.34}px ${FONT}`;
    c.fillText('LIVE', W / 2, H * 0.54);
  }

  function sceneScore(c, t) {
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#0b3d2a'); g.addColorStop(1, '#06241a');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.07)';
    for (let i = 0; i < 6; i += 2) c.fillRect(i * W / 6, 0, W / 6, H);
    c.textBaseline = 'middle'; c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.font = `600 ${H * 0.1}px ${FONT}`;
    c.fillText('HEIM', W * 0.22, H * 0.24); c.fillText('GAST', W * 0.78, H * 0.24);
    c.font = `900 ${H * 0.46}px ${FONT}`;
    c.fillText('2', W * 0.22, H * 0.6); c.fillText('1', W * 0.78, H * 0.6);
    c.fillStyle = '#ffd23c';
    c.font = `800 ${H * 0.15}px ${FONT}`;
    const sec = 12 + Math.floor(t) % 48;
    c.fillText(`67:${String(sec).padStart(2, '0')}`, W / 2, H * 0.52);
    c.fillStyle = 'rgba(255,255,255,.75)';
    c.font = `500 ${H * 0.075}px ${FONT}`;
    c.fillText('2. Halbzeit', W / 2, H * 0.7);
  }

  function sceneSlide(c, t) {
    c.fillStyle = '#f4f5f1'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#d41f2d'; c.fillRect(0, 0, W * 0.012, H);
    c.fillStyle = '#15181d'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.font = `800 ${H * 0.13}px ${FONT}`;
    c.fillText('Umsatz 2026', W * 0.07, H * 0.24);
    c.fillStyle = '#59616c';
    c.font = `500 ${H * 0.07}px ${FONT}`;
    c.fillText('Quartale im Vergleich', W * 0.07, H * 0.35);
    const vals = [0.42, 0.55, 0.63, 0.86];
    const grow = Math.min(1, (t % SCENE_S) / 1.6);
    const ease = 1 - Math.pow(1 - grow, 3);
    const bw = W * 0.12, gap = W * 0.06, x0 = W * 0.2, base = H * 0.88, maxH = H * 0.42;
    vals.forEach((v, i) => {
      const h = maxH * v * ease, x = x0 + i * (bw + gap);
      c.fillStyle = i === 3 ? '#d41f2d' : '#15181d';
      c.fillRect(x, base - h, bw, h);
      c.fillStyle = '#59616c'; c.textAlign = 'center';
      c.font = `600 ${H * 0.06}px ${FONT}`;
      c.fillText('Q' + (i + 1), x + bw / 2, base + H * 0.075);
    });
  }

  const SCENES = [sceneAlps, sceneStage, sceneScore, sceneSlide];

  function layout() {
    const cssW = canvas.clientWidth || 600;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.max(2, Math.round(cssW * dpr));
    H = canvas.height = Math.max(2, Math.round(W * o.rows / o.cols));
    if (o.mirror) { o.mirror.width = W; o.mirror.height = H; }
  }

  function draw() {
    const t = still ? 2 : (performance.now() - t0) / 1000;
    const idx = Math.floor(t / SCENE_S) % SCENES.length;
    const into = t % SCENE_S;
    ctx.globalAlpha = 1;
    SCENES[idx](ctx, t);
    if (!still && into > SCENE_S - FADE_S) {
      ctx.globalAlpha = (into - (SCENE_S - FADE_S)) / FADE_S;
      SCENES[(idx + 1) % SCENES.length](ctx, t - SCENE_S - into + SCENE_S);
      ctx.globalAlpha = 1;
    }
    if (o.seams) {
      ctx.strokeStyle = 'rgba(0,0,0,.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < o.cols; i++) { const x = Math.round(i * W / o.cols) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let i = 1; i < o.rows; i++) { const y = Math.round(i * H / o.rows) + 0.5; ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
    }
    if (o.mirror) o.mirror.getContext('2d').drawImage(canvas, 0, 0);
    if (o.glow && frame % 6 === 0) {
      pctx.drawImage(canvas, 0, 0, 1, 1);
      const d = pctx.getImageData(0, 0, 1, 1).data;
      o.glow.style.boxShadow = `0 0 120px 10px rgba(${d[0]},${d[1]},${d[2]},.45)`;
    }
    frame++;
  }

  function loop() {
    if (!canvas.isConnected) return;
    draw();
    requestAnimationFrame(loop);
  }

  function update(next) {
    o = Object.assign({ cols: 8, rows: 4, seams: false, mirror: null, glow: null }, o, next);
    layout();
    draw();
  }

  update(opts);
  if (!still) requestAnimationFrame(loop);
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => update({}), 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw());
  return { update };
}
