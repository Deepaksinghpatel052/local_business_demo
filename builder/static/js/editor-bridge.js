/*!
 * editor-bridge.js: loaded only in the editor's live-preview iframe, before the
 * template's themes.js/main.js. When the editor sends new (unsaved) data with
 * postMessage, it keeps it for this tab and re-renders the page with the real
 * template, at the same scroll position.
 */
(function (window, document) {
  'use strict';
  // the editor opens the frame with a fresh ?v=<time> on every visit, so old unsaved data is never reused
  var KEY = 'lbd-editor:' + window.location.pathname + window.location.search;
  var stored = null;
  try { stored = JSON.parse(window.sessionStorage.getItem(KEY) || 'null'); } catch (e) { stored = null; }
  if (stored && stored.data) {
    window.BUSINESS = stored.data;                     // main.js reads this next
    window.addEventListener('load', function () {
      setTimeout(function () { window.scrollTo(0, stored.y || 0); }, 30);
    });
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== window.location.origin || !e.data || e.data.type !== 'lbd:data') return;
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify({ data: e.data.data, y: window.scrollY || 0 }));
    } catch (err) { return; }
    window.location.reload();
  });

  // links inside the preview must not navigate the editor frame away
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#') return;
    e.preventDefault();
    if (/^https?:/i.test(href)) window.open(href, '_blank', 'noopener');
  }, true);

  window.addEventListener('load', function () {
    if (window.parent !== window) window.parent.postMessage({ type: 'lbd:ready' }, window.location.origin);
  });
})(window, document);
