document.addEventListener('DOMContentLoaded', () => {
  /* ---- Nav toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Constellation canvas ---- */
  const canvas = document.querySelector('.hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, points;
  const GLOW = 'rgba(63, 226, 143,';
  const LINE_DIST = 150;

  function sizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width * devicePixelRatio;
    h = canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function initPoints() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const count = Math.max(24, Math.min(70, Math.round((rect.width * rect.height) / 22000)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.6,
    }));
  }

  function drawFrame() {
    const rect = canvas.parentElement.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (!reduceMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > rect.width) p.vx *= -1;
        if (p.y < 0 || p.y > rect.height) p.vy *= -1;
      }
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINE_DIST) {
          ctx.strokeStyle = GLOW + (0.16 * (1 - dist / LINE_DIST)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    for (const p of points) {
      ctx.fillStyle = GLOW + '0.75)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    drawFrame();
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  sizeCanvas();
  initPoints();
  loop();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      sizeCanvas();
      initPoints();
      if (reduceMotion) drawFrame();
    }, 150);
  });
});
