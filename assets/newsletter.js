/* ==========================================================
   newsletter.js — [data-newsletter-form] submit handling
   Used on the password page, footer, and discount popup.
   No dependencies (works standalone). This is the same logic
   as base.js's copy, kept separate here so the main theme
   bundle stays modular file-per-concern.
   ========================================================== */
(function () {
  'use strict';

  function submitNewsletter(email, form, callback) {
    var formData = new FormData();
    formData.append('contact[email]', email);
    formData.append('contact[tags]', 'newsletter');

    fetch('/contact', { method: 'POST', body: formData })
      .then(function (res) { callback(res.ok); })
      .catch(function () { callback(false); });
  }

  function initNewsletterForms(root) {
    var forms = Array.prototype.slice.call((root || document).querySelectorAll('[data-newsletter-form]'));
    forms.forEach(function (form) {
      if (form.getAttribute('data-bound')) return;
      form.setAttribute('data-bound', 'true');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var success = form.parentNode.querySelector('.newsletter-success') || form.querySelector('.newsletter-success');
        var error = form.parentNode.querySelector('.newsletter-error') || form.querySelector('.newsletter-error');
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

  window.NOXR = window.NOXR || {};
  window.NOXR.initNewsletterForms = initNewsletterForms;
})();
