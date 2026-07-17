/* ==========================================================
   product-detail.js — sections/main-product.liquid behavior
   Depends on: utils.js, cart-state.js, cart-drawer.js
   ========================================================== */
(function () {
  'use strict';
  var qs = window.NOXR.qs;
  var qsa = window.NOXR.qsa;
  var formatMoney = window.NOXR.formatMoney;
  var CartState = window.NOXR.Cart;
  var updateUI = window.NOXR.updateUI;

  function initProductDetail() {
    var root = qs('[data-product-form-root]');
    if (!root) return;

    var variantsJson = root.getAttribute('data-variants');
    var variants = [];
    try { variants = JSON.parse(variantsJson); } catch (e) {}

    var translationsJson = root.getAttribute('data-translations');
    var translations = {
      add_to_cart: 'Add to Bag',
      sold_out: 'Sold Out',
      unavailable: 'Unavailable',
      save: 'Save {{ percentage }}%'
    };
    try { translations = JSON.parse(translationsJson); } catch (e) {}

    bindVariantPicker(root, variants, translations);
    bindPDPQuantity(root);
    bindPDPAddToCart(root);
    bindStickyBar(root);
  }

  function bindVariantPicker(root, variants, translations) {
    var optionGroups = qsa('[data-option-index]', root);
    var idInput = qs('[data-variant-id-input]', root);
    var priceEl = qs('[data-price]', root);
    var comparePriceEl = qs('[data-compare-price]', root);
    var saveBadge = qs('[data-save-badge]', root);
    var addBtn = qs('[data-add-button]', root);
    var addBtnText = qs('[data-add-button-text]', root);
    var stickyBar = qs('[data-sticky-bar]');
    var moneyFormat = root.getAttribute('data-money-format');

    function currentSelections() {
      return optionGroups.map(function (group) {
        var selected = qs('.size-pill.is-active', group);
        return selected ? selected.getAttribute('data-value') : null;
      });
    }

    function findVariant(selections) {
      return variants.filter(function (v) {
        return v.options.every(function (opt, i) { return opt === selections[i]; });
      })[0];
    }

    function updateUIVariant() {
      var selections = currentSelections();
      var variant = findVariant(selections);

      optionGroups.forEach(function (group) {
        qsa('.size-pill', group).forEach(function (btn) {
          btn.classList.remove('unavailable');
        });
      });

      if (!variant) {
        if (addBtn) addBtn.disabled = true;
        if (addBtnText) addBtnText.textContent = translations.unavailable || 'Unavailable';
        return;
      }

      if (idInput) idInput.value = variant.id;
      if (priceEl) priceEl.textContent = formatMoney(variant.price, moneyFormat);

      if (comparePriceEl) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          comparePriceEl.textContent = formatMoney(variant.compare_at_price, moneyFormat);
          comparePriceEl.style.display = '';
          if (saveBadge) {
            var pct = Math.round((1 - variant.price / variant.compare_at_price) * 100);
            var saveText = translations.save || 'Save {{ percentage }}%';
            saveBadge.textContent = saveText.replace('{{ percentage }}', pct);
            saveBadge.style.display = '';
          }
        } else {
          comparePriceEl.style.display = 'none';
          if (saveBadge) saveBadge.style.display = 'none';
        }
      }

      if (addBtn) {
        addBtn.disabled = !variant.available;
        if (addBtnText) {
          addBtnText.textContent = variant.available
            ? (translations.add_to_cart || 'Add to Bag')
            : (translations.sold_out || 'Sold Out');
        }
      }

      var priceNode = qs('[data-sticky-price]', stickyBar);
      if (priceNode) {
        priceNode.textContent = formatMoney(variant.price, moneyFormat);
      }

      if (window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url);
      }
    }

    optionGroups.forEach(function (group) {
      qsa('.size-pill', group).forEach(function (btn) {
        if (btn.getAttribute('data-bound')) return;
        btn.setAttribute('data-bound', 'true');
        btn.addEventListener('click', function () {
          if (btn.classList.contains('unavailable')) return;
          qsa('.size-pill', group).forEach(function (b) {
            b.classList.remove('is-active');
          });
          btn.classList.add('is-active');
          updateUIVariant();
        });
      });
    });

    updateUIVariant();
  }

  function bindPDPQuantity(root) {
    var stepper = root.querySelector('[data-pdp-qty]');
    if (!stepper || stepper.getAttribute('data-bound')) return;
    stepper.setAttribute('data-bound', 'true');

    var input = stepper.querySelector('[data-pdp-qty-value]');
    var minus = stepper.querySelector('[data-pdp-minus]');
    var plus = stepper.querySelector('[data-pdp-plus]');

    if (!input || !minus || !plus) return;

    function updateValue(delta) {
      var current = parseInt(input.value, 10) || 1;
      var newVal = Math.max(1, Math.min(99, current + delta));
      input.value = newVal;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    minus.addEventListener('click', function (e) {
      e.preventDefault();
      updateValue(-1);
    });

    plus.addEventListener('click', function (e) {
      e.preventDefault();
      updateValue(1);
    });

    input.addEventListener('change', function () {
      var val = parseInt(input.value, 10);
      if (isNaN(val) || val < 1) input.value = 1;
      if (val > 99) input.value = 99;
    });
  }

  function bindPDPAddToCart(root) {
    var form = qs('[data-add-to-cart-form]', root);
    if (!form || form.getAttribute('data-bound')) return;
    form.setAttribute('data-bound', 'true');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('[type="submit"]');
      var errorEl = qs('.pd-form-error', form.parentNode);
      var idInput = form.querySelector('[name="id"]');
      var qtyInput = form.querySelector('[name="quantity"]');

      var id = idInput ? idInput.value : null;
      var qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

      if (!id) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading-spinner"></span>';
      }

      CartState.add(id, qty)
        .then(function (cart) {
          updateUI(cart);
          if (errorEl) errorEl.classList.remove('visible');
          window.NOXR.CartDrawer.open();
        })
        .catch(function (err) {
          if (errorEl) {
            errorEl.textContent = (err && err.description) || 'Could not add this item to your bag.';
            errorEl.classList.add('visible');
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalHtml;
          }
        });
    });
  }

  function bindStickyBar(root) {
    var bar = qs('[data-sticky-bar]');
    if (!bar || bar.getAttribute('data-bound')) return;
    bar.setAttribute('data-bound', 'true');

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          bar.classList.toggle('visible', !entry.isIntersecting);
        });
      }, { rootMargin: '-120px 0px 0px 0px' });

      observer.observe(root);
    }

    var stickyAddBtn = qs('[data-sticky-add]', bar);
    var mainForm = qs('[data-add-to-cart-form]', root);
    if (stickyAddBtn && mainForm) {
      stickyAddBtn.addEventListener('click', function () {
        mainForm.dispatchEvent(new Event('submit', { cancelable: true }));
      });
    }
  }

  window.NOXR.initProductDetail = initProductDetail;
})();
