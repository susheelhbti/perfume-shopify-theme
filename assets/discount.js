/* ==========================================================
   discount.js — apply a discount code to the cart
   Depends on: utils.js, cart-state.js
   ========================================================== */
(function () {
  'use strict';
  var qs = window.NOXR.qs;
  var CartState = window.NOXR.Cart;
  var updateUI = window.NOXR.updateUI;

  function initDiscountHandler() {
    var form = qs('[data-discount-form]');
    if (!form || form.getAttribute('data-bound')) return;
    form.setAttribute('data-bound', 'true');

    var input = qs('[data-discount-input]', form);
    var submitBtn = qs('[data-discount-apply]', form);
    var message = qs('[data-discount-message]', form);

    if (!input || !submitBtn) return;

    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var code = input.value.trim();
      if (!code) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Applying...';

      CartState.applyDiscount(code)
        .then(function (cart) {
          updateUI(cart);
          if (message) {
            message.textContent = 'Discount applied successfully!';
            message.className = 'discount-success visible';
          }
          input.value = '';
        })
        .catch(function (err) {
          if (message) {
            message.textContent = err.message || 'Invalid discount code.';
            message.className = 'discount-error visible';
          }
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Apply';
        });
    });
  }

  window.NOXR.initDiscountHandler = initDiscountHandler;
})();
