// CLAUDE: Wizard navigation — progress bar, step visibility, next/back.
//
// DOM refs cached here: stepsEls, progressRow, navRow, backBtn, nextBtn
//
// Key functions:
//   rebuildProgress()   — recreates the progress bar segments for current step count
//   updateProgress()    — fills segments up to currentIndex
//   showStepByKey(key)  — jump to a specific step by its string key
//   showCurrent()       — main render loop: shows the right step, updates progress + button state
//   goNext()            — advance (or show result when on last step)
//   goBack()            — go back one step
//
// Depends on: state.js (state, currentIndex, visibleSteps)
// Calls:      updateNextEnabled() from validation.js
//             computeOffer()      from offer.js  (only when reaching the result screen)

const stepsEls   = document.querySelectorAll('.step');
const progressRow = document.getElementById('progressRow');
const navRow      = document.getElementById('navRow');
const backBtn     = document.getElementById('backBtn');
const nextBtn     = document.getElementById('nextBtn');

function rebuildProgress() {
  const steps = visibleSteps();
  progressRow.innerHTML = '';
  steps.forEach(() => {
    const seg = document.createElement('div');
    seg.className = 'progress-seg';
    seg.innerHTML = '<div class="fill"></div>';
    progressRow.appendChild(seg);
  });
}

function updateProgress() {
  progressRow.querySelectorAll('.progress-seg .fill').forEach((f, i) => {
    f.style.width = (i <= currentIndex) ? '100%' : '0%';
  });
}

function showStepByKey(key) {
  const steps = visibleSteps();
  const idx = steps.indexOf(key);
  currentIndex = idx >= 0 ? idx : 0;
  showCurrent();
}

function showCurrent() {
  const steps = visibleSteps();
  const key   = steps[currentIndex];

  stepsEls.forEach(s => s.classList.toggle('active', s.dataset.step === key));

  // Past the last real step → show result screen
  if (key === undefined) {
    stepsEls.forEach(s => s.classList.toggle('active', s.dataset.step === 'result'));
    progressRow.style.display = 'none';
    navRow.style.display      = 'none';
    computeOffer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  progressRow.style.display = 'flex';
  navRow.style.display      = 'flex';
  rebuildProgress();
  updateProgress();

  backBtn.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = (currentIndex === steps.length - 1) ? 'Angebot berechnen' : 'Weiter';

  document.querySelectorAll('.step.active .step-eyebrow').forEach(el => {
    el.textContent = `Schritt ${currentIndex + 1} / ${steps.length}`;
  });

  updateNextEnabled();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goNext() {
  if (nextBtn.disabled) return;
  const steps = visibleSteps();
  if (currentIndex < steps.length - 1) {
    currentIndex++;
  } else {
    currentIndex = steps.length; // beyond end → triggers result screen
  }
  showCurrent();
}

function goBack() {
  if (currentIndex > 0) {
    currentIndex--;
    showCurrent();
  }
}
