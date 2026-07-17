/* ==========================================================
   cart-page.js — quantity steppers, remove, order-note saving
   on templates/cart.json (sections/main-cart.liquid)
   Depends on: utils.js, cart-state.js
   ========================================================== */
(function () {
  'use strict';
  var qs = window.NOXR.qs;
  var qsa = window.NOXR.qsa;
  var debounce = window.NOXR.debounce;
  var formatMoney = window.NOXR.formatMoney;
  var CartState = window.NOXR.Cart;
  var updateUI = window.NOXR.updateUI;

  function initCartPage() {
    var root = qs('[data-cart-root]');
    if (!root) return;

    document.documentElement.classList.add('js-enabled');

    qsa('[data-cart-qty]', root).forEach(function (stepper) {
      if (stepper.getAttribute('data-bound')) return;
      stepper.setAttribute('data-bound', 'true');

      var input = qs('[data-cart-qty-input]', stepper);
      var minus = qs('[data-cart-minus]', stepper);
      var plus = qs('[data-cart-plus]', stepper);
      if (!input || !minus || !plus) return;

      var line = parseInt(input.getAttribute('data-line'), 10);

      var update = debounce(function (qty) {
        var row = qs('[data-cart-row][data-line="' + line + '"]');
        if (row) row.classList.add('is-updating');

        CartState.updateItem(line, qty)
          .then(function (cart) {
            if (row) row.classList.remove('is-updating');
            updateUI(cart);
          })
          .catch(function () {
            if (row) row.classList.remove('is-updating');
            window.location.reload();
          });
      }, 350);

      minus.addEventListener('click', function () {
        var val = Math.max(0, parseInt(input.value, 10) - 1);
        input.value = val;
        update(val);
      });

      plus.addEventListener('click', function () {
        var val = Math.min(99, parseInt(input.value, 10) + 1);
        input.value = val;
        update(val);
      });

      input.addEventListener('change', function () {
        var val = Math.max(0, parseInt(input.value, 10) || 0);
        input.value = val;
        update(val);
      });
    });

    qsa('[data-cart-remove]', root).forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var line = parseInt(link.getAttribute('data-line'), 10);
        var row = qs('[data-cart-row][data-line="' + line + '"]');
        if (row) row.classList.add('is-updating');

        CartState.updateItem(line, 0)
          .then(function () {
            window.location.reload();
          })
          .catch(function () {
            window.location.href = link.href;
          });
      });
    });

    var note = qs('[data-cart-note]');
    if (note) {
      var saveNote = debounce(function () {
        CartState.updateNote(note.value).catch(function () {});
      }, 500);
      note.addEventListener('change', saveNote);
      note.addEventListener('input', saveNote);
    }

    CartState.subscribe(function (cart) {
      if (cart && cart.items) {
        cart.items.forEach(function (item, index) {
          var line = index + 1;
          var totalCell = qs('[data-line-total][data-line="' + line + '"]');
          if (totalCell) {
            var format = totalCell.getAttribute('data-money-format') || '₹{{amount}}';
            totalCell.textContent = formatMoney(item.final_line_price, format);
          }
        });
      }
    });
  }

  window.NOXR.initCartPage = initCartPage;
})();
