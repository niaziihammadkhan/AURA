/**
 * AURA - Stillness Designed To Awaken
 * Cinematic hero sequence, lightweight Intersection Observer scroll reveals,
 * Web Audio harmonic sound engine, and interactive 4-4-4-4 Box Breathing visualizer.
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroStatsCounter();
  initScrollHeader();
  initScrollReveals();
  initNavLinksAndScrollSpy();
  initMobileMenu();
  initSoundEngine();
  initBreathworkModal();
});

/**
 * 1. HERO STATS COUNT-UP ANIMATION
 * Sequentially triggers with easeOutCubic curve once visible
 */
function initHeroStatsCounter() {
  const statElements = document.querySelectorAll('.stat-item');
  if (!statElements.length) return;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function startCountUp(el, index) {
    const valueEl = el.querySelector('.stat-value');
    if (!valueEl || valueEl.dataset.counted === 'true') return;

    valueEl.dataset.counted = 'true';
    const target = parseFloat(valueEl.dataset.target || '0');
    const decimals = parseInt(valueEl.dataset.decimals || '0', 10);
    const suffix = valueEl.dataset.suffix || '';

    // Matches the staggered hero entrance sequence timing (after CTA & heading)
    const duration = 1400 + index * 80;
    const startDelay = 1400 + index * 100;

    setTimeout(() => {
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const currentVal = target * eased;

        valueEl.textContent = currentVal.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          valueEl.textContent = target.toFixed(decimals) + suffix;
        }
      }

      requestAnimationFrame(update);
    }, startDelay);
  }

  // Kick off sequential count-up
  statElements.forEach((el, i) => startCountUp(el, i));
}

/**
 * 2. STICKY HEADER SCROLL STATE
 */
function initScrollHeader() {
  const headerContainer = document.querySelector('.header-container');
  if (!headerContainer) return;

  function onScroll() {
    if (window.scrollY > 30) {
      headerContainer.classList.add('scrolled');
    } else {
      headerContainer.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * 3. INTERSECTION OBSERVER SCROLL REVEALS
 * Lightweight, non-repeating entrance animations for lower sections.
 * Automatically computes staggered card delays (80-120ms) and ensures
 * headings appear before supporting content.
 */
function initScrollReveals() {
  const revealTargets = document.querySelectorAll(
    '.reveal-fade-up, .reveal-card, .reveal-scale, .reveal-divider'
  );
  if (!revealTargets.length) return;

  // Stagger grid cards within their container
  const gridContainers = document.querySelectorAll(
    '.features-grid, .soundscapes-grid, .journeys-grid, .sanctuary-metrics-grid'
  );

  gridContainers.forEach((grid) => {
    const cards = grid.querySelectorAll('.reveal-card');
    cards.forEach((card, idx) => {
      card.style.setProperty('--stagger-delay', `${idx * 0.09}s`);
    });
  });

  // Stagger section header elements (badge -> title -> subtitle)
  const sectionHeaders = document.querySelectorAll('.section-header');
  sectionHeaders.forEach((header) => {
    const headerChildren = header.querySelectorAll('.reveal-fade-up');
    headerChildren.forEach((child, idx) => {
      child.style.setProperty('--stagger-delay', `${idx * 0.1}s`);
    });
  });

  // Check reduced motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    revealTargets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  // Enable progressive enhancement: JS has initialized
  document.documentElement.classList.add('js-animated');

  if ('IntersectionObserver' in window) {
    const isMobile = window.innerWidth <= 768;
    const threshold = isMobile ? 0.1 : 0.18;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            // Fast scroll safeguard: if element is already scrolled well into view, reveal immediately
            if (entry.boundingClientRect.top < window.innerHeight * 0.7) {
              el.style.transitionDelay = '0s';
            }

            el.classList.add('is-revealed');
            obs.unobserve(el);
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-revealed'));
  }
}

/**
 * 4. NAV LINKS SMOOTH SCROLL & SCROLL SPY
 */
function initNavLinksAndScrollSpy() {
  const desktopLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const sections = document.querySelectorAll('section[id], footer[id]');

  function setActive(targetId) {
    desktopLinks.forEach((link) => {
      const match = link.getAttribute('href') === `#${targetId}`;
      link.classList.toggle('active', match);
    });
    mobileLinks.forEach((link) => {
      const match = link.getAttribute('href') === `#${targetId}`;
      link.classList.toggle('active', match);
    });
  }

  // Smooth click scroll
  [...desktopLinks, ...mobileLinks].forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: 'smooth' });
          setActive(targetId);
        }
      }
    });
  });

  // Scroll spy observer
  if ('IntersectionObserver' in window && sections.length) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        threshold: 0.25,
      }
    );

    sections.forEach((sec) => spyObserver.observe(sec));
  }
}

/**
 * 5. MOBILE MENU & SHEET (<=720px)
 */
