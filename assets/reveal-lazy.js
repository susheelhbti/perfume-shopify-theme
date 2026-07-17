/* ==========================================================
   reveal-lazy.js — .reveal/.reveal-flip scroll animations
   and lazy <img loading="lazy"> loading.
   No dependencies (works standalone).
   ========================================================== */
(function () {
  'use strict';

  function initRevealOnScroll() {
    var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal, .reveal-flip'));
    if (!revealEls.length) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      revealEls.forEach(function (el) {
        if (!el.classList.contains('is-visible')) io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  }

  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;

    var lazyImages = Array.prototype.slice.call(document.querySelectorAll('img[loading="lazy"]'));
    var imageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });

    lazyImages.forEach(function (img) {
      imageObserver.observe(img);
    });
  }

  window.NOXR = window.NOXR || {};
  window.NOXR.initRevealOnScroll = initRevealOnScroll;
  window.NOXR.initLazyImages = initLazyImages;
})();
