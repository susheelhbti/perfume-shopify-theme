/* ==========================================================
   header-nav.js — sections/header.liquid behavior
   Depends on: utils.js
   ========================================================== */
(function () {
  'use strict';
  var qs = window.NOXR.qs;
  var qsa = window.NOXR.qsa;

  function initNavScrollState() {
    var nav = qs('.nav');
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initSearchToggle() {
    var trigger = qs('[data-search-trigger]');
    var form = qs('[data-search-form]');
    if (!trigger || !form) return;

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      form.classList.toggle('open');
      if (form.classList.contains('open')) {
        var input = form.querySelector('input[type="search"]');
        if (input) input.focus();
      }
    });
  }

  function initMobileNavPanel() {
    var burger = qs('.nav-burger');
    var panel = qs('[data-mobile-nav-panel]');
    if (!burger || !panel) return;
    var closeBtn = qs('.mobile-nav-close', panel);

    function open() {
      panel.classList.add('open');
      document.body.classList.add('cart-drawer-open');
    }

    function close() {
      panel.classList.remove('open');
      document.body.classList.remove('cart-drawer-open');
    }

    burger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    qsa('a', panel).forEach(function (link) {
      link.addEventListener('click', close);
    });
  }

  function initHeaderNav() {
    initNavScrollState();
    initSearchToggle();
    initMobileNavPanel();
  }

  window.NOXR.initHeaderNav = initHeaderNav;
})();
