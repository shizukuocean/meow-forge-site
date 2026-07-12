(() => {
  "use strict";

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  let resolveEntryReady;
  window.__mfEntryReady = new Promise((resolve) => { resolveEntryReady = resolve; });
  const entryState = (() => {
    try {
      return { internal: sessionStorage.getItem('mfInternalNav') === '1' };
    } catch (error) {
      return { internal: false };
    }
  })();
  const isHomePage = Boolean(document.querySelector('.hero .origin-core'));
  // During visual acceptance every full reload replays the entry sequence.
  const gatePageIntro = true;

  const header = qs("[data-header]");
  const toast = qs("[data-toast]");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  qsa("[data-placeholder]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.placeholder || "该入口尚未开放"));
  });

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-compact", window.scrollY > 40);
    const probeY = (header.getBoundingClientRect().height || 74) + 2;
    const darkSections = qsa(".dark-section");
    const onDark = darkSections.some((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= probeY && rect.bottom >= probeY;
    });
    header.classList.toggle("is-light", !onDark);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader);

  const cursor = qs(".cursor-spark");
  if (cursor && window.matchMedia("(pointer:fine)").matches && !reduceMotion) {
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    window.addEventListener("pointermove", (event) => {
      tx = event.clientX; ty = event.clientY; cursor.style.opacity = "1";
    }, { passive: true });
    const loop = () => {
      x += (tx - x) * .18; y += (ty - y) * .18;
      cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  let ctx = null;
  if (hasGSAP && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);
    ctx = gsap.context(() => {
    const intro = gsap.timeline({ paused: gatePageIntro, defaults: { ease: "power3.out" } });
    window.__mfHeroIntro = intro;
    intro
      .from(".hero-kicker", { y: 18, autoAlpha: 0, duration: .6 })
      .from(".hero-line", { yPercent: 105, autoAlpha: 0, duration: .9, stagger: .1 }, "-=.2")
      .from(".hero-intro", { y: 26, autoAlpha: 0, duration: .7 }, "-=.45")
      .from(".hero-actions, .current-products", { y: 18, autoAlpha: 0, duration: .55, stagger: .08 }, "-=.35");

    gsap.to(".orbit-ring--outer", { rotation: 360, duration: 32, repeat: -1, ease: "none" });
    gsap.to(".orbit-ring--inner", { rotation: -360, duration: 22, repeat: -1, ease: "none" });
    gsap.to(".orbit-core", { y: -10, duration: 2.4, repeat: -1, yoyo: true, ease: "power1.inOut" });
    gsap.to(".orbit-dot--1", { rotation: 360, transformOrigin: "215px 215px", duration: 12, repeat: -1, ease: "none" });
    gsap.to(".orbit-dot--2", { rotation: -360, transformOrigin: "-170px 135px", duration: 15, repeat: -1, ease: "none" });

    const steps = qsa(".process-step");
    const stageLabel = qs("[data-stage-label]");
    const stageCopy = qs("[data-stage-copy]");
    const objectLabel = qs(".vessel-object__label");
    const artifactNodes = qsa("[data-artifact]");
    const meters = {
      clarity: qs('[data-meter="clarity"]'),
      structure: qs('[data-meter="structure"]'),
      delivery: qs('[data-meter="delivery"]')
    };
    const states = [
      {
        label: "01 / RAW IDEA", object: "RAW", copy: "验证问题，而不是验证自己是否能把它做出来。",
        artifacts: ["VALUE HYPOTHESIS", "USER SIGNAL", "KILL CRITERIA"],
        color: "#ff6745", radius: "38% 62% 58% 42%", scale: .86, rotate: -10,
        clarity: "18%", structure: "08%", delivery: "00%"
      },
      {
        label: "02 / SYSTEM", object: "SYSTEM", copy: "把个人经验拆成可理解、可执行、可维护的系统。",
        artifacts: ["PROTOCOL", "ROLE MAP", "WORKFLOW"],
        color: "#f3b53f", radius: "28px", scale: 1.02, rotate: 0,
        clarity: "56%", structure: "71%", delivery: "12%"
      },
      {
        label: "03 / PRODUCT", object: "PRODUCT", copy: "给系统清晰的身份、边界、体验与可信证据。",
        artifacts: ["POSITIONING", "INTERFACE", "PROOF"],
        color: "#f2efe7", radius: "50%", scale: 1.12, rotate: 10,
        clarity: "91%", structure: "88%", delivery: "64%"
      },
      {
        label: "04 / DELIVERY", object: "READY", copy: "让产品能够被安装、授权、接手并持续更新。",
        artifacts: ["LICENSE", "SETUP", "MAINTENANCE"],
        color: "#6bc8a5", radius: "24px", scale: .96, rotate: 0,
        clarity: "100%", structure: "100%", delivery: "100%"
      }
    ];

    let currentStage = -1;
    const setState = (index, immediate = false) => {
      if (currentStage === index) return;
      currentStage = index;
      const state = states[index];
      steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
      if (stageLabel) stageLabel.textContent = state.label;
      if (stageCopy) stageCopy.textContent = state.copy;
      if (objectLabel) objectLabel.textContent = state.object;
      artifactNodes.forEach((node, i) => { node.textContent = state.artifacts[i] || ""; });
      Object.entries(meters).forEach(([key, node]) => { if (node) node.textContent = state[key]; });

      gsap.to(".vessel-object", {
        scale: state.scale,
        rotation: state.rotate,
        borderRadius: state.radius,
        backgroundColor: state.color,
        duration: immediate ? 0 : .55,
        ease: "power3.out",
        overwrite: true
      });
      gsap.fromTo(".vessel-explain strong, .vessel-artifacts span", {
        y: 10, autoAlpha: 0
      }, {
        y: 0, autoAlpha: 1, duration: immediate ? 0 : .42, stagger: .045, ease: "power2.out", overwrite: true
      });
      gsap.to(".spark-particle--a", { x: 38 * index, y: -22 * index, duration: .55, ease: "power3.out" });
      gsap.to(".spark-particle--b", { x: -32 * index, y: 28 * index, duration: .55, ease: "power3.out" });
      gsap.to(".spark-particle--c", { x: -18 * index, y: -32 * index, duration: .55, ease: "power3.out" });
    };

    setState(0, true);
    steps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 52%",
        end: "bottom 48%",
        onEnter: () => setState(index),
        onEnterBack: () => setState(index)
      });
    });

    gsap.to(".brain-system__core", {
      y: -12,
      duration: 2.6,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
    gsap.to(".pulse-ring", { scale: 1.08, autoAlpha: .45, duration: 2.4, repeat: -1, yoyo: true, ease: "power1.inOut" });
    gsap.to(".pulse-ring--2", { rotation: 360, duration: 26, repeat: -1, ease: "none" });
    gsap.from(".brain-module", {
      scrollTrigger: { trigger: ".brain-system", start: "top 72%", once: true },
      y: 34, autoAlpha: 0, duration: .8, stagger: .11, ease: "power3.out"
    });

    gsap.from(".meowdesk-frame", {
      scrollTrigger: { trigger: ".meowdesk-frame", start: "top 78%", once: true },
      y: 70, scale: .96, autoAlpha: 0, duration: 1.1, ease: "power3.out"
    });
    gsap.to(".desk-callout--green", { y: -8, duration: 1.8, repeat: -1, yoyo: true, ease: "power1.inOut" });
    gsap.to(".desk-callout--blue", { y: 8, duration: 2.2, repeat: -1, yoyo: true, ease: "power1.inOut" });

    const reveals = qsa(".build-card, .about-layout blockquote, .contact-layout h2");
    reveals.forEach((element) => {
      gsap.from(element, {
        scrollTrigger: { trigger: element, start: "top 86%", once: true },
        y: 48, autoAlpha: 0, duration: .8, ease: "power3.out"
      });
    });

    gsap.to(".contact-orbit", { rotation: 360, duration: 34, repeat: -1, ease: "none" });
  });

    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
    window.addEventListener("pagehide", () => ctx?.revert(), { once: true });
  }

  // Bilingual system: product names remain unchanged; surrounding interface copy follows the selected language.
  const root = document.documentElement;
  const langToggle = document.querySelector('[data-lang-toggle]');
  const applyLanguage = (lang, { persist = true } = {}) => {
    const next = lang === 'en' ? 'en' : 'zh';
    root.dataset.lang = next;
    root.lang = next === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-i18n-zh]').forEach((node) => {
      node.textContent = next === 'en' ? node.dataset.i18nEn : node.dataset.i18nZh;
    });
    document.querySelectorAll('.lang-en').forEach((node) => node.setAttribute('aria-hidden', next !== 'en'));
    document.querySelectorAll('.lang-zh').forEach((node) => node.setAttribute('aria-hidden', next === 'en'));
    if (persist) {
      try { sessionStorage.setItem('mfLanguage', next); } catch (error) {}
    }
    window.dispatchEvent(new CustomEvent('mf:languagechange', { detail: { lang: next } }));
  };
  let storedLanguage = root.dataset.lang || 'zh';
  try { storedLanguage = sessionStorage.getItem('mfLanguage') || storedLanguage; } catch (error) {}
  applyLanguage(storedLanguage, { persist: false });
  if (langToggle) {
    langToggle.addEventListener('click', () => applyLanguage(root.dataset.lang === 'en' ? 'zh' : 'en'));
  }


  const isFlatV08 = document.body.classList.contains('v08-flat');
  const originMap = document.querySelector('.origin-map');
  const originCore = document.querySelector('[data-origin-core]');
  const originNodes = [...document.querySelectorAll('.origin-node')];
  let originPaths = [...document.querySelectorAll('.origin-path')];
  const originProducts = [...document.querySelectorAll('.origin-product')];
  const originSvg = document.querySelector('.origin-map__lines');
  const originHint = document.querySelector('.origin-core__hint');
  const originHalo = document.querySelector('.origin-core__halo');
  const originOrbitSystem = document.querySelector('[data-core-orbit-system]');
  const originOrbitTrack = document.querySelector('[data-core-orbit-track]');
  const originOrbitIcons = [...document.querySelectorAll('[data-core-orbit-icon]')];
  let sourceToProducts = [];
  let originExpanded = false;
  let coreBreath = null;
  let packetTimeline = null;
  let dashTween = null;
  const pathDots = [];

  const rebuildOriginGeometry = () => {
    if (!originMap || !originSvg || !originCore) return;
    if (!originPaths.length) {
      originSvg.innerHTML = '';
      const makePath = (kind, index) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('origin-path', `origin-path--${kind}`);
        path.dataset.itemIndex = String(index);
        originSvg.appendChild(path);
        return path;
      };
      originPaths = [
        ...originNodes.map((_, index) => makePath('source', index)),
        ...originProducts.map((_, index) => makePath('product', index))
      ];
      const productIndex = new Map(originProducts.map((item, index) => [item.dataset.productKey, index]));
      sourceToProducts = originNodes.map((node) => (node.dataset.targets || '')
        .split(/\s+/).filter(Boolean).map((key) => productIndex.get(key)).filter(Number.isInteger));
    }
    const mapRect = originMap.getBoundingClientRect();
    const width = Math.max(1, originMap.clientWidth);
    const height = Math.max(1, originMap.clientHeight);
    originSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const centerOf = (node) => {
      const rect = node.getBoundingClientRect();
      return { x: rect.left - mapRect.left + rect.width / 2, y: rect.top - mapRect.top + rect.height / 2 };
    };
    const core = centerOf(originCore);
    [...originNodes, ...originProducts].forEach((item, index) => {
      const point = centerOf(item);
      originPaths[index]?.setAttribute('d', `M ${core.x.toFixed(2)} ${core.y.toFixed(2)} L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
    });
  };

  const clearOriginHighlights = () => {
    originNodes.forEach((node) => node.classList.remove('is-active'));
    originPaths.forEach((path) => path.classList.remove('is-active'));
    originProducts.forEach((product) => product.classList.remove('is-active'));
  };

  const activateOrigin = (index) => {
    if (!originExpanded) return;
    originNodes.forEach((node,i) => node.classList.toggle('is-active', i === index));
    originPaths.forEach((path,i) => path.classList.toggle('is-active', i === index || (i >= originNodes.length && sourceToProducts[index]?.includes(i-originNodes.length))));
    originProducts.forEach((product,i) => product.classList.toggle('is-active', sourceToProducts[index]?.includes(i)));
    const color = getComputedStyle(originNodes[index]).getPropertyValue('--origin-color').trim() || '#ff6745';
    originMap?.style.setProperty('--origin-color', color);
  };

  const createPathDots = () => {
    if (!originSvg || pathDots.length) return;
    originPaths.forEach((path, pathIndex) => {
      const particles = [];
      for (let particleIndex = 0; particleIndex < 2; particleIndex += 1) {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const radius = (pathIndex < originNodes.length ? 4.1 : 3.7) * (particleIndex === 0 ? 1 : .62);
        dot.dataset.baseRadius = String(radius);
        dot.setAttribute('r', radius.toFixed(2));
        dot.setAttribute('cx', '0');
        dot.setAttribute('cy', '0');
        dot.classList.add('origin-path-dot');
        if (particleIndex) dot.classList.add('origin-path-dot--trail');
        originSvg.appendChild(dot);
        particles.push(dot);
      }
      pathDots.push(particles);
    });
  };

  const setPacketPoint = (dot, path, progress) => {
    const length = path.getTotalLength();
    const point = path.getPointAtLength(length * progress);
    const envelope = Math.sin(Math.PI * progress);
    const baseRadius = parseFloat(dot.dataset.baseRadius || '4');
    dot.setAttribute('cx', point.x.toFixed(2));
    dot.setAttribute('cy', point.y.toFixed(2));
    dot.setAttribute('r', (baseRadius * (.74 + envelope * .34)).toFixed(2));
    dot.style.opacity = String(Math.max(0, Math.min(1, envelope * .98)));
  };

  const stopPathMotion = () => {
    packetTimeline?.kill();
    dashTween?.kill();
    packetTimeline = null;
    dashTween = null;
    pathDots.flat().forEach((dot) => { dot.style.opacity = '0'; });
  };

  const addPacketTravel = (timeline, pathIndex, particleIndex, startAt, duration) => {
    const path = originPaths[pathIndex];
    const dot = pathDots[pathIndex]?.[particleIndex];
    if (!path || !dot || typeof path.getTotalLength !== 'function') return;
    const proxy = { progress: 0 };
    timeline.to(proxy, {
      progress: 1,
      duration,
      ease: 'sine.inOut',
      onStart: () => { dot.style.opacity = '0'; },
      onUpdate: () => setPacketPoint(dot, path, proxy.progress),
      onComplete: () => { dot.style.opacity = '0'; }
    }, startAt);
  };

  const startPathMotion = () => {
    if (!hasGSAP || reduceMotion) return;
    stopPathMotion();

    dashTween = gsap.to(originPaths, {
      strokeDashoffset: -72,
      duration: 4.8,
      repeat: -1,
      ease: 'none'
    });

    packetTimeline = gsap.timeline({ repeat: -1, repeatDelay: .42 });
    originNodes.forEach((_, pathIndex) => {
      addPacketTravel(packetTimeline, pathIndex, 0, pathIndex * .11, 1.26 + pathIndex * .035);
      addPacketTravel(packetTimeline, pathIndex, 1, pathIndex * .11 + .20, 1.18 + pathIndex * .035);
    });
    originProducts.forEach((_, productIndex) => {
      const pathIndex = originNodes.length + productIndex;
      addPacketTravel(packetTimeline, pathIndex, 0, .92 + productIndex * .14, 1.22);
      addPacketTravel(packetTimeline, pathIndex, 1, 1.14 + productIndex * .14, 1.12);
    });
  };

  const initCoreMotion = () => {
    if (!originCore) return;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const hintLabel = originHint?.querySelector('b');
    if (hintLabel) hintLabel.textContent = coarsePointer ? 'TAP TO EXPLORE' : 'HOVER TO EXPLORE';
    if (!hasGSAP || reduceMotion) return;
    gsap.set(originCore, { xPercent: -50, yPercent: -50, scale: 1, transformOrigin: '50% 50%' });
    gsap.set(originHint, { autoAlpha: 1, y: 0 });
    if (originOrbitTrack) {
      gsap.set(originOrbitTrack, { rotation: -42, transformOrigin: '50% 50%' });
      gsap.set(originOrbitIcons, { rotation: 42, transformOrigin: '50% 50%' });
      gsap.to(originOrbitTrack, { rotation: 318, duration: 18, repeat: -1, ease: 'none' });
      gsap.to(originOrbitIcons, { rotation: -318, duration: 18, repeat: -1, ease: 'none' });
    }
    coreBreath = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
      .to(originCore, { scale: 1.012, filter: isFlatV08 ? 'none' : 'saturate(1.035) brightness(1.018)', duration: 3.2 }, 0)
      .to(originHalo, { scale: 1.12, autoAlpha: .34, duration: 3.2 }, 0)
      .to(originHint, { y: -4, autoAlpha: .94, duration: 3.2 }, 0);
  };

  const setOriginExpanded = (expanded) => {
    if (!originMap || !originCore || originExpanded === expanded) return;
    originExpanded = expanded;
    originMap.classList.toggle('is-expanded', expanded);
    originCore.setAttribute('aria-expanded', String(expanded));
    if (!expanded) clearOriginHighlights();

    if (!hasGSAP || reduceMotion) return;

    const coreRect = originCore.getBoundingClientRect();
    const coreX = coreRect.left + coreRect.width / 2;
    const coreY = coreRect.top + coreRect.height / 2;
    const items = [...originNodes, ...originProducts];
    const expandedScale = parseFloat(getComputedStyle(originMap).getPropertyValue('--core-expanded-scale')) || .58;
    const timeline = gsap.timeline({ defaults: { overwrite: true } });

    if (expanded) {
      coreBreath?.pause();
      gsap.set(originPaths, { autoAlpha: 0, strokeDashoffset: 90 });
      gsap.set(items, { visibility: 'visible' });

      timeline
        .to(originCore, { scale: expandedScale, filter: isFlatV08 ? 'none' : 'saturate(1.02)', duration: .76, ease: 'power4.inOut' }, 0)
        .to(originHint, { autoAlpha: 0, y: 8, duration: .22, ease: 'power2.out' }, 0);

      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const itemX = rect.left + rect.width / 2;
        const itemY = rect.top + rect.height / 2;
        timeline.fromTo(item,
          { x: coreX - itemX, y: coreY - itemY, scale: .16, autoAlpha: 0 },
          {
            x: 0, y: 0, scale: 1, autoAlpha: 1, visibility: 'visible',
            duration: .62, ease: 'back.out(1.45)'
          },
          .18 + index * .055
        );
      });

      timeline.fromTo(originPaths,
        { autoAlpha: 0, strokeDashoffset: 90 },
        { autoAlpha: 1, strokeDashoffset: 0, duration: .58, stagger: .055, ease: 'power2.out' },
        .88
      );
      timeline.call(startPathMotion, null, 1.56);
    } else {
      stopPathMotion();
      timeline.to(originPaths, { autoAlpha: 0, strokeDashoffset: 72, duration: .30, stagger: .025, ease: 'power2.in' }, 0);

      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const itemX = rect.left + rect.width / 2;
        const itemY = rect.top + rect.height / 2;
        timeline.to(item, {
          x: coreX - itemX,
          y: coreY - itemY,
          scale: .18,
          autoAlpha: 0,
          duration: .36,
          ease: 'power3.inOut',
          onComplete: () => gsap.set(item, { visibility: 'hidden', x: 0, y: 0 })
        }, .18 + index * .018);
      });

      timeline
        .to(originCore, {
          scale: 1,
          filter: 'none',
          duration: .76,
          ease: 'power4.out',
          onComplete: () => coreBreath?.restart()
        }, .46)
        .to(originHint, { autoAlpha: 1, y: 0, duration: .38, ease: 'power2.out' }, .72);
    }
  };

  if (originMap && originCore) {
    rebuildOriginGeometry();
    createPathDots();
    initCoreMotion();
    originCore.setAttribute('aria-expanded', 'false');
    window.addEventListener('resize', rebuildOriginGeometry, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(rebuildOriginGeometry).observe(originMap);
    originCore.addEventListener('mouseenter', () => setOriginExpanded(true));
    originCore.addEventListener('focus', () => setOriginExpanded(true));
    originCore.addEventListener('click', (event) => {
      if (window.matchMedia('(pointer: coarse)').matches) {
        event.preventDefault();
        setOriginExpanded(!originExpanded);
      }
    });
    originMap.addEventListener('mouseleave', () => setOriginExpanded(false));
    originMap.addEventListener('focusout', (event) => {
      if (!originMap.contains(event.relatedTarget)) setOriginExpanded(false);
    });
    originCore.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOriginExpanded(!originExpanded);
      }
    });
    originNodes.forEach((node,index) => {
      node.addEventListener('mouseenter', () => activateOrigin(index));
      node.addEventListener('focus', () => activateOrigin(index));
    });
  }

  // v0.8 feedback pass 3: editorial pinned product rail.
  const catalogItems = qsa('[data-catalog-item]');
  const catalogArts = qsa('[data-catalog-art]');
  const catalogPreview = qs('[data-catalog-preview]');
  const catalogTitle = qs('[data-catalog-title]');
  const catalogStatus = qs('[data-catalog-status]');
  const catalogDescription = qs('[data-catalog-description]');
  const catalogCounter = qs('[data-catalog-counter]');
  const catalogCta = qs('[data-catalog-cta]');
  const catalogShell = qs('.catalog-shell');
  const catalogList = qs('.catalog-list');
  const catalogListViewport = qs('[data-catalog-list-viewport]');
  const catalogRailDots = qsa('[data-rail-index]');
  const catalogRailCounter = qs('[data-catalog-rail-counter]');
  let activeCatalogKey = 'brain2';
  let activeCatalogIndex = 0;
  let catalogTransition = null;

  catalogItems.forEach((item, index) => item.dataset.seq = String(index + 1).padStart(2, '0'));

  const catalogData = {
    brain2: {
      title: 'Brain2',
      status: { zh: '行星 / 产品化包装中', en: 'PLANET / PACKAGING' },
      description: { zh: '让 AI 能读懂、接手并持续维护工作上下文的外接大脑系统。', en: 'An external-brain system that lets AI understand, inherit and maintain working context.' },
      href: 'brain2.html', placeholder: false
    },
    installer: {
      title: 'Meow Installer',
      status: { zh: '行星 / 开发中', en: 'PLANET / IN DEVELOPMENT' },
      description: { zh: '面向非应用类 Meow 产品的通用本机接入入口。', en: 'A general local access layer for non-app Meow products.' },
      href: 'galaxy-map.html#meow-installer', placeholder: false
    },
    meowdesk: {
      title: 'Meowdesk',
      status: { zh: '轨道枢纽 / 开发中', en: 'ORBITAL HUB / IN DEVELOPMENT' },
      description: { zh: '让多个产品、Agent 与上下文一起工作的集成环境。', en: 'An integration environment where products, agents and context work together.' },
      href: 'meowdesk.html', placeholder: false
    },
    viewer: {
      title: 'MeowViewer',
      status: { zh: '行星候选', en: 'PLANET CANDIDATE' },
      description: { zh: '当前仅保留产品位置与预览占位；正式边界需查本地工程成熟度。', en: 'Only a product position and preview placeholder are shown; the formal boundary requires local maturity verification.' },
      href: null, placeholder: true
    },
    helper: {
      title: 'Meow Dev Helper',
      status: { zh: '行星候选 / MVP', en: 'PLANET CANDIDATE / MVP' },
      description: { zh: '当前仅展示候选产品位置；详细能力将在产品化整理后补充。', en: 'Only the candidate product position is shown; details will follow productization.' },
      href: null, placeholder: true
    },
    protector: {
      title: 'Meow Protector',
      status: { zh: '行星候选', en: 'PLANET CANDIDATE' },
      description: { zh: '当前仅作为形成中的产品占位，不扩写未经确认的能力定义。', en: 'Currently a placeholder for a product in formation; unconfirmed capabilities are not claimed.' },
      href: null, placeholder: true
    },
    coming: {
      title: 'Coming Soon',
      status: { zh: '未来对象', en: 'FUTURE OBJECT' },
      description: { zh: '为下一条经过 Productization Gate 的产品信号保留位置。', en: 'Reserved for the next product signal that passes the Productization Gate.' },
      href: null, placeholder: true
    }
  };

  const moveCatalogList = (index, { animate = true } = {}) => {
    if (!catalogList || !catalogListViewport || !catalogItems.length) return;
    const rowHeight = catalogItems[0].getBoundingClientRect().height || 132;
    const viewportHeight = catalogListViewport.getBoundingClientRect().height || rowHeight * 3;
    const targetY = viewportHeight / 2 - rowHeight * (index + .5);
    if (hasGSAP && !reduceMotion && animate) {
      gsap.to(catalogList, { y: targetY, duration: .82, ease: 'power4.inOut', overwrite: true });
    } else {
      gsap?.set(catalogList, { y: targetY });
      if (!hasGSAP) catalogList.style.transform = `translate3d(0, ${targetY}px, 0)`;
    }
  };

  const updateCatalogText = (data, lang) => {
    if (catalogTitle) catalogTitle.textContent = data.title;
    if (catalogStatus) catalogStatus.textContent = data.status[lang];
    if (catalogDescription) catalogDescription.textContent = data.description[lang];
    if (catalogCta) catalogCta.textContent = data.placeholder
      ? (lang === 'en' ? 'DETAILS PENDING' : '详情待补充')
      : (lang === 'en' ? 'VIEW DETAILS ↗' : '查看详情 ↗');
  };

  const setCatalog = (key, { animate = true } = {}) => {
    const data = catalogData[key];
    if (!data) return;
    const nextIndex = Math.max(0, catalogItems.findIndex((item) => item.dataset.catalogItem === key));
    const lang = root.dataset.lang === 'en' ? 'en' : 'zh';
    const previousArt = catalogArts.find((art) => art.classList.contains('is-active'));
    const nextArt = catalogArts.find((art) => art.dataset.catalogArt === key);
    const changed = key !== activeCatalogKey;

    activeCatalogKey = key;
    activeCatalogIndex = nextIndex;
    catalogItems.forEach((item, index) => item.classList.toggle('is-active', index === nextIndex));
    catalogRailDots.forEach((dot, index) => dot.classList.toggle('is-active', index === nextIndex));
    const countText = `${String(nextIndex + 1).padStart(2, '0')} / ${String(catalogItems.length).padStart(2, '0')}`;
    if (catalogCounter) catalogCounter.textContent = countText;
    if (catalogRailCounter) catalogRailCounter.textContent = String(nextIndex + 1).padStart(2, '0');
    moveCatalogList(nextIndex, { animate });

    if (catalogPreview) {
      catalogPreview.classList.toggle('is-placeholder', data.placeholder);
      catalogPreview.setAttribute('aria-disabled', String(data.placeholder));
      catalogPreview.setAttribute('aria-label', data.placeholder
        ? `${data.title} ${lang === 'en' ? 'preview placeholder' : '预览占位'}`
        : `${lang === 'en' ? 'View' : '查看'} ${data.title}`);
      catalogPreview.href = data.href || '#product-index';
    }

    catalogTransition?.kill();
    if (hasGSAP && !reduceMotion && animate && changed) {
      const textTargets = [catalogTitle, catalogStatus, catalogDescription, catalogCta].filter(Boolean);
      if (nextArt && nextArt !== previousArt) nextArt.classList.add('is-active');
      catalogTransition = gsap.timeline({ defaults: { overwrite: true } });
      if (previousArt && previousArt !== nextArt) {
        catalogTransition.to(previousArt, { autoAlpha: 0, yPercent: -8, rotation: -1.2, scale: 1.025, duration: .44, ease: 'power3.in' }, 0);
      }
      catalogTransition.to(textTargets, { autoAlpha: 0, y: -10, duration: .2, ease: 'power2.in' }, 0)
        .add(() => updateCatalogText(data, lang), .2);
      if (nextArt) {
        catalogTransition.fromTo(nextArt,
          { autoAlpha: 0, yPercent: 10, rotation: 1.4, scale: .955 },
          { autoAlpha: 1, yPercent: 0, rotation: 0, scale: 1, duration: .72, ease: 'power4.out' }, .2);
      }
      catalogTransition.to(textTargets, { autoAlpha: 1, y: 0, duration: .38, stagger: .035, ease: 'power3.out' }, .28)
        .add(() => {
          catalogArts.forEach((art) => {
            if (art !== nextArt) {
              art.classList.remove('is-active');
              gsap.set(art, { clearProps: 'transform,opacity,visibility' });
            }
          });
        });
    } else {
      catalogArts.forEach((art) => art.classList.toggle('is-active', art === nextArt));
      updateCatalogText(data, lang);
    }
  };

  catalogItems.forEach((item) => {
    const key = item.dataset.catalogItem;
    item.addEventListener('mouseenter', () => setCatalog(key));
    item.addEventListener('focus', () => setCatalog(key));
    item.addEventListener('click', () => setCatalog(key));
  });
  catalogPreview?.addEventListener('click', (event) => {
    if (catalogData[activeCatalogKey]?.placeholder) event.preventDefault();
  });
  window.addEventListener('mf:languagechange', () => setCatalog(activeCatalogKey, { animate: false }));
  window.addEventListener('resize', () => moveCatalogList(activeCatalogIndex, { animate: false }));
  if (catalogItems.length) requestAnimationFrame(() => setCatalog(catalogItems[0].dataset.catalogItem, { animate: false }));

  if (catalogShell && catalogItems.length > 1 && hasGSAP && window.ScrollTrigger && !reduceMotion) {
    const catalogMedia = gsap.matchMedia();
    catalogMedia.add('(min-width: 981px)', () => {
      const steps = catalogItems.length - 1;
      const enterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.product-catalog',
          start: 'top 88%',
          end: 'top top+=74',
          scrub: .7,
          invalidateOnRefresh: true
        }
      });
      enterTimeline
        .from('.catalog-intro', { x: -70, autoAlpha: 0, duration: 1 }, 0)
        .from('.catalog-list-viewport', { y: 70, autoAlpha: 0, duration: 1 }, .08)
        .from('.catalog-preview', { x: 90, autoAlpha: 0, rotation: 2.6, duration: 1 }, .04)
        .from('.catalog-rail', { autoAlpha: 0, duration: .7 }, .3);

      const scrollDistance = () => Math.max(window.innerHeight * 4.1, steps * window.innerHeight * .72);
      const trigger = ScrollTrigger.create({
        trigger: '.product-catalog',
        start: 'top top+=74',
        end: () => `+=${scrollDistance()}`,
        pin: catalogShell,
        pinSpacing: true,
        scrub: .22,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: (value) => Math.round(value * steps) / steps,
          duration: { min: .14, max: .34 },
          delay: .04,
          ease: 'power2.inOut'
        },
        onEnter: () => header?.classList.remove('is-light'),
        onEnterBack: () => header?.classList.remove('is-light'),
        onLeave: () => requestAnimationFrame(updateHeader),
        onLeaveBack: () => requestAnimationFrame(updateHeader),
        onUpdate: (self) => {
          header?.classList.remove('is-light');
          const index = Math.min(steps, Math.max(0, Math.round(self.progress * steps)));
          const key = catalogItems[index]?.dataset.catalogItem;
          if (key && key !== activeCatalogKey) setCatalog(key);
        }
      });
      return () => { trigger.kill(); enterTimeline.scrollTrigger?.kill(); enterTimeline.kill(); };
    });
  }

  // Section-to-section motion language: a flat wipe plus content reveal.
  if (hasGSAP && window.ScrollTrigger && !reduceMotion) {
    const heroCopy = qs('.hero-copy');
    const originPanel = qs('.origin-map');
    if (heroCopy && originPanel) {
      gsap.timeline({
        scrollTrigger: { trigger: '.hero', start: 'bottom bottom', end: 'bottom top+=74', scrub: .8 }
      })
        .to(heroCopy, { x: -58, autoAlpha: .28, ease: 'none' }, 0)
        .to(originPanel, { x: 58, autoAlpha: .28, ease: 'none' }, 0);
    }
    qsa('main > section[data-part]:not(.hero):not(.product-catalog)').forEach((section) => {
      const wipe = document.createElement('div');
      wipe.className = 'part-transition-wipe';
      wipe.setAttribute('aria-hidden', 'true');
      section.prepend(wipe);
      const revealTargets = qsa('.section-shell > *, .installer-layout > *, .contact-layout > *', section).slice(0, 8);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 84%', toggleActions: 'play none none reverse' }
      });
      tl.fromTo(wipe, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: .44, ease: 'power3.inOut' })
        .to(wipe, { scaleX: 0, transformOrigin: 'right center', duration: .44, ease: 'power3.inOut' })
        .from(revealTargets, { y: 54, autoAlpha: 0, stagger: .07, duration: .72, ease: 'power3.out' }, .18);
    });
  }

  // v0.4 overwrite hotfix: accessible product dropdown navigation
  const dropdowns = [...document.querySelectorAll('[data-dropdown]')];
  const closeDropdowns = (except = null) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown === except) return;
      dropdown.classList.remove('is-open');
      dropdown.querySelector('.nav-trigger')?.setAttribute('aria-expanded', 'false');
    });
  };
  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-trigger');
    trigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      const nextOpen = !dropdown.classList.contains('is-open');
      closeDropdowns(dropdown);
      dropdown.classList.toggle('is-open', nextOpen);
      trigger.setAttribute('aria-expanded', String(nextOpen));
    });
    dropdown.querySelectorAll('.nav-menu a').forEach((link) => {
      link.addEventListener('click', () => { link.blur(); closeDropdowns(); });
    });
  });
  document.addEventListener('click', () => closeDropdowns());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDropdowns();
  });

  // v0.7: geometry-true Brain2 connections. Each line joins circle edge to circle edge.
  const brainSystem = qs('.brain-system');
  const brainCore = qs('.brain-system__core');
  const brainModules = qsa('.brain-module', brainSystem || document);
  const brainLinesSvg = qs('.brain-lines', brainSystem || document);
  const brainLinePaths = qsa('[data-brain-line]', brainLinesSvg || document);
  const updateBrainGeometry = () => {
    if (!brainSystem || !brainCore || !brainLinesSvg || !brainLinePaths.length) return;
    const systemRect = brainSystem.getBoundingClientRect();
    const width = Math.max(1, brainSystem.clientWidth);
    const height = Math.max(1, brainSystem.clientHeight);
    brainLinesSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const circle = (node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: rect.left - systemRect.left + rect.width / 2,
        y: rect.top - systemRect.top + rect.height / 2,
        r: Math.min(rect.width, rect.height) / 2
      };
    };
    const coreCircle = circle(brainCore);
    brainModules.forEach((module, index) => {
      const path = brainLinePaths[index];
      if (!path) return;
      const target = circle(module);
      const dx = target.x - coreCircle.x;
      const dy = target.y - coreCircle.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const ux = dx / distance;
      const uy = dy / distance;
      // Draw through both centers. The circles sit above the SVG, so the hidden
      // portions act as a perfect mask and the visible dash always meets the rim.
      path.setAttribute('d', `M ${coreCircle.x.toFixed(2)} ${coreCircle.y.toFixed(2)} L ${target.x.toFixed(2)} ${target.y.toFixed(2)}`);
    });
  };
  if (brainSystem) {
    updateBrainGeometry();
    window.addEventListener('load', updateBrainGeometry, { once: true });
    window.addEventListener('resize', updateBrainGeometry, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(updateBrainGeometry).observe(brainSystem);
    if (hasGSAP && !reduceMotion) {
      gsap.set(brainLinePaths, { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: brainSystem,
        start: 'top 72%',
        once: true,
        onEnter: () => gsap.to(brainLinePaths, { autoAlpha: 1, strokeDashoffset: 0, duration: .48, stagger: .07, delay: .58, ease: 'power2.out' })
      });
    }
  }

  // v0.7 shock ignition rebuild: official mark → energy core → real Forge core.
  const entry = qs('[data-mf-entry]');
  const entryStage = qs('[data-mf-entry-stage]');
  const entrySymbol = qs('[data-mf-entry-symbol]');
  const entryPortal = qs('[data-mf-entry-portal]');
  const entryGrid = qs('.mf-entry__grid', entry || document);
  const entryProgress = qs('[data-mf-progress]');
  const entryProgressBar = qs('[data-mf-progress-bar]');
  const entryProgressLabel = qs('[data-mf-progress-label]');
  let heroIntroStarted = false;
  let entryScrollY = 0;
  let entryTimeline = null;
  let entryDone = false;
  let entryForcing = false;
  let entryWatchdog = null;

  const coreNode = () => qs('.origin-core');

  const lockEntryScroll = () => {
    entryScrollY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add('mf-scroll-locked');
    document.body.classList.add('mf-entry-lock');
    document.body.style.top = `-${entryScrollY}px`;
  };

  const unlockEntryScroll = () => {
    document.documentElement.classList.remove('mf-scroll-locked');
    document.body.classList.remove('mf-entry-lock');
    document.body.style.removeProperty('top');
    if (entryScrollY > 0) window.scrollTo(0, entryScrollY);
  };

  const startHeroIntro = () => {
    if (heroIntroStarted) return;
    heroIntroStarted = true;
    window.__mfHeroIntro?.play();
  };

  const releaseEntry = ({ hide = true } = {}) => {
    if (entryDone) return;
    entryDone = true;
    if (entryWatchdog) window.clearTimeout(entryWatchdog);
    if (window.__mfEntryNativeWatchdog) window.clearTimeout(window.__mfEntryNativeWatchdog);
    if (entry) {
      entry.classList.remove('is-igniting', 'is-bursting');
      if (hide) {
        entry.style.display = 'none';
        entry.style.opacity = '0';
        entry.style.pointerEvents = 'none';
      }
    }
    const core = coreNode();
    if (core) core.style.removeProperty('opacity');
    document.documentElement.classList.remove('mf-entry-pending');
    unlockEntryScroll();
    try { sessionStorage.removeItem('mfInternalNav'); } catch (error) {}
    startHeroIntro();
    resolveEntryReady?.();
    requestAnimationFrame(() => {
      updateHeader();
      if (hasGSAP) window.setTimeout(() => ScrollTrigger.refresh(), 80);
    });
  };

  const forceFinishEntry = () => {
    if (entryDone || entryForcing) return;
    entryForcing = true;
    try {
      entryTimeline?.eventCallback?.('onInterrupt', null);
      entryTimeline?.kill();
    } catch (error) {}
    if (entry && hasGSAP) gsap.killTweensOf([entry, entryStage, entrySymbol, entryPortal, entryGrid]);
    entryForcing = false;
    releaseEntry();
  };

  if (entry) entryWatchdog = window.setTimeout(forceFinishEntry, 6200);

  const coreTarget = () => {
    const core = coreNode();
    if (!core) return null;
    const rect = core.getBoundingClientRect();
    return {
      node: core,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width
    };
  };

  const setPortalAt = (x, y, scale = 1, alpha = 1) => {
    gsap.set(entryPortal, {
      xPercent: -50,
      yPercent: -50,
      x,
      y,
      scale,
      autoAlpha: alpha,
      transformOrigin: '50% 50%'
    });
  };

  const runFullIgnition = () => {
    if (!entry || !entryStage || !entrySymbol || !entryPortal || !hasGSAP || reduceMotion) {
      releaseEntry();
      return;
    }

    window.scrollTo(0, 0);
    lockEntryScroll();
    entry.classList.add('is-igniting');

    const beginIgnitionFrame = () => requestAnimationFrame(() => {
      if (entryDone) return;
      const target = coreTarget();
      const symbolRect = entrySymbol.getBoundingClientRect();
      const symbolX = symbolRect.left + symbolRect.width / 2;
      const symbolY = symbolRect.top + symbolRect.height / 2;
      const portalBase = Math.max(1, entryPortal.getBoundingClientRect().width || entryPortal.offsetWidth || 120);
      const targetX = target?.x ?? window.innerWidth / 2;
      const targetY = target?.y ?? window.innerHeight / 2;
      const targetScale = (target?.width ?? Math.min(innerWidth, innerHeight) * .44) / portalBase;
      const progressProxy = { value: 0 };

      if (target?.node) gsap.set(target.node, { autoAlpha: 0 });
      gsap.set(entry, { display: 'grid', autoAlpha: 1, pointerEvents: 'all', '--mf-flash': 0, '--mf-vignette': .92 });
      gsap.set(entryGrid, { autoAlpha: .42, scale: 1.12 });
      gsap.set(entryStage, { autoAlpha: 1, x: 0, y: 0 });
      gsap.set(entrySymbol, { scale: .34, rotation: -42, autoAlpha: 0, x: 0, y: 0, transformOrigin: '50% 50%' });
      setPortalAt(symbolX, symbolY, .025, 0);
      gsap.set(entryProgressBar, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set('.mf-entry__eyebrow, .mf-entry__progress', { y: 18, autoAlpha: 0 });

      entryTimeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: releaseEntry,
        onInterrupt: forceFinishEntry
      });

      entryTimeline
        .to(entryGrid, { scale: 1, autoAlpha: .54, duration: 1.18, ease: 'expo.out' }, 0)
        .to(entrySymbol, { scale: 1, rotation: 0, autoAlpha: 1, duration: .78, ease: 'expo.out' }, 0)
        .to('.mf-entry__eyebrow, .mf-entry__progress', { y: 0, autoAlpha: 1, duration: .42, stagger: .07 }, .28)
        .to(progressProxy, {
          value: 100,
          duration: 1.24,
          ease: 'power2.inOut',
          onUpdate: () => {
            const value = Math.round(progressProxy.value);
            if (entryProgress) entryProgress.textContent = String(value).padStart(2, '0');
            if (entryProgressBar) gsap.set(entryProgressBar, { scaleX: value / 100 });
            if (entryProgressLabel) entryProgressLabel.textContent = value > 82 ? 'SYSTEM ALIGNED' : 'ALIGNING NODES';
          }
        }, .36)
        .to(entrySymbol, { scale: 1.09, rotation: 4, duration: .11, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 1.35)
        .to(entry, { '--mf-flash': .92, duration: .07, ease: 'power4.in' }, 1.48)
        .to(entry, { '--mf-flash': 0, duration: .24, ease: 'power3.out' }, 1.55)
        .call(() => entry.classList.add('is-bursting'), null, 1.48)
        // The energy seed is born at the exact visual center of the official Logo.
        .to(entryPortal, { scale: .92, autoAlpha: 1, duration: .34, ease: 'back.out(1.6)' }, 1.48)
        .to(entrySymbol, { scale: .74, autoAlpha: .22, rotation: 18, duration: .28, ease: 'power3.in' }, 1.52)
        .to('.mf-entry__eyebrow, .mf-entry__progress', { y: -22, autoAlpha: 0, duration: .24, ease: 'power2.in' }, 1.54)
        .to(entrySymbol, { scale: .22, autoAlpha: 0, rotation: 46, duration: .26, ease: 'power4.in' }, 1.72)
        .call(startHeroIntro, null, 1.78)
        // One sphere travels into the real homepage Core; no second orange layer is introduced.
        .to(entryPortal, {
          x: targetX,
          y: targetY,
          scale: targetScale,
          duration: .92,
          ease: 'expo.inOut'
        }, 1.80)
        .to(entry, { '--mf-vignette': 0, backgroundColor: 'rgba(13,14,12,0)', duration: .82, ease: 'power2.inOut' }, 1.88)
        .to(entryGrid, { scale: .94, autoAlpha: 0, duration: .68, ease: 'power2.out' }, 1.90)
        .to(entryStage, { autoAlpha: 0, duration: .22 }, 1.82)
        .call(() => { if (target?.node) gsap.to(target.node, { autoAlpha: 1, duration: .22, ease: 'power1.out' }); }, null, 2.55)
        .to(entryPortal, { autoAlpha: 0, duration: .24, ease: 'power1.out' }, 2.56)
        .to(entry, { autoAlpha: 0, pointerEvents: 'none', duration: .24 }, 2.58);
    });
    if (document.fonts?.ready) {
      Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 420))]).then(beginIgnitionFrame);
    } else {
      beginIgnitionFrame();
    }
  };

  const runInternalReveal = () => {
    if (!entry || !entryPortal || !hasGSAP || reduceMotion) {
      releaseEntry();
      return;
    }
    lockEntryScroll();
    gsap.set(entry, { display: 'grid', autoAlpha: 1, backgroundColor: '#0d0e0c', pointerEvents: 'all' });
    gsap.set(entryGrid, { autoAlpha: .22, scale: 1.04 });
    gsap.set(entryStage, { autoAlpha: 0 });
    setPortalAt(window.innerWidth / 2, window.innerHeight / 2, .72, 1);
    startHeroIntro();
    entryTimeline = gsap.timeline({ onComplete: releaseEntry, onInterrupt: forceFinishEntry })
      .to(entryPortal, { scale: .14, autoAlpha: 0, duration: .46, ease: 'expo.inOut' }, 0)
      .to(entryGrid, { scale: .96, autoAlpha: 0, duration: .48 }, 0)
      .to(entry, { backgroundColor: 'rgba(13,14,12,0)', autoAlpha: 0, pointerEvents: 'none', duration: .54 }, 0);
  };

  const navigateWithForge = (href) => {
    if (!entry || !entryPortal || !hasGSAP || reduceMotion) {
      window.location.href = href;
      return;
    }
    try { sessionStorage.setItem('mfInternalNav', '1'); } catch (error) {}
    lockEntryScroll();
    gsap.set(entry, { display: 'grid', autoAlpha: 1, backgroundColor: 'rgba(13,14,12,0)', pointerEvents: 'all' });
    gsap.set(entryGrid, { autoAlpha: 0, scale: .96 });
    gsap.set(entryStage, { autoAlpha: 0 });
    setPortalAt(window.innerWidth / 2, window.innerHeight / 2, .08, 0);
    entryTimeline = gsap.timeline({ onComplete: () => { window.location.href = href; } })
      .to(entry, { backgroundColor: '#0d0e0c', duration: .42, ease: 'power2.inOut' }, 0)
      .to(entryGrid, { autoAlpha: .24, scale: 1, duration: .38 }, .04)
      .to(entryPortal, { scale: .76, autoAlpha: 1, duration: .42, ease: 'back.out(1.4)' }, .02);
  };

  qsa('a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !/\.html(?:$|#|\?)/i.test(url.pathname + url.search + url.hash)) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      event.preventDefault();
      navigateWithForge(url.href);
    });
  });

  if (gatePageIntro) {
    if (isHomePage && !entryState.internal) runFullIgnition();
    else runInternalReveal();
  } else {
    releaseEntry();
  }

})();


// Meow Forge v0.7 standalone editorial page motion.
(() => {
  if (typeof window.gsap === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  (window.__mfEntryReady || Promise.resolve()).then(() => {
    const targets = document.querySelectorAll('.editorial-hero h1, .editorial-hero__lead, .story-split h2, .story-copy p, .direction-grid article, .method-steps li, .build-log-entry header, .judgment-grid > div, .connect-layout h2');
    targets.forEach((target) => {
      gsap.from(target, {
        scrollTrigger: { trigger: target, start: 'top 88%', once: true },
        y: 34,
        autoAlpha: 0,
        duration: .72,
        ease: 'power3.out'
      });
    });
    gsap.to('.editorial-hero__mark', { rotation: 360, duration: 28, repeat: -1, ease: 'none' });
    ScrollTrigger.refresh();
  });
})();
