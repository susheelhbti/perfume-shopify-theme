/* ==========================================================
   cart-state.js — single source of truth for the cart, and
   the small UI updaters (badge, shipping bar, subtotal) that
   every cart-aware component subscribes to.
   Depends on: utils.js
   ========================================================== */
(function () {
  'use strict';
  var qs = window.NOXR.qs;
  var qsa = window.NOXR.qsa;
  var formatMoney = window.NOXR.formatMoney;

  var CartState = {
    data: null,
    listeners: [],
    isUpdating: false,

    fetch: function () {
      return fetch('/cart.js', { headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to fetch cart');
          return res.json();
        })
        .then(function (cart) {
          CartState.data = cart;
          CartState.notify();
          return cart;
        })
        .catch(function (err) {
          console.error('Cart fetch error:', err);
          return CartState.data || { item_count: 0, items: [], total_price: 0 };
        });
    },

    add: function (id, quantity, properties) {
      if (CartState.isUpdating) return Promise.reject(new Error('Cart is updating'));

      var body = { items: [{ id: id, quantity: quantity || 1 }] };
      if (properties) body.items[0].properties = properties;

      CartState.isUpdating = true;

      return fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (res) {
          if (!res.ok) return res.json().then(function (err) { throw err; });
          return res.json();
        })
        .then(function (cart) {
          CartState.data = cart;
          CartState.isUpdating = false;
          CartState.notify();
          return cart;
        })
        .catch(function (err) {
          CartState.isUpdating = false;
          throw err;
        });
    },

    updateItem: function (line, quantity) {
      if (CartState.isUpdating) return Promise.reject(new Error('Cart is updating'));

      CartState.isUpdating = true;

      return fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line: line, quantity: quantity })
      })
        .then(function (res) {
          if (!res.ok) return res.json().then(function (err) { throw err; });
          return res.json();
        })
        .then(function (cart) {
          CartState.data = cart;
          CartState.isUpdating = false;
          CartState.notify();
          return cart;
        })
        .catch(function (err) {
          CartState.isUpdating = false;
          throw err;
        });
    },

    updateNote: function (note) {
      return fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ note: note })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to update note');
          return res.json();
        })
        .then(function (cart) {
          CartState.data = cart;
          CartState.notify();
          return cart;
        });
    },

    applyDiscount: function (code) {
      return fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ attributes: { discount_code: code } })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Invalid discount code');
          return res.json();
        })
        .then(function (cart) {
          CartState.data = cart;
          CartState.notify();
          return cart;
        });
    },

    subscribe: function (callback) {
      CartState.listeners.push(callback);
      if (CartState.data) callback(CartState.data);
      return function () {
        var index = CartState.listeners.indexOf(callback);
        if (index > -1) CartState.listeners.splice(index, 1);
      };
    },

    notify: function () {
      var data = CartState.data || { item_count: 0, items: [], total_price: 0 };
      CartState.listeners.forEach(function (fn) {
        try { fn(data); } catch (e) { /* ignore listener errors */ }
      });
    },

    get: function () {
      return CartState.data || { item_count: 0, items: [], total_price: 0 };
    },

    isEmpty: function () {
      return !CartState.data || CartState.data.item_count === 0;
    },

    getSubtotal: function () {
      return CartState.data ? CartState.data.total_price : 0;
    },

    getItemCount: function () {
      return CartState.data ? CartState.data.item_count : 0;
    }
  };

  window.NOXR.Cart = CartState;

  /* ---------- Shared UI updates (badge / shipping bar / subtotal) ---------- */

  function updateCartBadge(cart) {
    var count = cart ? cart.item_count : 0;
    qsa('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.style.display = count > 0 ? '' : 'none';
    });
  }

  function updateShippingBar(cart) {
    var bar = qs('[data-shipping-bar]');
    if (!bar) return;

    var threshold = parseInt(bar.getAttribute('data-threshold'), 10) || 0;
    var totalCents = cart ? cart.total_price : 0;
    var fill = qs('[data-shipping-fill]', bar);
    var message = qs('[data-shipping-message]', bar);
    var remaining = Math.max(0, threshold - totalCents);

    if (fill) {
      var pct = threshold > 0 ? Math.min(100, Math.round((totalCents / threshold) * 100)) : 100;
      fill.style.width = pct + '%';
    }
    if (message) {
      var format = bar.getAttribute('data-money-format') || '₹{{amount}}';
      message.textContent = remaining > 0
        ? "You're " + formatMoney(remaining, format) + ' away from free shipping.'
        : "You've unlocked free shipping!";
    }
  }

  function updateCartSummary(cart) {
    var subtotal = qs('[data-cart-subtotal]');
    if (subtotal) {
      var format = subtotal.getAttribute('data-money-format') || '₹{{amount}}';
      subtotal.textContent = cart ? formatMoney(cart.total_price, format) : '₹0.00';
    }
  }

  function updateUI(cart) {
    updateCartBadge(cart);
    updateShippingBar(cart);
    updateCartSummary(cart);
  }

  window.NOXR.updateUI = updateUI;
})();
