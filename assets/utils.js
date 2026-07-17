/* ==========================================================
   utils.js — core DOM/format helpers + wishlist
   Load this FIRST. Everything else reads from window.NOXR.
   ========================================================== */
(function () {
  'use strict';

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function formatMoney(cents, format) {
    var value = (cents / 100).toFixed(2);
    return (format || '₹{{amount}}').replace('{{amount}}', value);
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var args = arguments;
      var context = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
        timer = null;
      }, delay);
    };
  }

  window.NOXR = window.NOXR || {};
  window.NOXR.qs = qs;
  window.NOXR.qsa = qsa;
  window.NOXR.formatMoney = formatMoney;
  window.NOXR.debounce = debounce;

  /* ---------- Wishlist ---------- */
  var WISHLIST_KEY = 'noxr_wishlist';

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveWishlist(list) {
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list)); }
    catch (e) {}
  }

  function toggleWishlist(productId) {
    var list = getWishlist();
    var index = list.indexOf(productId);
    if (index === -1) {
      list.push(productId);
    } else {
      list.splice(index, 1);
    }
    saveWishlist(list);
    return list.indexOf(productId) !== -1;
  }

  window.NOXR.getWishlist = getWishlist;
  window.NOXR.toggleWishlist = toggleWishlist;
})();
