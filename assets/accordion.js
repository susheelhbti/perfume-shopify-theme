/* ==========================================================
   accordion.js — FAQ / PDP description accordions
   No dependencies (works standalone).
   ========================================================== */
(function () {
  'use strict';

  function initAccordions(root) {
    var triggers = Array.prototype.slice.call((root || document).querySelectorAll('[data-accordion-trigger]'));
    triggers.forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', 'true');

      btn.addEventListener('click', function () {
        var panel = btn.nextElementSibling;
        var isOpen = btn.classList.contains('open');
        var group = btn.closest('[data-accordion-group]');

        if (group && group.getAttribute('data-accordion-exclusive') === 'true') {
          Array.prototype.slice.call(group.querySelectorAll('[data-accordion-trigger]')).forEach(function (other) {
            other.classList.remove('open');
            other.nextElementSibling.style.maxHeight = null;
          });
        }

        if (!isOpen) {
          btn.classList.add('open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        } else {
          btn.classList.remove('open');
          panel.style.maxHeight = null;
        }
      });
    });
  }

  window.NOXR = window.NOXR || {};
  window.NOXR.initAccordions = initAccordions;
})();
