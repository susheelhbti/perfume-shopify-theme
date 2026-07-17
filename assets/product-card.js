/* ==========================================================
   product-card.js — quick-add-to-cart + wishlist toggle for
   snippets/product-card.liquid instances
   Depends on: utils.js, cart-state.js, cart-drawer.js
   ========================================================== */
(function () {
  'use strict';
  var qsa = window.NOXR.qsa;
  var CartState = window.NOXR.Cart;
  var updateUI = window.NOXR.updateUI;
  var getWishlist = window.NOXR.getWishlist;

  function initProductCards(root) {
    qsa('[data-product-card]', root || document).forEach(function (card) {
      if (card.getAttribute('data-bound')) return;
      card.setAttribute('data-bound', 'true');
      bindQuickAdd(card);
      bindWishlist(card);
    });
  }

  function bindQuickAdd(card) {
    var form = card.querySelector('.product-form--overlay');
    if (!form || form.getAttribute('data-bound')) return;
    form.setAttribute('data-bound', 'true');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('[data-add-cart]');
      var idInput = form.querySelector('input[name="id"]');
      var id = (idInput && idInput.value) ||
               (btn && btn.getAttribute('data-variant-id')) ||
               card.getAttribute('data-variant-id');

      if (!id) return;

      var label = btn ? btn.querySelector('.btn-label') : null;
      var originalText = label ? label.textContent : '';
      if (btn) btn.disabled = true;

      CartState.add(id, 1)
        .then(function (cart) {
          if (btn) {
            btn.classList.add('added');
            if (label) label.textContent = 'Added ✓';
          }
          updateUI(cart);
          window.NOXR.CartDrawer.open();
          setTimeout(function () {
            if (btn) {
              btn.classList.remove('added');
              btn.disabled = false;
              if (label) label.textContent = originalText;
            }
          }, 1600);
        })
        .catch(function () {
          if (btn) {
            btn.disabled = false;
            if (label) label.textContent = 'Try again';
            setTimeout(function () {
              if (label) label.textContent = originalText;
            }, 1600);
          }
        });
    });
  }

  function bindWishlist(card) {
    var btn = card.querySelector('[data-wishlist]');
    if (!btn || btn.getAttribute('data-bound')) return;
    btn.setAttribute('data-bound', 'true');

    var productId = String(btn.getAttribute('data-wishlist'));
    var isActive = getWishlist().indexOf(productId) !== -1;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');

    btn.addEventListener('click', function () {
      var active = window.NOXR.toggleWishlist(productId);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  window.NOXR.initProductCards = initProductCards;
})();
