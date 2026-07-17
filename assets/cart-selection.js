/* ==========================================================
   cart-selection.js — "select items", "move to wishlist",
   "clear all" and "checkout selected" behavior on the cart page.
   Depends on: utils.js, cart-state.js
   ========================================================== */
(function () {
  'use strict';
  var formatMoney = window.NOXR.formatMoney;
  var CartState = window.NOXR.Cart;
  var toggleWishlist = window.NOXR.toggleWishlist;

  function initCartSelection() {
    var root = document.querySelector('[data-cart-root]');
    if (!root) return;

    function getSelectedLines() {
      var checkboxes = root.querySelectorAll('.cart-item-select:checked');
      var lines = [];
      checkboxes.forEach(function (cb) {
        lines.push(parseInt(cb.getAttribute('data-line'), 10));
      });
      return lines;
    }

    function updateSelectedTotals() {
      var selected = getSelectedLines();
      var totalCents = 0;
      var rows = root.querySelectorAll('[data-cart-row]');
      rows.forEach(function (row) {
        var line = parseInt(row.getAttribute('data-line'), 10);
        var totalEl = row.querySelector('[data-line-total]');
        if (totalEl) {
          var priceCents = parseInt(totalEl.textContent.replace(/[^0-9]/g, ''), 10) || 0;
          if (selected.indexOf(line) !== -1) {
            totalCents += priceCents;
          }
        }
      });
      var selectedSubtotalEl = root.querySelector('[data-selected-subtotal]');
      if (selectedSubtotalEl) {
        var format = selectedSubtotalEl.closest('[data-money-format]')?.getAttribute('data-money-format') || '₹{{amount}}';
        selectedSubtotalEl.textContent = formatMoney(totalCents, format);
      }
    }

    root.querySelectorAll('.cart-item-select').forEach(function (cb) {
      cb.addEventListener('change', updateSelectedTotals);
    });

    updateSelectedTotals();

    root.querySelectorAll('.btn-wishlist-move').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var line = parseInt(btn.getAttribute('data-line'), 10);
        var productId = btn.getAttribute('data-product-id');
        toggleWishlist(productId);
        CartState.updateItem(line, 0)
          .then(function () { /* handled by subscription */ })
          .catch(function () { window.location.reload(); });
      });
    });

    var clearAllBtn = root.querySelector('[data-clear-all]');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function () {
        if (!confirm('Remove all items from your bag?')) return;
        var rows = root.querySelectorAll('[data-cart-row]');
        var lineNumbers = [];
        rows.forEach(function (row) {
          lineNumbers.push(parseInt(row.getAttribute('data-line'), 10));
        });
        var promises = lineNumbers.map(function (line) {
          return CartState.updateItem(line, 0);
        });
        Promise.all(promises)
          .then(function () { window.location.reload(); })
          .catch(function () { window.location.reload(); });
      });
    }

    var checkoutSelectedBtn = root.querySelector('[data-checkout-selected]');
    if (checkoutSelectedBtn) {
      checkoutSelectedBtn.addEventListener('click', function () {
        var selected = getSelectedLines();
        if (selected.length === 0) {
          alert('Please select at least one item to checkout.');
          return;
        }
        var rows = root.querySelectorAll('[data-cart-row]');
        var unselectedLines = [];
        rows.forEach(function (row) {
          var line = parseInt(row.getAttribute('data-line'), 10);
          if (selected.indexOf(line) === -1) {
            unselectedLines.push(line);
            var productId = row.querySelector('.btn-wishlist-move')?.getAttribute('data-product-id');
            if (productId) toggleWishlist(productId);
          }
        });
        var promises = unselectedLines.map(function (line) {
          return CartState.updateItem(line, 0);
        });
        Promise.all(promises)
          .then(function () { window.location.href = '/cart/checkout'; })
          .catch(function () { window.location.reload(); });
      });
    }

    document.addEventListener('shopify:section:load', function () {
      var root2 = document.querySelector('[data-cart-root]');
      if (!root2) return;
      root2.querySelectorAll('.cart-item-select:not([data-bound])').forEach(function (cb) {
        cb.setAttribute('data-bound', 'true');
        cb.addEventListener('change', updateSelectedTotals);
      });
      root2.querySelectorAll('.btn-wishlist-move:not([data-bound])').forEach(function (btn) {
        btn.setAttribute('data-bound', 'true');
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var line = parseInt(btn.getAttribute('data-line'), 10);
          var productId = btn.getAttribute('data-product-id');
          toggleWishlist(productId);
          CartState.updateItem(line, 0)
            .then(function () {})
            .catch(function () { window.location.reload(); });
        });
      });
    });
  }

  window.NOXR.initCartSelection = initCartSelection;
})();
