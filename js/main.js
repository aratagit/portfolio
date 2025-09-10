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

// Slider controls (support multiple blocks with class .apps)
document.querySelectorAll('.apps').forEach((block) => {
  const track = block.querySelector('.track');
  const prev = block.querySelector('.prev');
  const next = block.querySelector('.next');
  const slides = Array.from(block.querySelectorAll('.slide'));
  if (!track || slides.length === 0) return;

  let index = 0;
  function clamp2(n, min, max) { return Math.min(Math.max(n, min), max); }
  function go(i) {
    index = clamp2(i, 0, slides.length - 1);
    slides[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));

  // Update index based on visibility inside this track
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const i = slides.indexOf(e.target);
        if (i >= 0) index = i;
      }
    });
  }, { root: track, threshold: 0.6 });
  slides.forEach((s) => io.observe(s));

  // Keyboard support when track focused
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
  });
});

// Media optimization: lighter video behavior on mobile/desktop
(() => {
  const videos = Array.from(document.querySelectorAll('video'));
  if (videos.length === 0) return;

  // Prefer metadata-only preload to avoid heavy network on load
  videos.forEach((v) => {
    try { v.preload = 'metadata'; } catch {}
  });

  // Pause videos when not visible to save battery/CPU
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const vid = e.target;
      if (!e.isIntersecting && !vid.paused) {
        vid.pause();
      }
    });
  }, { threshold: 0.2 });
  videos.forEach((v) => io.observe(v));
})();

// Generate poster thumbnails so mobile shows a preview frame
(() => {
  const vids = Array.from(document.querySelectorAll('video'));
  if (vids.length === 0) return;

  function generatePoster(video) {
    if (!video || video.getAttribute('poster')) return Promise.resolve(false);
    return new Promise((resolve) => {
      const temp = document.createElement('video');
      temp.src = video.currentSrc || video.src;
      temp.muted = true;
      temp.playsInline = true;
      temp.preload = 'auto';

      let done = false;
      const cleanup = (ok) => {
        if (done) return; done = true;
        try { temp.pause(); temp.removeAttribute('src'); temp.load(); } catch {}
        temp.remove();
        resolve(!!ok);
      };

      temp.addEventListener('error', () => cleanup(false));
      temp.addEventListener('loadedmetadata', () => {
        try {
          // Seek a tiny bit in; some encoders have black frame at t=0
          const t = Math.min(0.12, (temp.duration || 3) * 0.02);
          const onSeek = () => {
            try {
              const w = temp.videoWidth || 640;
              const h = temp.videoHeight || 360;
              const c = document.createElement('canvas');
              c.width = w; c.height = h;
              const ctx = c.getContext('2d');
              ctx.drawImage(temp, 0, 0, w, h);
              const data = c.toDataURL('image/jpeg', 0.72);
              if (data && data.length > 32) video.setAttribute('poster', data);
              cleanup(true);
            } catch {
              cleanup(false);
            }
          };
          temp.addEventListener('seeked', onSeek, { once: true });
          try { temp.currentTime = t; } catch { onSeek(); }
        } catch {
          cleanup(false);
        }
      }, { once: true });

      // Attach to DOM to improve iOS loading behavior (hidden)
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      temp.style.pointerEvents = 'none';
      temp.style.width = '1px';
      temp.style.height = '1px';
      document.body.appendChild(temp);
      try { temp.load(); } catch {}
    });
  }

  // Pre-generate for on-screen videos; lazy for others
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        generatePoster(e.target).finally(() => io.unobserve(e.target));
      }
    });
  }, { threshold: 0.01, rootMargin: '300px' });

  vids.forEach((v, i) => {
    if (i < 4) {
      // Eager for the first few (hero and top sections)
      generatePoster(v);
    } else {
      io.observe(v);
    }
  });
})();
