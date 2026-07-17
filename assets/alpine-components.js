/* ==========================================================
   alpine-components.js — all Alpine.data(...) registrations
   Runs on the 'alpine:init' event, so load order relative to
   Alpine's own <script> just needs to be "before Alpine parses
   the DOM" — i.e. this file (and the CDN Alpine script) should
   both be present with `defer`, which theme.liquid already does.
   Depends on: utils.js, cart-state.js, cart-drawer.js
   ========================================================== */
document.addEventListener('alpine:init', function () {
  'use strict';

  Alpine.data('quantity', function (initial, min, max) {
    return {
      qty: initial || 1,
      increment: function () {
        if (this.qty < (max || 99)) this.qty++;
      },
      decrement: function () {
        if (this.qty > (min || 1)) this.qty--;
      },
      update: function (event) {
        var val = parseInt(event.target.value, 10);
        if (isNaN(val) || val < (min || 1)) this.qty = min || 1;
        if (val > (max || 99)) this.qty = max || 99;
      }
    };
  });

  Alpine.data('cartDrawer', function () {
    return {
      open: false,
      cart: { item_count: 0, items: [], total_price: 0 },

      init: function () {
        if (window.NOXR && window.NOXR.Cart) {
          window.NOXR.Cart.subscribe(function (cart) {
            this.cart = cart || { item_count: 0, items: [], total_price: 0 };
          }.bind(this));
          window.NOXR.Cart.fetch().then(function (cart) {
            this.cart = cart;
          }.bind(this));
        }
        document.addEventListener('open-cart-drawer', function () {
          this.openDrawer();
        }.bind(this));
      },

      toggle: function () {
        this.open = !this.open;
        document.body.classList.toggle('cart-drawer-open', this.open);
        if (this.open) this.fetchCart();
      },

      openDrawer: function () {
        this.open = true;
        document.body.classList.add('cart-drawer-open');
        this.fetchCart();
      },

      closeDrawer: function () {
        this.open = false;
        document.body.classList.remove('cart-drawer-open');
      },

      fetchCart: function () {
        if (window.NOXR && window.NOXR.Cart) {
          window.NOXR.Cart.fetch().then(function (cart) {
            this.cart = cart;
          }.bind(this));
        }
      },

      updateQuantity: function (line, qty) {
        if (window.NOXR && window.NOXR.Cart) {
          window.NOXR.Cart.updateItem(line, qty).then(function (cart) {
            this.cart = cart;
            if (window.NOXR.updateUI) window.NOXR.updateUI(cart);
          }.bind(this));
        }
      },

      removeItem: function (line) {
        if (window.NOXR && window.NOXR.Cart) {
          window.NOXR.Cart.updateItem(line, 0).then(function (cart) {
            this.cart = cart;
            if (window.NOXR.updateUI) window.NOXR.updateUI(cart);
          }.bind(this));
        }
      },

      formatMoney: function (cents) {
        if (window.NOXR && window.NOXR.formatMoney) {
          return window.NOXR.formatMoney(cents);
        }
        return '₹' + (cents / 100).toFixed(2);
      },

      get shippingMessage() {
        var threshold = 15000;
        var total = this.cart.total_price || 0;
        var remaining = threshold - total;
        if (remaining <= 0) return "You've unlocked free shipping!";
        return "You're " + this.formatMoney(remaining) + ' away from free shipping.';
      },

      get shippingProgress() {
        var threshold = 15000;
        var total = this.cart.total_price || 0;
        return Math.min(100, Math.round((total / threshold) * 100));
      },

      get isEmpty() {
        return (this.cart.item_count || 0) === 0;
      },

      get subtotal() {
        return this.cart.total_price || 0;
      }
    };
  });

  Alpine.data('productCard', function (product) {
    return {
      product: product || { id: null, variantId: null, title: '', available: true },
      added: false,
      wishlist: false,

      init: function () {
        if (window.NOXR && window.NOXR.getWishlist) {
          this.wishlist = window.NOXR.getWishlist().indexOf(String(this.product.id)) !== -1;
        }
      },

      addToCart: function () {
        if (this.added) return;
        this.added = true;

        var variantId = this.product.variantId || this.product.id;
        if (!variantId) return;

        if (window.NOXR && window.NOXR.Cart) {
          window.NOXR.Cart.add(variantId, 1)
            .then(function (cart) {
              if (window.NOXR.updateUI) window.NOXR.updateUI(cart);
              document.dispatchEvent(new Event('open-cart-drawer'));
              setTimeout(function () { this.added = false; }.bind(this), 1600);
            }.bind(this))
            .catch(function () { this.added = false; }.bind(this));
        }
      },

      toggleWishlist: function () {
        if (window.NOXR && window.NOXR.toggleWishlist) {
          this.wishlist = window.NOXR.toggleWishlist(this.product.id);
        }
      }
    };
  });

  Alpine.data('mobileNav', function () {
    return {
      open: false,
      toggle: function () {
        this.open = !this.open;
        document.body.style.overflow = this.open ? 'hidden' : '';
      },
      close: function () {
        this.open = false;
        document.body.style.overflow = '';
      }
    };
  });

  Alpine.data('scrollIndicator', function () {
    return {
      scrolled: false,
      init: function () {
        window.addEventListener('scroll', function () {
          this.scrolled = window.scrollY > 40;
        }.bind(this), { passive: true });
      }
    };
  });

  Alpine.data('accordion', function () {
    return {
      open: false,
      toggle: function () { this.open = !this.open; }
    };
  });

  Alpine.data('newsletter', function () {
    return {
      email: '',
      status: '',
      message: '',

      submit: function () {
        if (!this.email || this.email.indexOf('@') === -1) {
          this.status = 'error';
          this.message = 'Please enter a valid email address.';
          return;
        }

        var formData = new FormData();
        formData.append('contact[email]', this.email);
        formData.append('contact[tags]', 'newsletter');

        fetch('/contact', { method: 'POST', body: formData })
          .then(function (res) {
            if (res.ok) {
              this.status = 'success';
              this.message = 'Thank you for subscribing!';
              this.email = '';
            } else {
              throw new Error('Failed to subscribe');
            }
          }.bind(this))
          .catch(function () {
            this.status = 'error';
            this.message = 'Something went wrong. Please try again.';
          }.bind(this));
      }
    };
  });

  Alpine.data('productDetail', function () {
    return {
      variants: [],
      selectedVariant: null,
      selectedOptions: {},
      quantity: 1,
      init() {
        const root = document.querySelector('[data-product-root]');
        if (root) {
          this.variants = JSON.parse(root.getAttribute('data-variants') || '[]');
          this.selectedVariant = this.variants[0] || null;
          this.updateUI();
        }
      },
      selectOption(index, value) {
        this.selectedOptions[index] = value;
        this.updateVariant();
      },
      updateVariant() {
        const selections = Object.values(this.selectedOptions);
        this.selectedVariant = this.variants.find(v =>
          v.options.every((opt, i) => opt === selections[i])
        ) || null;
        this.updateUI();
      },
      updateUI() {
        const priceEl = document.querySelector('[data-price]');
        const comparePriceEl = document.querySelector('[data-compare-price]');
        const saveBadge = document.querySelector('[data-save-badge]');
        const idInput = document.querySelector('[data-variant-id-input]');
        const addBtn = document.querySelector('[data-add-button]');
        const addBtnText = document.querySelector('[data-add-button-text]');
        const stickyPrice = document.querySelector('[data-sticky-price]');
        if (idInput && this.selectedVariant) idInput.value = this.selectedVariant.id;
        if (priceEl && this.selectedVariant) priceEl.textContent = this.formatMoney(this.selectedVariant.price);
        if (comparePriceEl && this.selectedVariant) {
          if (this.selectedVariant.compare_at_price > this.selectedVariant.price) {
            comparePriceEl.textContent = this.formatMoney(this.selectedVariant.compare_at_price);
            comparePriceEl.style.display = '';
            if (saveBadge) {
              const pct = Math.round((1 - this.selectedVariant.price / this.selectedVariant.compare_at_price) * 100);
              saveBadge.textContent = 'Save ' + pct + '%';
              saveBadge.style.display = '';
            }
          } else {
            comparePriceEl.style.display = 'none';
            if (saveBadge) saveBadge.style.display = 'none';
          }
        }
        if (addBtn && this.selectedVariant) {
          addBtn.disabled = !this.selectedVariant.available;
          if (addBtnText) {
            addBtnText.textContent = this.selectedVariant.available ? 'Add to Bag' : 'Sold Out';
          }
        }
        if (stickyPrice && this.selectedVariant) {
          stickyPrice.textContent = this.formatMoney(this.selectedVariant.price);
        }
        if (window.history && window.history.replaceState && this.selectedVariant) {
          const url = new URL(window.location.href);
          url.searchParams.set('variant', this.selectedVariant.id);
          window.history.replaceState({}, '', url);
        }
      },
      formatMoney(cents) {
        if (window.NOXR && window.NOXR.formatMoney) return window.NOXR.formatMoney(cents);
        return '₹' + (cents / 100).toFixed(2);
      },
      addToCart() {
        if (!this.selectedVariant) return;
        if (window.NOXR && window.NOXR.Cart) {
          window.NOXR.Cart.add(this.selectedVariant.id, this.quantity)
            .then((cart) => {
              if (window.NOXR.updateUI) window.NOXR.updateUI(cart);
              document.dispatchEvent(new Event('open-cart-drawer'));
            })
            .catch((err) => {
              const errorEl = document.querySelector('.pd-form-error');
              if (errorEl) {
                errorEl.textContent = err.description || 'Could not add item to cart.';
                errorEl.classList.add('visible');
              }
            });
        }
      },
      incrementQty() {
        if (this.quantity < 99) this.quantity++;
      },
      decrementQty() {
        if (this.quantity > 1) this.quantity--;
      }
    };
  });

  Alpine.data('variantPicker', function (variants, options) {
    return {
      variants: variants || [],
      options: options || [],
      selectedOptions: {},
      selectedVariant: null,
      moneyFormat: '₹{{amount}}',

      init: function () {
        if (!this.options || this.options.length === 0) {
          this.options = [];
          return;
        }
        this.options.forEach(function (optionGroup, index) {
          if (optionGroup && optionGroup.values && optionGroup.values.length > 0) {
            this.selectedOptions[index] = optionGroup.values[0] || '';
          }
        }.bind(this));
        this.updateVariant();
      },

      selectOption: function (groupIndex, value) {
        this.selectedOptions[groupIndex] = value;
        this.updateVariant();
      },

      updateVariant: function () {
        var selections = Object.values(this.selectedOptions);
        this.selectedVariant = this.variants.find(function (v) {
          return v.options.every(function (opt, i) { return opt === selections[i]; });
        });

        var priceEl = this.$root.querySelector('[data-price]');
        var comparePriceEl = this.$root.querySelector('[data-compare-price]');
        var saveBadge = this.$root.querySelector('[data-save-badge]');
        var idInput = this.$root.querySelector('[data-variant-id-input]');
        var addBtn = this.$root.querySelector('[data-add-button]');
        var addBtnText = this.$root.querySelector('[data-add-button-text]');

        if (idInput && this.selectedVariant) {
          idInput.value = this.selectedVariant.id;
        }

        if (priceEl && this.selectedVariant) {
          priceEl.textContent = this.formatMoney(this.selectedVariant.price);
        }

        if (comparePriceEl && this.selectedVariant) {
          if (this.selectedVariant.compare_at_price > this.selectedVariant.price) {
            comparePriceEl.textContent = this.formatMoney(this.selectedVariant.compare_at_price);
            comparePriceEl.style.display = '';
            if (saveBadge) {
              var pct = Math.round((1 - this.selectedVariant.price / this.selectedVariant.compare_at_price) * 100);
              saveBadge.textContent = 'Save ' + pct + '%';
              saveBadge.style.display = '';
            }
          } else {
            comparePriceEl.style.display = 'none';
            if (saveBadge) saveBadge.style.display = 'none';
          }
        }

        if (addBtn && this.selectedVariant) {
          addBtn.disabled = !this.selectedVariant.available;
          if (addBtnText) {
            addBtnText.textContent = this.selectedVariant.available ? 'Add to Bag' : 'Sold Out';
          }
        }

        if (window.history && window.history.replaceState && this.selectedVariant) {
          var url = new URL(window.location.href);
          url.searchParams.set('variant', this.selectedVariant.id);
          window.history.replaceState({}, '', url);
        }
      },

      formatMoney: function (cents) {
        if (window.NOXR && window.NOXR.formatMoney) {
          return window.NOXR.formatMoney(cents, this.moneyFormat);
        }
        return '₹' + (cents / 100).toFixed(2);
      },

      isOptionSelected: function (groupIndex, value) {
        return this.selectedOptions[groupIndex] === value;
      }
    };
  });
});
