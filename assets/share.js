/* ==========================================================
   share.js — copy-product-link button on the PDP
   No dependencies (works standalone).
   ========================================================== */
(function () {
  'use strict';

  function initShareCopyLink() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-copy-link]'));
    buttons.forEach(function (btn) {
      if (btn.getAttribute('data-bound')) return;
      btn.setAttribute('data-bound', 'true');

      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-share-url') || window.location.href;
        var shareBlock = btn.closest('.share-block');
        var feedback = shareBlock ? shareBlock.querySelector('[data-copy-feedback]') : null;

        function showFeedback() {
          if (!feedback) return;
          feedback.classList.add('visible');
          setTimeout(function () { feedback.classList.remove('visible'); }, 1800);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(showFeedback).catch(function () {});
        } else {
          var temp = document.createElement('textarea');
          temp.value = url;
          document.body.appendChild(temp);
          temp.select();
          try { document.execCommand('copy'); showFeedback(); } catch (e) {}
          document.body.removeChild(temp);
        }
      });
    });
  }

  window.NOXR = window.NOXR || {};
  window.NOXR.initShareCopyLink = initShareCopyLink;
})();
