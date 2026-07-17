/* ==========================================================
   MARQUEE.JS — standalone scrolling strip behavior
   Loaded directly by sections/marquee.liquid via asset_url.
   Also safe to run alongside theme.js (idempotent — guards
   against double-binding via a data attribute).
   ========================================================== */
(function () {
  'use strict';

  function initMarquee() {
    var marquee = document.querySelector('.marquee-strip');
    if (!marquee || marquee.getAttribute('data-marquee-bound')) return;
    marquee.setAttribute('data-marquee-bound', 'true');

    var shimmer = document.createElement('div');
    shimmer.className = 'shimmer-overlay';
    marquee.appendChild(shimmer);

    function updateSpeed() {
      var width = window.innerWidth;
      var speed = 30;
      if (width < 480) speed = 20;
      else if (width < 768) speed = 25;

      var inner = marquee.querySelector('.marquee-inner');
      if (inner) {
        inner.style.animationDuration = speed + 's';
      }
    }

    updateSpeed();
    window.addEventListener('resize', updateSpeed);

    marquee.addEventListener('mouseenter', function () {
      var inner = this.querySelector('.marquee-inner');
      if (inner) inner.style.animationPlayState = 'paused';
    });

    marquee.addEventListener('mouseleave', function () {
      var inner = this.querySelector('.marquee-inner');
      if (inner) inner.style.animationPlayState = 'running';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMarquee);
  } else {
    initMarquee();
  }

  document.addEventListener('shopify:section:load', initMarquee);

  window.NOXR = window.NOXR || {};
  window.NOXR.initMarquee = initMarquee;
})();
