// LED-Wand-Renderer: zeichnet eine Punktmatrix aus Cabinets auf ein <canvas>.
// mountLedWall(canvas, opts) → { update(opts) }
//   opts.cols / opts.rows   Anzahl Cabinets
//   opts.dots               sichtbare LED-Punkte je Cabinet-Kante (stellt den Pitch dar)
//   opts.words              Texte, die nacheinander über die Wand laufen (optional)
//   opts.warm               wärmere Farbwelt (Outdoor)
// Bei prefers-reduced-motion wird nur ein Standbild gezeichnet.

function mountLedWall(canvas, opts) {
  const ctx = canvas.getContext('2d');
  const src = document.createElement('canvas');
  const sctx = src.getContext('2d', { willReadFrequently: true });
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let o = {}, gw = 0, gh = 0, t = 0, timer = null;

  function layout() {
    // Punktzahl begrenzen, damit auch große Wände flüssig bleiben
    let dots = o.dots;
    while (o.cols * dots * o.rows * dots > 16000 && dots > 4) dots--;
    o.d = dots;
    gw = o.cols * dots; gh = o.rows * dots;
    src.width = gw; src.height = gh;
    const cssW = canvas.clientWidth || 600;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(canvas.width * o.rows / o.cols);
  }

  function paintSource() {
    // Bewegter Farbverlauf als Bildinhalt
    const img = sctx.createImageData(gw, gh);
    const a = img.data;
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const u = x / gw, v = y / gh;
        const s1 = Math.sin(u * 5.2 + t * 0.9 + Math.sin(v * 3.1 + t * 0.4) * 1.3);
        const s2 = Math.sin((u + v) * 4.0 - t * 0.6);
        const k = (s1 + s2) * 0.25 + 0.5;
        const i = (y * gw + x) * 4;
        if (o.warm) { a[i] = 235; a[i + 1] = 60 + k * 150; a[i + 2] = 20 + k * 40; }
        else        { a[i] = 30 + k * 205; a[i + 1] = 30 + (1 - k) * 60; a[i + 2] = 60 + (1 - k) * 170; }
        a[i + 3] = 255;
      }
    }
    sctx.putImageData(img, 0, 0);

    if (o.words && o.words.length) {
      const word = o.words[Math.floor(t / 3.2) % o.words.length];
      let size = gh * 0.52;
      sctx.font = `800 ${size}px Archivo, Arial, sans-serif`;
      const wdt = sctx.measureText(word).width;
      if (wdt > gw * 0.9) { size *= gw * 0.9 / wdt; sctx.font = `800 ${size}px Archivo, Arial, sans-serif`; }
      sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
      sctx.fillStyle = 'rgba(0,0,0,.55)';
      sctx.fillRect(0, 0, gw, gh);
      sctx.fillStyle = '#fff';
      sctx.fillText(word, gw / 2, gh / 2 + size * 0.04);
    }
  }

  function draw() {
    paintSource();
    const data = sctx.getImageData(0, 0, gw, gh).data;
    const W = canvas.width, H = canvas.height;
    const cell = W / gw, led = Math.max(1, cell * 0.74), off = (cell - led) / 2;
    ctx.fillStyle = '#060708';
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const i = (y * gw + x) * 4;
        ctx.fillStyle = `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
        ctx.fillRect(x * cell + off, y * cell + off, led, led);
      }
    }
    // Cabinet-Fugen
    ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.lineWidth = Math.max(1, cell * 0.16);
    ctx.beginPath();
    for (let c = 1; c < o.cols; c++) { const x = c * o.d * cell; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let r = 1; r < o.rows; r++) { const y = r * o.d * cell; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  function update(next) {
    o = Object.assign({ cols: 8, rows: 4, dots: 16, warm: false, words: null }, o, next);
    layout();
    draw();
  }

  update(opts);
  if (!still) {
    timer = setInterval(() => { t += 0.09; if (canvas.isConnected) draw(); else clearInterval(timer); }, 80);
  }
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => update({}), 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw());
  return { update };
}

// Sichtbare Punkte je Cabinet für einen Pitch (verkleinert, Verhältnis bleibt erhalten)
function dotsForPx(pxPerCab) { return Math.round(pxPerCab / 8); }
