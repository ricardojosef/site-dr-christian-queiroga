/* =========================================================
   Dr. Christian Queiroga — interações e animações (GSAP)
   ========================================================= */

// Troque pelo WhatsApp do consultório: DDI + DDD + número, apenas dígitos
const WHATSAPP_NUMBER = '5500000000000';

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  initBasics();

  // Sem GSAP (CDN fora do ar): mostra o site sem animações
  if (!window.gsap || !window.ScrollTrigger) {
    $('#preloader')?.remove();
    body.classList.remove('is-loading');
    return;
  }

  document.documentElement.classList.add('js');
  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  /* ---------------- Smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else if (window.ScrollToPlugin) gsap.to(window, { scrollTo: target, duration: 1, ease: 'power3.inOut' });
    else (typeof target === 'number' ? window.scrollTo(0, target) : target.scrollIntoView({ behavior: 'smooth' }));
  }

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      $('#header').classList.remove('menu-open');
      $('#navBurger').setAttribute('aria-expanded', 'false');
      scrollToTarget(id === '#inicio' ? 0 : el);
    });
  });

  /* ---------------- Estados iniciais da hero ---------------- */
  const heroWords = $$('.hero__title .word');
  gsap.set(heroWords, { yPercent: 115 });
  gsap.set(['.hero__logo', '.hero__subtitle', '.hero__actions > *', '.hero__copy .guide'], { autoAlpha: 0, y: 30 });
  gsap.set('.chip', { autoAlpha: 0, y: 40, scale: 0.95 });
  gsap.set('.hero__bg', { scale: 1.18 });
  gsap.set('.hero__mobile-img', { clipPath: 'inset(0 0 100% 0)' });
  gsap.set('.hero__mobile-img img', { scale: 1.25 });
  gsap.set('.nav', { yPercent: -160 });
  gsap.set('.hero__scroll', { autoAlpha: 0 });

  /* ---------------- Preloader: logo se preenchendo ---------------- */
  runPreloader().then(() => {
    body.classList.remove('is-loading');
    lenis?.start();
    heroIntro();
    ScrollTrigger.refresh();
  });

  function runPreloader() {
    return new Promise((resolve) => {
      const pre = $('#preloader');
      const fill = $('#preloaderFill');
      const count = $('#preloaderCount');
      const minTime = reduceMotion ? 300 : 1800;
      const start = performance.now();

      // Itens a aguardar: imagens não-lazy, background da hero e fontes
      const waits = $$('img')
        .filter((img) => img.loading !== 'lazy' && !img.closest('.preloader'))
        .map((img) => (img.complete ? Promise.resolve() : new Promise((r) => {
          img.addEventListener('load', r, { once: true });
          img.addEventListener('error', r, { once: true });
        })));
      const heroBg = $('.hero__bg');
      const bgUrl = heroBg && getComputedStyle(heroBg).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      if (bgUrl) {
        waits.push(new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = bgUrl[1]; }));
      }
      if (document.fonts?.ready) waits.push(document.fonts.ready);

      let loaded = 0;
      const total = waits.length || 1;
      waits.forEach((p) => p.then(() => loaded++));

      const state = { v: 0 };
      let finished = false;
      const failSafe = setTimeout(() => { loaded = total; }, 7000);

      const tick = () => {
        const byTime = Math.min(1, (performance.now() - start) / minTime) * 100;
        const byLoad = (loaded / total) * 100;
        const target = Math.min(byTime, byLoad);
        state.v += (target - state.v) * 0.12;
        if (target >= 100 && state.v > 99.5) state.v = 100;

        fill.style.clipPath = `inset(${100 - state.v}% 0 0 0)`;
        count.textContent = Math.round(state.v);

        if (state.v >= 100 && !finished) {
          finished = true;
          clearTimeout(failSafe);
          gsap.ticker.remove(tick);
          exit();
        }
      };
      gsap.ticker.add(tick);

      function exit() {
        gsap.timeline({ onComplete: () => { pre.remove(); } })
          .to('.preloader__logo', { scale: 1.08, duration: 0.5, ease: 'power2.out', filter: 'drop-shadow(0 0 40px rgba(142,162,200,.6))' })
          .to('.preloader__meta', { autoAlpha: 0, y: 20, duration: 0.4 }, '<')
          .to('.preloader__logo', { scale: 0.6, autoAlpha: 0, duration: 0.6, ease: 'power3.in' })
          .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=0.25')
          .add(resolve, '-=0.75');
      }
    });
  }

  /* ---------------- Entrada da hero ---------------- */
  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.4 } });
    tl.to('.hero__bg', { scale: 1, duration: 2.4 }, 0)
      .to('.hero__mobile-img', { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'expo.inOut' }, 0)
      .to('.hero__mobile-img img', { scale: 1, duration: 2 }, 0)
      .to('.nav', { yPercent: 0, duration: 1.2 }, 0.3)
      .to('.hero__logo', { autoAlpha: 1, y: 0 }, 0.25)
      .to(heroWords, { yPercent: 0, stagger: 0.07 }, 0.35)
      .to('.hero__subtitle', { autoAlpha: 1, y: 0 }, 0.8)
      .to('.hero__actions > *', { autoAlpha: 1, y: 0, stagger: 0.1 }, 0.9)
      .to('.hero__copy .guide', { autoAlpha: 1, y: 0 }, 1.1)
      .to('.chip', { autoAlpha: 1, y: 0, scale: 1, stagger: 0.12 }, 0.9)
      .to('.hero__scroll', { autoAlpha: 1 }, 1.3)
      .add(countUp, 1);
  }

  function countUp() {
    $$('[data-count]').forEach((el) => {
      const end = +el.dataset.count;
      const obj = { n: +el.dataset.from || 0 };
      // data-plain: sem separador de milhar (ex.: anos)
      const format = (n) => ('plain' in el.dataset ? String(Math.round(n)) : Math.round(n).toLocaleString('pt-BR'));
      gsap.to(obj, {
        n: end, duration: 2.2, ease: 'power3.out',
        onUpdate: () => { el.textContent = format(obj.n); },
      });
    });
  }

  /* ---------------- Hero: parallax de scroll e mouse ---------------- */
  gsap.to('.hero__bg', {
    yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__inner', {
    yPercent: -12, opacity: 0.2, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true },
  });

  if (finePointer && !reduceMotion) {
    const hero = $('.hero');
    const bgX = gsap.quickTo('.hero__bg', 'x', { duration: 1.2, ease: 'power3' });
    const bgY = gsap.quickTo('.hero__bg', 'y', { duration: 1.2, ease: 'power3' });
    const orbs = $$('.hero__orb').map((o) => [gsap.quickTo(o, 'x', { duration: 2 }), gsap.quickTo(o, 'y', { duration: 2 })]);
    const chips = $$('.chip').map((c) => [+c.dataset.depth || 1, gsap.quickTo(c, 'x', { duration: 1 }), gsap.quickTo(c, 'y', { duration: 1 })]);
    hero.addEventListener('mousemove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      bgX(nx * -24); bgY(ny * -16);
      orbs.forEach(([x, y], i) => { x(nx * (80 + i * 40)); y(ny * (60 + i * 30)); });
      chips.forEach(([d, x, y]) => { x(nx * 30 * d); y(ny * 24 * d); });
    });
    hero.addEventListener('mouseleave', () => {
      bgX(0); bgY(0);
      orbs.forEach(([x, y]) => { x(0); y(0); });
      chips.forEach(([, x, y]) => { x(0); y(0); });
    });
  }

  /* ---------------- Header: esconde ao descer, mostra ao subir ---------------- */
  const header = $('#header');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      header.classList.toggle('is-scrolled', y > 40);
      if (header.classList.contains('menu-open')) return;
      header.classList.toggle('is-hidden', self.direction === 1 && y > 400);
    },
  });

  // Link ativo no menu
  $$('#navLinks a').forEach((link) => {
    const section = $(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });

  /* ---------------- Títulos: revelação palavra a palavra ---------------- */
  $$('.section__title').forEach((title) => {
    splitWords(title);
    gsap.from($$('.w__in', title), {
      yPercent: 110, rotate: 4, duration: 1.2, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: title, start: 'top 85%' },
    });
  });

  function splitWords(el) {
    const nodes = [...el.childNodes];
    el.innerHTML = '';
    const wrap = (content) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.12em;margin-bottom:-.12em';
      const inner = document.createElement('span');
      inner.className = 'w__in';
      inner.style.display = 'inline-block';
      inner.append(content);
      w.append(inner);
      el.append(w);
    };
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) el.append(document.createTextNode(' '));
          else wrap(document.createTextNode(part));
        });
      } else {
        wrap(node);
      }
    });
  }

  /* ---------------- Revelação dos blocos ---------------- */
  gsap.set('[data-reveal]', { y: 50 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, overwrite: true }),
  });

  $$('.section > .container > .guide, .faq .guide, .booking .guide').forEach((g) => {
    gsap.from(g, { autoAlpha: 0, y: 20, duration: 0.8, scrollTrigger: { trigger: g, start: 'top 90%' } });
  });

  /* ---------------- Quem sou eu: scroll horizontal ---------------- */
  gsap.from('.about__portrait', {
    scale: 0.88, autoAlpha: 0, rotate: -3, duration: 1.4, ease: 'expo.out',
    scrollTrigger: { trigger: '#sobre', start: 'top 70%' },
  });
  gsap.from('.about__text > *:not(.section__title)', {
    y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.08,
    scrollTrigger: { trigger: '#sobre', start: 'top 60%' },
  });

  const mm = gsap.matchMedia();
  // reveal = [início, fim] da revelação de cada marco (posição da borda esquerda do marco na tela)
  const buildHorizontal = (scroller, pinEl, reveal) => {
    const distance = () => Math.max(0, scroller.scrollWidth - window.innerWidth);
    const progressBar = $('#aboutProgress');
    const lineFill = $('.timeline__line span');

    const tween = gsap.to(scroller, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pinEl,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(progressBar, { scaleX: self.progress });
          gsap.set(lineFill, { scaleX: self.progress });
        },
      },
    });

    // Animações de cada marco, sincronizadas com o movimento horizontal
    $$('.milestone').forEach((m) => {
      const img = $('.milestone__img', m);
      const st = { containerAnimation: tween, trigger: m, start: `left ${reveal[0]}%`, end: `left ${reveal[1]}%`, scrub: true };
      gsap.fromTo(img, { clipPath: 'inset(0 100% 0 0 round 20px)' }, { clipPath: 'inset(0 0% 0 0 round 20px)', ease: 'none', scrollTrigger: st });
      gsap.fromTo($('img', img), { xPercent: -14 }, {
        xPercent: 0, ease: 'none',
        scrollTrigger: { containerAnimation: tween, trigger: m, start: 'left right', end: 'right left', scrub: true },
      });
      gsap.from($('.milestone__year', m), { xPercent: 40, autoAlpha: 0, ease: 'none', scrollTrigger: st });
      gsap.from($$('.milestone__body > *', m), { y: 40, autoAlpha: 0, stagger: 0.1, ease: 'none', scrollTrigger: { ...st, start: `left ${reveal[0] - 10}%`, end: `left ${reveal[1] - 5}%` } });
    });

    gsap.from('.timeline__end > *', {
      y: 40, autoAlpha: 0, stagger: 0.1, ease: 'none',
      scrollTrigger: { containerAnimation: tween, trigger: '.timeline__end', start: `left ${reveal[0] + 5}%`, end: `left ${reveal[1] + 10}%`, scrub: true },
    });

    return () => gsap.set(scroller, { clearProps: 'transform' });
  };

  mm.add('(min-width: 901px)', () => buildHorizontal($('#aboutTrack'), $('.about__pin'), [90, 45]));
  mm.add('(max-width: 900px)', () => buildHorizontal($('#timeline'), $('#timelineViewport'), [100, 25]));

  /* ---------------- Quadros atendidos: imagem seguindo o mouse ---------------- */
  if (finePointer) {
    const list = $('#tlist');
    const preview = $('#tpreview');
    const pImg = $('img', preview);
    $$('.tlist__item').forEach((it) => { const i = new Image(); i.src = it.dataset.img; });

    gsap.set(preview, { xPercent: -50, yPercent: -50 });
    const px = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3' });
    const py = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3' });
    const pr = gsap.quickTo(preview, 'rotation', { duration: 0.8, ease: 'power3' });
    let lastX = 0;

    list.addEventListener('mousemove', (e) => {
      px(e.clientX + 160); py(e.clientY);
      pr(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    });
    $$('.tlist__item').forEach((item) => {
      item.addEventListener('mouseenter', () => {
        if (pImg.getAttribute('src') !== item.dataset.img) {
          pImg.src = item.dataset.img;
          gsap.fromTo(pImg, { scale: 1.2 }, { scale: 1, duration: 0.8, ease: 'expo.out' });
        }
        gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out' });
      });
    });
    list.addEventListener('mouseleave', () => gsap.to(preview, { autoAlpha: 0, scale: 0.6, duration: 0.4, ease: 'power3.out' }));
  }

  /* ---------------- Depoimentos: marquee infinito ---------------- */
  const marquees = $$('.marquee__row').map((row) => {
    const dir = +row.dataset.dir || 1;
    const originals = [...row.children];
    const gap = parseFloat(getComputedStyle(row).columnGap) || 20;
    const setWidth = row.scrollWidth + gap;
    const copies = Math.ceil(window.innerWidth / setWidth) + 1;
    for (let c = 0; c < copies; c++) {
      originals.forEach((el) => {
        const clone = el.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        row.append(clone);
      });
    }
    const tween = gsap.fromTo(row,
      { x: dir === 1 ? 0 : -setWidth },
      { x: dir === 1 ? -setWidth : 0, duration: setWidth / 45, ease: 'none', repeat: -1 });
    row.addEventListener('mouseenter', () => gsap.to(tween, { timeScale: 0.15, duration: 0.6 }));
    row.addEventListener('mouseleave', () => gsap.to(tween, { timeScale: 1, duration: 0.6 }));
    return tween;
  });
  // Acelera o marquee conforme a velocidade do scroll
  ScrollTrigger.create({
    trigger: '.testimonials', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => {
      const boost = 1 + Math.min(4, Math.abs(self.getVelocity()) / 500);
      marquees.forEach((t) => gsap.to(t, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => gsap.to(t, { timeScale: 1, duration: 0.8 }) }));
    },
  });

  /* ---------------- FAQ: acordeão animado ---------------- */
  const accs = $$('.acc');
  accs.forEach((d) => {
    const summary = $('summary', d);
    const content = $('.acc__body', d);
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) close(d);
      else {
        accs.filter((o) => o !== d && o.open).forEach(close);
        d.open = true;
        gsap.fromTo(content, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.6, ease: 'expo.out' });
      }
    });
  });
  function close(d) {
    gsap.to($('.acc__body', d), { height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { d.open = false; gsap.set($('.acc__body', d), { clearProps: 'all' }); } });
  }

  /* ---------------- Interações de mouse ---------------- */
  if (finePointer && !reduceMotion) {
    // Cursor personalizado
    const cursor = $('.cursor');
    const dx = gsap.quickTo('.cursor__dot', 'x', { duration: 0.1 });
    const dy = gsap.quickTo('.cursor__dot', 'y', { duration: 0.1 });
    const rx = gsap.quickTo('.cursor__ring', 'x', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo('.cursor__ring', 'y', { duration: 0.5, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));
    $$('a, button, summary, .tlist__item, .pill, input, select, .tcard').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });

    // Botões magnéticos
    $$('.magnetic').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)' });
      });
    });

    // Cards com inclinação 3D + luz seguindo o mouse
    $$('.tilt').forEach((card) => {
      const rX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
      const rY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        rY((x - 0.5) * 10);
        rX((0.5 - y) * 10);
      });
      card.addEventListener('mouseleave', () => { rX(0); rY(0); });
    });
  }

  // Recalcula posições quando fontes/imagens terminam de carregar
  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* =========================================================
     Funções que não dependem do GSAP
     ========================================================= */
  function initBasics() {
    // Ano no rodapé
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    // Mostrar/ocultar orientações
    const toggle = $('#guideToggle');
    const applyGuides = (on) => {
      body.classList.toggle('show-guides', on);
      toggle.setAttribute('aria-pressed', String(on));
      $('strong', toggle).textContent = on ? 'ON' : 'OFF';
    };
    let saved = null;
    try { saved = localStorage.getItem('cq-guides'); } catch (e) { /* sem storage */ }
    applyGuides(saved !== 'off');
    toggle.addEventListener('click', () => {
      const on = !body.classList.contains('show-guides');
      applyGuides(on);
      try { localStorage.setItem('cq-guides', on ? 'on' : 'off'); } catch (e) { /* sem storage */ }
      window.ScrollTrigger?.refresh();
    });

    // Menu mobile
    const burger = $('#navBurger');
    burger.addEventListener('click', () => {
      const open = $('#header').classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', String(open));
    });

    // Máscara de telefone
    const phone = $('#fPhone');
    phone.addEventListener('input', () => {
      const d = phone.value.replace(/\D/g, '').slice(0, 11);
      let out = d;
      if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
      phone.value = out;
    });

    // Formulário -> WhatsApp
    const form = $('#bookingForm');
    const msg = $('#formMsg');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [
        [$('#fName'), (v) => v.trim().length >= 2],
        [$('#fPhone'), (v) => v.replace(/\D/g, '').length >= 10],
        [$('#fTreat'), (v) => !!v],
      ];
      let ok = true;
      fields.forEach(([el, valid]) => {
        const good = valid(el.value);
        el.closest('.field').classList.toggle('is-invalid', !good);
        if (!good) ok = false;
      });
      if (!ok) {
        msg.textContent = 'Preencha nome, WhatsApp e o tratamento de interesse.';
        return;
      }
      const data = new FormData(form);
      const text = [
        'Olá, Dr. Christian! Gostaria de agendar uma consulta.',
        `Nome: ${data.get('nome')}`,
        `WhatsApp: ${data.get('telefone')}`,
        `Interesse: ${data.get('tratamento')}`,
        `Melhor período: ${data.get('periodo')}`,
      ].join('\n');
      msg.textContent = 'Abrindo o WhatsApp…';
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });
  }
})();
