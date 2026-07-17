/* ==========================================================
   collections-tilt.js — sections/collections-grid.liquid
   3D mouse-tilt (base.css fallback version). The section's own
   inline <style>/<script> block handles the newer per-instance
   version; this covers the shared .collection-card markup.
   No dependencies (works standalone).
   ========================================================== */
(function () {
  'use strict';

  function initCardTilt() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var supportsHover = window.matchMedia('(hover: hover)').matches;
    if (prefersReducedMotion || !supportsHover) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll('.collection-card'));
    cards.forEach(function (card) {
      if (card.getAttribute('data-tilt-bound')) return;
      card.setAttribute('data-tilt-bound', 'true');
      var maxTilt = 7;

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (px - 0.5) * maxTilt * 2;
        var ry = (0.5 - py) * maxTilt * 2;
        card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });

      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  window.NOXR = window.NOXR || {};
  window.NOXR.initCardTilt = initCardTilt;
})();
