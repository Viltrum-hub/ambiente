'use strict';
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');
function closeMenu() {
  menu.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('header')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
const boxes = [...document.querySelectorAll('#plan-options input')];
if (boxes.length) {
  const key = 'ecohorizonte-plan-v1';
  let canSave = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) boxes.forEach(box => { box.checked = saved.includes(box.value); });
  } catch { canSave = false; }
  const status = document.querySelector('#plan-status');
  const note = document.querySelector('#storage-note');
  function update(save = true) {
    const selected = boxes.filter(box => box.checked);
    status.textContent = `${selected.length} de ${boxes.length} acciones seleccionadas.`;
    if (save && canSave) {
      try { localStorage.setItem(key, JSON.stringify(selected.map(box => box.value))); }
      catch { canSave = false; }
    }
    if (!canSave) note.textContent = 'El almacenamiento no está disponible. Puedes descargar tu plan para conservarlo.';
  }
  boxes.forEach(box => box.addEventListener('change', () => update()));
  document.querySelector('#reset-plan').addEventListener('click', () => {
    boxes.forEach(box => { box.checked = false; });
    update();
  });
  document.querySelector('#download-plan').addEventListener('click', () => {
    const selected = boxes.filter(box => box.checked);
    if (!selected.length) {
      status.textContent = 'Selecciona al menos una acción para descargar tu plan.';
      boxes[0].focus();
      return;
    }
    const date = new Date().toLocaleDateString('es-SV');
    const content = `MI PLAN AMBIENTAL · ECOHORIZONTE\nFecha: ${date}\n\n${selected.map(box => '[ ] ' + box.nextElementSibling.textContent).join('\n')}\n\nProblema identificado: __________________\nFecha de revisión: __________________\nResultados y aprendizajes: __________________\n\nRegistro educativo personal; no equivale a una medición de impacto ambiental.\n`;
    const url = URL.createObjectURL(new Blob(['\uFEFF' + content], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mi-plan-ambiental.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Tu plan está listo. Revisa las descargas del navegador.';
  });
  update(false);
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const landscape = document.querySelector('.hero');
if (landscape) {
  const slides = [...landscape.querySelectorAll('.hero-slides img')];
  const names = ['Bosque', 'Agua', 'Hojas'];
  const label = landscape.querySelector('.landscape-label');
  const pause = landscape.querySelector('.landscape-pause');
  let current = 0;
  let paused = reducedMotion.matches;
  let timer;
  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    label.textContent = `0${current + 1} / 03 · ${names[current]}`;
  }
  function schedule() {
    clearInterval(timer);
    if (!paused && !document.hidden) timer = setInterval(() => showSlide(current + 1), 6500);
    pause.textContent = paused ? 'Reanudar' : 'Pausar';
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? 'Reanudar cambio de paisajes' : 'Pausar cambio de paisajes');
  }
  landscape.querySelector('.landscape-prev').addEventListener('click', () => { showSlide(current - 1); schedule(); });
  landscape.querySelector('.landscape-next').addEventListener('click', () => { showSlide(current + 1); schedule(); });
  pause.addEventListener('click', () => { paused = !paused; schedule(); });
  landscape.addEventListener('focusin', () => { paused = true; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; schedule(); });
  showSlide(0);
  schedule();
}
function addDepth(surface, tilt = false) {
  surface.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    const rect = surface.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    surface.style.setProperty('--image-x', `${x * 15}px`);
    surface.style.setProperty('--image-y', `${y * 12}px`);
    if (tilt) {
      surface.style.setProperty('--tilt-x', `${-y * 5}deg`);
      surface.style.setProperty('--tilt-y', `${x * 5}deg`);
    }
  });
  surface.addEventListener('pointerleave', () => {
    ['--image-x', '--image-y', '--tilt-x', '--tilt-y'].forEach(key => surface.style.removeProperty(key));
  });
}
document.querySelectorAll('.hero, .page-hero').forEach(surface => addDepth(surface));
document.querySelectorAll('.photo-card').forEach(surface => addDepth(surface, true));
