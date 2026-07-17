/* ==========================================================
   BASE.JS — Minimal script for layout/password.liquid
   Only what the "Coming Soon" page needs: a couple of DOM
   utilities and the notify-me newsletter form. The full
   cart/product/header logic lives in theme.js and is not
   loaded on the password page.
   ========================================================== */
(function () {
  'use strict';

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  window.NOXR = window.NOXR || {};
  window.NOXR.qs = qs;
  window.NOXR.qsa = qsa;

  function submitNewsletter(email, form, callback) {
    var formData = new FormData();
    formData.append('contact[email]', email);
    formData.append('contact[tags]', 'newsletter');

    fetch('/contact', { method: 'POST', body: formData })
      .then(function (res) { callback(res.ok); })
      .catch(function () { callback(false); });
  }

  function initNewsletterForms(root) {
    qsa('[data-newsletter-form]', root || document).forEach(function (form) {
      if (form.getAttribute('data-bound')) return;
      form.setAttribute('data-bound', 'true');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var success = qs('.newsletter-success', form.parentNode) || qs('.newsletter-success', form);
        var error = qs('.newsletter-error', form.parentNode) || qs('.newsletter-error', form);
        var email = input ? input.value : '';

        if (!email || email.indexOf('@') === -1) {
          if (error) {
            error.textContent = 'Please enter a valid email address.';
            error.classList.add('visible');
          }
          return;
        }
        if (error) error.classList.remove('visible');

        submitNewsletter(email, form, function (ok) {
          if (ok) {
            form.reset();
            if (success) success.classList.add('visible');
          } else if (error) {
            error.textContent = 'Something went wrong. Please try again.';
            error.classList.add('visible');
          }
        });
      });
    });
  }

  function initAll() {
    initNewsletterForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
