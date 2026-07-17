/* ==========================================================
   theme.js — main orchestrator, loaded LAST by layout/theme.liquid.
   Only wires up: DOM-ready init, section-reload re-init, and
   the cart-open triggers. All actual behavior lives in the
   files below, each exposing an init function on window.NOXR:

     utils.js               → qs, qsa, formatMoney, debounce, wishlist
     svg.js                 → bottleSVG/smokeSVG + initSVGInjections
     cart-state.js           → NOXR.Cart, updateUI
     cart-selection.js       → initCartSelection
     cart-drawer.js          → NOXR.CartDrawer
     cart-page.js            → initCartPage
     product-card.js         → initProductCards
     product-detail.js       → initProductDetail
     header-nav.js           → initHeaderNav
     hero-particles.js       → initHeroParticles
     collections-tilt.js     → initCardTilt
     discount.js             → initDiscountHandler
     share.js                → initShareCopyLink
     accordion.js            → initAccordions
     newsletter.js           → initNewsletterForms
     reveal-lazy.js          → initRevealOnScroll, initLazyImages
     alpine-components.js    → Alpine.data(...) registrations

   Load order (see layout/theme.liquid): utils, svg, cart-state,
   cart-selection, cart-drawer, cart-page, product-card,
   product-detail, header-nav, hero-particles, collections-tilt,
   discount, share, accordion, newsletter, reveal-lazy,
   alpine-components, theme (this file).
   ========================================================== */
(function () {
  'use strict';
  var qs = window.NOXR.qs;
  var qsa = window.NOXR.qsa;
  var CartState = window.NOXR.Cart;
  var CartDrawer = window.NOXR.CartDrawer;
  var updateUI = window.NOXR.updateUI;

  function initAll() {
    window.NOXR.initSVGInjections();
    window.NOXR.initLazyImages();
    window.NOXR.initRevealOnScroll();
    window.NOXR.initAccordions();
    window.NOXR.initNewsletterForms();

    window.NOXR.initHeaderNav();

    window.NOXR.initHeroParticles();
    window.NOXR.initCardTilt();

    // Note: marquee behavior is initialized by assets/marquee.js,
    // loaded directly by sections/marquee.liquid.

    window.NOXR.initCartSelection();
    CartState.fetch();
    CartState.subscribe(updateUI);

    qsa('[data-cart-open]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        CartDrawer.open();
      });
    });

    var overlay = qs('[data-cart-overlay]');
    if (overlay) {
      overlay.addEventListener('click', CartDrawer.close);
    }

    window.NOXR.initProductCards();
    window.NOXR.initProductDetail();
    window.NOXR.initCartPage();
    window.NOXR.initDiscountHandler();
    window.NOXR.initShareCopyLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', function () {
    initAll();
  });

  window.NOXR.initAll = initAll;
})();
