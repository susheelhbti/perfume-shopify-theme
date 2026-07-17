/* ==========================================================
   svg.js — bottle/smoke SVG generators + auto-injection
   Depends on: utils.js (window.NOXR.qsa)
   ========================================================== */
(function () {
  'use strict';
  var qsa = window.NOXR.qsa;

  function bottleSVG(idPrefix) {
    idPrefix = idPrefix || 'b';
    return (
      '<svg viewBox="0 0 200 360" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="' + idPrefix + '-glass" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#3a3a3a"/><stop offset="45%" stop-color="#161616"/><stop offset="100%" stop-color="#050505"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + idPrefix + '-shine" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="rgba(255,255,255,0)"/><stop offset="50%" stop-color="rgba(255,255,255,0.18)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + idPrefix + '-cap" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#d8b87f"/><stop offset="100%" stop-color="#8a7350"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + idPrefix + '-floor" cx="50%" cy="50%" r="50%">' +
      '<stop offset="0%" stop-color="rgba(198,165,107,0.25)"/><stop offset="100%" stop-color="rgba(198,165,107,0)"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<ellipse cx="100" cy="345" rx="70" ry="10" fill="url(#' + idPrefix + '-floor)"/>' +
      '<rect x="78" y="14" width="44" height="38" rx="3" fill="url(#' + idPrefix + '-cap)"/>' +
      '<rect x="78" y="14" width="44" height="6" rx="2" fill="#efe0c4" opacity="0.5"/>' +
      '<rect x="90" y="50" width="20" height="20" fill="url(#' + idPrefix + '-glass)"/>' +
      '<path d="M68 70 C68 70 60 90 60 130 L60 290 C60 312 78 326 100 326 C122 326 140 312 140 290 L140 130 C140 90 132 70 132 70 Z" ' +
      'fill="url(#' + idPrefix + '-glass)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
      '<path d="M64 200 L64 288 C64 308 80 320 100 320 C120 320 136 308 136 288 L136 200 Z" fill="#1a140a" opacity="0.55"/>' +
      '<rect x="78" y="76" width="14" height="240" fill="url(#' + idPrefix + '-shine)"/>' +
      '<rect x="74" y="170" width="52" height="52" fill="none" stroke="rgba(198,165,107,0.45)" stroke-width="1"/>' +
      '<text x="100" y="192" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="13" fill="#c6a56b" letter-spacing="2">' +
      (window.NOXR && window.NOXR.shopName ? window.NOXR.shopName.toUpperCase() : 'NOXR') +
      '</text>' +
      '<text x="100" y="206" text-anchor="middle" font-family="Inter, sans-serif" font-size="6" fill="#bdbdbd" letter-spacing="1">EAU DE PARFUM</text>' +
      '</svg>'
    );
  }

  function smokeSVG() {
    var paths = [
      'M250 600 C 230 500, 320 460, 280 380 C 250 320, 340 280, 300 200 C 270 140, 350 100, 310 40',
      'M260 600 C 290 520, 200 470, 240 400 C 270 350, 190 300, 230 230 C 255 190, 200 150, 235 90',
      'M240 600 C 220 540, 270 500, 245 440'
    ];
    var inner = paths.map(function (d, i) {
      return '<path d="' + d + '" style="animation: drift ' + (9 + i * 2) + 's ease-in-out ' + (i * 0.6) + 's infinite alternate;"/>';
    }).join('');
    return '<svg class="smoke" viewBox="0 0 520 640" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }

  function initSVGInjections(root) {
    var scope = root || document;
    qsa('[data-bottle]', scope).forEach(function (el, i) {
      if (el.getAttribute('data-injected')) return;
      el.innerHTML = bottleSVG('bottle' + i + '-' + Math.random().toString(36).slice(2, 7));
      el.setAttribute('data-injected', 'true');
    });
    qsa('[data-smoke]', scope).forEach(function (el) {
      if (el.getAttribute('data-injected')) return;
      el.innerHTML = smokeSVG();
      el.setAttribute('data-injected', 'true');
    });
  }

  window.NOXR.bottleSVG = bottleSVG;
  window.NOXR.smokeSVG = smokeSVG;
  window.NOXR.initSVGInjections = initSVGInjections;
})();