function initMobileMenu() {
  const burger = document.querySelector('.mobile-burger');
  const overlay = document.querySelector('.mobile-overlay');
  const sheet = document.querySelector('.mobile-sheet');
  if (!burger || !overlay) return;

  function openMenu() {
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    overlay.removeAttribute('hidden');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open navigation menu');
    overlay.setAttribute('hidden', '');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  burger.addEventListener('click', toggleMenu);

  overlay.addEventListener('click', (e) => {
    if (sheet && !sheet.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  const mobileLinks = overlay.querySelectorAll('.mobile-nav-link, .sign-in-btn');
  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720 && burger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
}

/**
 * 6. WEB AUDIO SOUND ENGINE (432Hz, 528Hz, 216Hz, Theta & Ambient Rain)
 */
function initSoundEngine() {
  const ambientBtn = document.querySelector('.ambient-toggle');
  const freqButtons = document.querySelectorAll('.play-freq-btn');

  let audioCtx = null;
  let masterGain = null;
  let isPlayingAmbient = false;
  let activeOscs = [];
  let noiseSource = null;
  let currentActiveFreqBtn = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function startAmbient(customFreq = 432) {
    const ctx = getAudioContext();

    if (!masterGain) {
      masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
    }

    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 2.5);

    stopCurrentOscillators();

    // Fundamental tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(customFreq, ctx.currentTime);

    // Warm sub-harmonic
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(customFreq / 2, ctx.currentTime);

    // Theta wave binaural pulse (4Hz delta/theta difference)
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(customFreq + 4, ctx.currentTime);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, ctx.currentTime);

    osc1.connect(oscGain);
    osc2.connect(oscGain);
    osc3.connect(oscGain);
    oscGain.connect(masterGain);

    osc1.start();
    osc2.start();
    osc3.start();

    activeOscs = [osc1, osc2, osc3];

    // Atmospheric warm filtered noise
    if (!noiseSource) {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.055;
        b1 = 0.99332 * b1 + white * 0.075;
        b2 = 0.96900 * b2 + white * 0.15;
        output[i] = (b0 + b1 + b2) * 0.07;
      }

      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start();
    }

    isPlayingAmbient = true;
    if (ambientBtn) {
      ambientBtn.classList.add('playing');
      ambientBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
      ambientBtn.setAttribute('title', 'Pause ambient sound');
    }
  }

  function stopCurrentOscillators() {
    activeOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (_) {}
    });
    activeOscs = [];
  }

  function stopAmbient() {
    if (!masterGain || !audioCtx) return;

    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);

    setTimeout(() => {
      stopCurrentOscillators();
      if (noiseSource) {
        try {
          noiseSource.stop();
          noiseSource.disconnect();
        } catch (_) {}
        noiseSource = null;
      }
      isPlayingAmbient = false;
      if (ambientBtn) {
        ambientBtn.classList.remove('playing');
        ambientBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        ambientBtn.setAttribute('title', 'Play 432Hz ambient resonance');
      }
      if (currentActiveFreqBtn) {
        currentActiveFreqBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        currentActiveFreqBtn = null;
      }
    }, 1050);
  }

  if (ambientBtn) {
    ambientBtn.addEventListener('click', () => {
      if (isPlayingAmbient) {
        stopAmbient();
      } else {
        startAmbient(432);
      }
    });
  }

  // Interactive Frequency Cards in Soundscape section
  freqButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const freq = parseFloat(btn.dataset.freq || '432');

      if (currentActiveFreqBtn === btn && isPlayingAmbient) {
        stopAmbient();
      } else {
        if (currentActiveFreqBtn) {
          currentActiveFreqBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
        startAmbient(freq);
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        currentActiveFreqBtn = btn;
      }
    });
  });
}

/**
 * 7. GUIDED BREATHWORK EXPERIENCE MODAL
 * 4-4-4-4 Box Breathing visualizer
 */
function initBreathworkModal() {
  const triggerButtons = document.querySelectorAll('.cta-btn, .open-breathwork-btn');
  const modal = document.querySelector('.meditation-modal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal-close');
  const circle = modal.querySelector('.breath-circle');
  const phaseText = modal.querySelector('.breath-phase-text');
  const timerText = modal.querySelector('.breath-timer');

  let breathInterval = null;
  let phaseStep = 0;
  let secondsRemaining = 4;

  const phases = [
    { name: 'Inhale Peace', class: 'inhale', duration: 4 },
    { name: 'Hold Presence', class: 'hold', duration: 4 },
    { name: 'Exhale Tension', class: 'exhale', duration: 4 },
    { name: 'Rest in Stillness', class: 'rest', duration: 4 },
  ];

  function runBreathCycle() {
    const current = phases[phaseStep];
    if (phaseText) phaseText.textContent = current.name;
    if (circle) circle.className = `breath-circle ${current.class}`;

    secondsRemaining = current.duration;
    if (timerText) timerText.textContent = `${secondsRemaining}s`;

    if (breathInterval) clearInterval(breathInterval);

    breathInterval = setInterval(() => {
      secondsRemaining--;
      if (secondsRemaining > 0) {
        if (timerText) timerText.textContent = `${secondsRemaining}s`;
      } else {
        phaseStep = (phaseStep + 1) % phases.length;
        runBreathCycle();
      }
    }, 1000);
  }

  function openModal(e) {
    if (e) e.preventDefault();
    modal.removeAttribute('hidden');
    document.body.classList.add('modal-open');
    phaseStep = 0;
    runBreathCycle();
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    document.body.classList.remove('modal-open');
    if (breathInterval) {
      clearInterval(breathInterval);
      breathInterval = null;
    }
  }

  triggerButtons.forEach((btn) => {
    btn.addEventListener('click', openModal);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
      closeModal();
    }
  });
}
