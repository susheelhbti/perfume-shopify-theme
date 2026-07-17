/* ==========================================================
   cart-drawer.js — public open()/close() API for the cart drawer.

   The drawer's actual UI state (open/closed, item selection,
   quantities, wishlist-move, clear-all, checkout-selected) now
   lives entirely in the Alpine x-data block inside
   sections/cart-drawer.liquid — it subscribes to window.NOXR.Cart
   directly, so there's no separate fetch/render step here.

   This file just gives other scripts (product-card.js,
   product-detail.js, etc.) a stable window.NOXR.CartDrawer.open()
   / .close() to call, implemented as window events the Alpine
   component already listens for ('open-cart-drawer' /
   'close-cart-drawer'). Keeping this as events (rather than
   reaching into Alpine's data directly) avoids fighting Alpine's
   reactive :class binding on the drawer root.

   Depends on: utils.js
   ========================================================== */
(function () {
  'use strict';
  var qs = window.NOXR.qs;

  var CartDrawer = {
    open: function () {
      var drawer = qs('[data-cart-drawer]');
      if (!drawer) {
        window.location.href = '/cart';
        return;
      }
      document.dispatchEvent(new Event('open-cart-drawer'));
    },
    close: function () {
      document.dispatchEvent(new Event('close-cart-drawer'));
    }
  };

  window.NOXR = window.NOXR || {};
  window.NOXR.CartDrawer = CartDrawer;

  /* Global Escape key closes the drawer (and mobile nav, if open) */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var drawerEl = qs('[data-cart-drawer]');
    if (drawerEl && drawerEl.classList.contains('open')) {
      CartDrawer.close();
    }
    var navEl = qs('[data-mobile-nav-panel]');
    if (navEl && navEl.classList.contains('open') && window.Alpine) {
      var navData = window.Alpine.$data(navEl);
      if (navData && navData.close) navData.close();
    }
  });
})();
