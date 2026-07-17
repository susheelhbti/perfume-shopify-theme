/* ==========================================================
   hero-particles.js — sections/hero-banner.liquid particles
   No dependencies (works standalone).
   ========================================================== */
(function () {
  'use strict';

  function initHeroParticles() {
    var particlesEl = document.querySelector('#hero-particles');
    if (!particlesEl || particlesEl.getAttribute('data-initialized')) return;
    particlesEl.setAttribute('data-initialized', 'true');

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (window.tsParticles && typeof window.loadSlim === 'function') {
      window.loadSlim(window.tsParticles).then(function () {
        return window.tsParticles.load({
          id: 'hero-particles',
          options: {
            fullScreen: { enable: false },
            background: { color: { value: 'transparent' } },
            particles: {
              number: { value: 40, density: { enable: true, width: 1200, height: 900 } },
              color: { value: ['#c6a56b', '#e8d9bb', '#ffffff'] },
              opacity: { value: { min: 0.08, max: 0.45 }, animation: { enable: true, speed: 0.4, sync: false } },
              size: { value: { min: 0.6, max: 2.4 } },
              move: { enable: true, speed: { min: 0.15, max: 0.5 }, direction: 'top', straight: false, random: true, outModes: { default: 'out' } },
              links: { enable: false },
              shape: { type: 'circle' }
            },
            detectRetina: true
          }
        });
      }).catch(function () {
        particlesEl.classList.add('particles-fallback');
      });
    } else {
      particlesEl.classList.add('particles-fallback');
    }
  }

  window.NOXR = window.NOXR || {};
  window.NOXR.initHeroParticles = initHeroParticles;
})();
