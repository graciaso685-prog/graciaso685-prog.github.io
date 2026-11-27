// Pages juridiques multilingues : affiche la section <section data-lang="xx"> qui correspond à la langue
// choisie sur le site Studiom (?lang=xx, sinon langue enregistrée, sinon langue du téléphone, sinon anglais).
(function () {
  var NAMES = { fr: 'Français', en: 'English', es: 'Español', pt: 'Português', de: 'Deutsch', ru: 'Русский', zh: '中文', mn: 'Монгол' };
  var secs = [].slice.call(document.querySelectorAll('section[data-lang]'));
  if (!secs.length) return;
  var avail = secs.map(function (s) { return s.getAttribute('data-lang'); });
  function pick() {
    var q = null; try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    if (avail.indexOf(q) >= 0) return q;
    try { var s = localStorage.getItem('studiom_lang'); if (avail.indexOf(s) >= 0) return s; } catch (e) {}
    var prefs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'en'];
    for (var i = 0; i < prefs.length; i++) { var c = String(prefs[i]).slice(0, 2).toLowerCase(); if (avail.indexOf(c) >= 0) return c; }
    return avail.indexOf('en') >= 0 ? 'en' : avail[0];
  }
  var bar = document.createElement('div');
  bar.className = 'lang-bar';
  bar.innerHTML = '<label><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg> <select aria-label="Language / Langue">' +
    avail.map(function (l) { return '<option value="' + l + '">' + (NAMES[l] || l) + '</option>'; }).join('') + '</select></label>';
  var first = secs[0];
  first.parentNode.insertBefore(bar, first);
  var sel = bar.querySelector('select');
  var style = document.createElement('style');
  style.textContent = '.lang-bar{display:flex;justify-content:flex-end;margin:0 0 16px}.lang-bar label{display:inline-flex;align-items:center;gap:6px;opacity:.85}.lang-bar select{font:inherit;font-size:14px;padding:6px 10px;border-radius:999px;border:1px solid currentColor;background:transparent;color:inherit}section[data-lang][hidden],hr.lang-sep{display:none!important}';
  document.head.appendChild(style);
  [].slice.call(document.querySelectorAll('hr')).forEach(function (h) { if (h.previousElementSibling && h.previousElementSibling.matches('section[data-lang]')) h.classList.add('lang-sep'); });
  function show(l) {
    secs.forEach(function (s) { s.hidden = s.getAttribute('data-lang') !== l; });
    document.documentElement.lang = l; sel.value = l;
    try { var u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u); } catch (e) {}
  }
  sel.onchange = function () { show(sel.value); try { localStorage.setItem('studiom_lang', sel.value); } catch (e) {} };
  show(pick());
})();
