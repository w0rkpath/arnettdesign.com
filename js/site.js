(() => {
  const d = document, root = d.documentElement;
  const q = (s, el = d) => Array.from(el.querySelectorAll(s));
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const EASE = 'cubic-bezier(.22,1,.36,1)';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const M = () => !reduced.matches;
  const escH = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let fontsReady = false, heroDone = false, raf = 0;

  q('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* email: copy instead of opening a mail app */
  const toast = d.querySelector('.toast'); let toastT;
  d.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="mailto:"]');
    if (!a) return;
    e.preventDefault();
    const email = a.getAttribute('href').slice(7).split('?')[0];
    const done = () => { toast.textContent = 'Email copied — ' + email; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 2200); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(email).then(done, () => { location.href = 'mailto:' + email; });
    else location.href = 'mailto:' + email;
  }, true);

  /* menu */
  const menu = d.getElementById('menu'), openBtn = d.querySelector('[data-menu-open]');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    menu.inert = !open;
    if (open) {
      if (M()) {
        const links = q('[data-menu-link]', menu);
        links.forEach((a) => { a.style.transition = 'none'; a.style.transform = 'translateY(105%)'; a.style.clipPath = 'inset(0 0 100% 0)'; });
        void menu.offsetHeight;
        links.forEach((a, i) => { const dl = 160 + i * 60; a.style.transition = 'clip-path 900ms ' + EASE + ' ' + dl + 'ms, transform 900ms ' + EASE + ' ' + dl + 'ms, color var(--duration-fast) var(--ease-out)'; a.style.transform = 'none'; a.style.clipPath = 'inset(-20% -5% -25% -5%)'; });
      }
      setTimeout(() => menu.querySelector('[aria-label="Close menu"]').focus(), 50);
    } else openBtn.focus({ preventScroll: true });
  };
  menu.inert = true;
  openBtn.addEventListener('click', () => setMenu(true));
  q('[data-menu-close]', menu).forEach((el) => el.addEventListener('click', () => setMenu(false)));
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });

  /* gallery */
  const gal = d.querySelector('[data-gallery]');
  if (gal) {
    const imgs = q('.gallery-well img', gal), dots = q('.gallery-dots button', gal), pause = gal.querySelector('[data-pause]');
    let active = 0, paused = false, timer;
    const show = (i) => { active = i; imgs.forEach((im, k) => im.classList.toggle('is-active', k === i)); dots.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i))); };
    const start = () => { clearInterval(timer); if (!paused && M()) timer = setInterval(() => show((active + 1) % imgs.length), 6500); };
    dots.forEach((b, i) => b.addEventListener('click', () => { show(i); start(); }));
    pause.addEventListener('click', () => { paused = !paused; pause.textContent = paused ? 'Play' : 'Pause'; start(); });
    start();
  }

  /* hero: split into measured lines, then play the load sequence */
  const hero = d.querySelector('[data-hero-split]');
  const heroWords = [];
  hero.childNodes.forEach((n) => { const blade = n.nodeType === 1; (n.textContent || '').trim().split(/\s+/).filter(Boolean).forEach((w) => heroWords.push({ w, blade })); });
  const heroSplit = () => {
    const key = hero.clientWidth + '|' + getComputedStyle(hero).fontSize;
    if (hero._key === key) return; hero._key = key;
    const A = heroWords.filter((x) => !x.blade), B = heroWords.filter((x) => x.blade);
    const blk = (ws, c) => '<span style="display:block;text-wrap:balance"' + (c ? ' class="blade"' : '') + '>' + ws.map((x) => '<span data-w>' + escH(x.w) + '</span>').join(' ') + '</span>';
    hero.innerHTML = blk(A, 0) + blk(B, 1);
    const order = A.concat(B), lines = []; let top = null;
    q('[data-w]', hero).forEach((w, i) => { const t = w.offsetTop; if (top === null || Math.abs(t - top) > 4 || order[i].blade !== lines[lines.length - 1][0].blade) { lines.push([]); top = t; } lines[lines.length - 1].push(order[i]); });
    const first = !heroDone && M();
    hero.innerHTML = lines.map((l, i) => {
      const h = l.map((x) => escH(x.w)).join(' ');
      const dl = 250 + i * 80 + (l[0].blade ? 300 : 0);
      return '<span style="display:block;overflow:hidden;padding-bottom:.08em;margin-bottom:-.08em"><span data-hl' + (l[0].blade ? ' class="blade"' : '') + ' style="display:block;white-space:nowrap;' + (first ? 'transform:translateY(105%);transition:transform 1100ms ' + EASE + ' ' + dl + 'ms' : '') + '">' + h + '</span></span>';
    }).join('');
    hero.style.opacity = '1';
    if (!heroDone) {
      heroDone = true;
      const cover = d.querySelector('.cover');
      if (cover) { cover.style.opacity = '0'; setTimeout(() => cover.remove(), 450); }
      void hero.offsetHeight;
      requestAnimationFrame(() => {
        q('[data-hl]', hero).forEach((x) => (x.style.transform = 'none'));
        q('[data-hero]').forEach((x) => { x.style.opacity = '1'; x.style.transform = 'none'; });
      });
    }
  };

  /* headings: split into lines that rise with scroll */
  const splitHeadings = () => q('main h2.ad-heading:not([data-weight]), main h3.ad-heading, #contact h2').forEach((el) => {
    const key = el.clientWidth + '|' + getComputedStyle(el).fontSize;
    if (el._key === key) return; el._key = key;
    if (el._t == null) { const g = ['']; el.childNodes.forEach((c) => { if (c.nodeName === 'BR') g.push(''); else g[g.length - 1] += ' ' + c.textContent; }); el._g = g.map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean); el._t = el._g.join(' '); }
    el.style.textWrap = 'wrap';
    el.innerHTML = el._g.map((g) => '<span style="display:block">' + g.split(' ').map((w) => '<span data-w style="display:inline-block">' + escH(w) + '</span>').join(' ') + '</span>').join('');
    const lines = []; let top = null;
    q('[data-w]', el).forEach((w) => { const t = w.offsetTop; if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; } lines[lines.length - 1].push(w.textContent); });
    el.style.textWrap = '';
    el.innerHTML = lines.map((l) => '<span style="display:block;overflow:hidden;padding-bottom:.12em;margin-bottom:-.12em"><span data-ln style="display:block;white-space:nowrap">' + escH(l.join(' ')) + '</span></span>').join('');
    el.setAttribute('data-scrub', '');
    el.setAttribute('aria-label', el._t);
  });

  /* icons */
  const playIcon = (svg, delay) => {
    const P = (n) => svg.querySelector('[data-p="' + n + '"]');
    const at = (el, kf, dur, dl, easing) => el && el.animate(kf, { duration: dur, delay: delay + dl, easing: easing || EASE, fill: 'backwards' });
    const draw = (el, dur, dl) => at(el, [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], dur, dl);
    const fade = (el, dur, dl) => at(el, [{ opacity: 0 }, { opacity: 1 }], dur, dl);
    q('[data-p]', svg).forEach((el) => { el.style.transformBox = 'view-box'; el.style.transformOrigin = '32px 32px'; });
    svg.style.opacity = '1';
    const t = svg.dataset.icon;
    if (t === 'compass') {
      draw(P('ring'), 800, 0); fade(P('ticks'), 400, 500);
      at(P('needle'), [{ transform: 'rotate(-220deg)', opacity: 0 }, { transform: 'rotate(40deg)', opacity: 1, offset: .45 }, { transform: 'rotate(-24deg)', offset: .65 }, { transform: 'rotate(12deg)', offset: .82 }, { transform: 'rotate(0deg)' }], 2000, 300, 'ease-in-out');
    } else if (t === 'frame') {
      draw(P('box'), 800, 0); draw(P('head'), 450, 550); draw(P('col'), 450, 800);
      at(P('col'), [{ transform: 'translateX(0)' }, { transform: 'translateX(18px)', offset: .35 }, { transform: 'translateX(-6px)', offset: .7 }, { transform: 'translateX(0)' }], 1500, 1250, 'ease-in-out');
    } else if (t === 'cycle') {
      draw(P('arc'), 900, 0); fade(P('head'), 300, 750);
      at(P('spin'), [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], 1400, 1050, 'cubic-bezier(.65,0,.35,1)');
    } else if (t === 'scope') {
      draw(P('v'), 600, 0); draw(P('h'), 600, 120);
      at(P('ring'), [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.5)', opacity: 1, offset: .35 }, { transform: 'scale(.78)', offset: .65 }, { transform: 'scale(1.08)', offset: .85 }, { transform: 'scale(1)' }], 1700, 350, 'ease-in-out');
    } else if (t === 'sliders') {
      draw(P('lines'), 700, 0);
      [['k1', 26, -6], ['k2', -22, 8], ['k3', 18, -12]].forEach(([k, a, b], i) => {
        const el = P(k); el.style.transformOrigin = 'center'; el.style.transformBox = 'fill-box';
        at(el, [{ transform: 'translateX(0) scale(0)' }, { transform: 'translateX(0) scale(1)', offset: .15 }, { transform: 'translateX(' + a + 'px) scale(1)', offset: .5 }, { transform: 'translateX(' + b + 'px) scale(1)', offset: .78 }, { transform: 'translateX(0) scale(1)' }], 1800, 450 + i * 90, 'ease-in-out');
      });
    } else if (t === 'check') {
      draw(P('box'), 900, 0); draw(P('tick'), 500, 800);
      at(P('tick'), [{ transform: 'scale(1)' }, { transform: 'scale(1.12)', offset: .5 }, { transform: 'scale(1)' }], 500, 1350);
    }
  };
  if (M() && 'IntersectionObserver' in window && Element.prototype.animate) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const row = q('svg[data-icon]', e.target.closest('dl'));
      playIcon(e.target, 200 + Math.max(0, row.indexOf(e.target)) * 220);
    }), { rootMargin: '0px 0px -20% 0px' });
    q('svg[data-icon]').forEach((s) => io.observe(s));
  } else q('svg[data-icon]').forEach((s) => (s.style.opacity = '1'));

  /* scroll-linked motion */
  q('main .ad-col-label:not([data-hero]), main .ad-case-p, main section .ad-col-content > p.ad-body:not([data-hero])').forEach((el) => el.setAttribute('data-fade', ''));
  const ph = d.querySelector('#profile h2'); if (ph) ph.setAttribute('data-weight', '');
  const out = d.querySelector('[data-hero-out]'), meta = d.querySelector('[data-hero-meta]'), contact = d.getElementById('contact');

  const tick = () => {
    raf = 0;
    const vh = innerHeight, m = M();
    let moving = false;
    if (fontsReady) { heroSplit(); splitHeadings(); }
    q('[data-reveal]').forEach((el) => {
      const img = el.firstElementChild;
      if (el._done) return;
      let t = 1;
      if (m) { t = clamp((vh - el.getBoundingClientRect().top) / (vh * 0.6)); t = t * t * (3 - 2 * t); }
      el._peak = Math.max(el._peak || 0, t); if (el._peak >= 0.6) el._peak = 1; t = el._peak;
      const cur = el._k == null ? t : el._k + (t - el._k) * 0.18;
      el._k = Math.abs(t - cur) < 0.001 ? t : cur;
      if (el._k !== t) moving = true;
      const k = el._k, ins = ((1 - k) * 46).toFixed(2);
      if (k >= 0.999) { el._done = true; el.style.clipPath = 'none'; img.style.transform = 'none'; img.style.filter = 'none'; return; }
      el.style.clipPath = 'inset(' + ins + '% 0 ' + ins + '% 0)';
      img.style.transform = 'scale(' + (1 + (1 - k) * 0.14).toFixed(4) + ')';
      img.style.filter = 'grayscale(' + (1 - k).toFixed(2) + ')';
    });
    const y = Math.max(0, scrollY);
    out.style.transform = m ? 'translateY(' + (-y * 0.22).toFixed(1) + 'px)' : '';
    meta.style.opacity = m ? clamp(1 - y / (vh * 0.4)).toFixed(3) : '';
    q('[data-scrub]').forEach((el) => {
      const p = m ? clamp((vh * 0.95 - el.getBoundingClientRect().top) / (vh * 0.4)) : 1;
      const ls = q('[data-ln]', el);
      ls.forEach((s, i) => { const pi = clamp(p * (1 + 0.3 * (ls.length - 1)) - i * 0.3); s.style.transform = pi >= 1 ? '' : 'translateY(' + ((1 - ease(pi)) * 105).toFixed(2) + '%)'; });
    });
    q('[data-rule]').forEach((el) => { const p = m ? clamp((vh * 0.92 - el.getBoundingClientRect().top) / (vh * 0.35) - (+el.dataset.i || 0) * 0.18) : 1; el.style.transform = p >= 1 ? '' : 'scaleX(' + ease(p).toFixed(4) + ')'; });
    q('[data-fade]').forEach((el) => { const p = m ? clamp((vh * 0.9 - el.getBoundingClientRect().top) / (vh * 0.3)) : 1; el.style.opacity = p >= 1 ? '' : ease(p).toFixed(3); el.style.transform = p >= 1 ? '' : 'translateY(' + ((1 - ease(p)) * 16).toFixed(1) + 'px)'; });
    q('[data-weight]').forEach((el) => { const p = m ? ease(clamp((vh * 0.95 - el.getBoundingClientRect().top) / (vh * 0.55))) : 1; el.style.fontWeight = p >= 1 ? '' : String(Math.round(100 + 300 * p)); el.style.letterSpacing = p >= 1 ? '' : (-0.015 - 0.015 * p).toFixed(4) + 'em'; });
    root.classList.toggle('ad-on-signal', contact.getBoundingClientRect().top <= 96);
    if (moving) kick();
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const ready = () => { if (fontsReady) return; fontsReady = true; kick(); };
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => setTimeout(ready, 30)); else ready();
  setTimeout(ready, 2500);
  if ('ResizeObserver' in window) new ResizeObserver(kick).observe(d.querySelector('main'));
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  reduced.addEventListener && reduced.addEventListener('change', kick);
  kick();
})();
