/* Переключатель версий сайта: ночная и дневная.

   Две версии — это одни и те же страницы в двух палитрах: /a/ ночная, /d/ дневная.
   Кнопка одна и живёт поверх страницы, потому что шапка у обеих версий плотная
   (логотип, меню, кнопка заявки), и вставлять в неё ещё один элемент на телефоне
   некуда. Адрес сохраняет остальной путь: /a/services/x/ -> /d/services/x/. */
(function () {
  var OTHER = { a: 'd', d: 'a' };
  var seg = (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase();
  var current = OTHER[seg] ? seg : null;

  var SUN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z"/></svg>';

  var style = document.createElement('style');
  style.textContent = [
    '.vswitch{position:fixed;left:16px;bottom:16px;z-index:90;display:inline-flex;align-items:center;',
    'justify-content:center;width:40px;height:40px;border-radius:999px;text-decoration:none;',
    'box-shadow:0 10px 24px -12px rgba(0,0,0,.55);opacity:.8;transition:opacity .18s ease,transform .18s ease;}',
    '.vswitch:hover,.vswitch:focus-visible{opacity:1;transform:translateY(-1px);}',
    '.vswitch svg{display:block;}',
    /* на дневной версии кнопка тёмная (переход в ночь), на ночной — светлая */
    '.vswitch--to-night{background:#0F1D38;color:#FFC93C;border:1px solid rgba(15,29,56,.14);}',
    '.vswitch--to-day{background:#FFFFFF;color:#0F1D38;border:1px solid rgba(15,29,56,.16);}',
    'body:has(.callbar) .vswitch,body.has-callbar .vswitch{bottom:76px;}',
    '@media (max-width:700px){.vswitch{left:10px;bottom:10px;width:38px;height:38px;}',
    'body:has(.callbar) .vswitch,body.has-callbar .vswitch{bottom:72px;}}',
    '@media print{.vswitch{display:none;}}'
  ].join('');
  document.head.appendChild(style);

  if (!current) return;

  var next = OTHER[current];
  var a = document.createElement('a');
  a.className = 'vswitch ' + (next === 'd' ? 'vswitch--to-day' : 'vswitch--to-night');
  a.href = location.pathname.replace(/^\/[a-d]\//i, '/' + next + '/') + location.search;
  a.setAttribute('aria-label', next === 'd' ? 'Дневная версия сайта' : 'Ночная версия сайта');
  a.title = next === 'd' ? 'Дневная версия' : 'Ночная версия';
  a.innerHTML = next === 'd' ? SUN : MOON;

  function mount() {
    if (document.body) {
      document.body.appendChild(a);
      if (document.querySelector('.callbar')) document.body.classList.add('has-callbar');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
  window.addEventListener('load', function () {
    if (document.querySelector('.callbar')) document.body.classList.add('has-callbar');
  });
})();
