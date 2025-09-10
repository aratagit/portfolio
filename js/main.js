// Accent color cycle + simple interactions

const accents = [
  '#00e5ff', // cyan
  '#8a2be2', // purple
  '#00ffa3', // neon green
  '#ff2bd1', // magenta
];

const root = document.documentElement;
const toggle = document.getElementById('accent-toggle');

function setAccent(color) {
  root.style.setProperty('--accent', color);
  localStorage.setItem('accent', color);
}

// init accent
const saved = localStorage.getItem('accent');
if (saved) setAccent(saved);

toggle?.addEventListener('click', () => {
  const current = getComputedStyle(root).getPropertyValue('--accent').trim();
  const i = Math.max(0, accents.indexOf(current));
  const next = accents[(i + 1) % accents.length];
  setAccent(next);
});

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => e.target.classList.toggle('is-visible', e.isIntersecting));
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Lightweight tilt for cards
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
function attachTilt(el) {
  const b = 12; // degrees bound
  let raf = 0;
  function onMove(e) {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; // 0..1
    const y = (e.clientY - r.top) / r.height; // 0..1
    const rx = clamp((0.5 - y) * b * 2, -b, b);
    const ry = clamp((x - 0.5) * b * 2, -b, b);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  }
  function onLeave() {
    cancelAnimationFrame(raf);
    el.style.transform = '';
  }
  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);
}

document.querySelectorAll('[data-tilt]').forEach(attachTilt);

// Footer year
const y = document.getElementById('y');
if (y) y.textContent = new Date().getFullYear();

