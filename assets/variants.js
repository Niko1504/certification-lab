/* Переключатель версий сайта: ночная и дневная.

   Две версии — одни и те же страницы в двух палитрах: /a/ ночная, /d/ дневная.
   Кнопка живёт в верхней контактной строке, справа: там всегда есть свободное
   место, она не спорит с меню и кнопкой заявки и не висит поверх контента.
   Адрес сохраняет остальной путь: /a/services/x/ -> /d/services/x/. */
(function () {
  var OTHER = { a: 'd', d: 'a' };
  var seg = (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase();
  if (!OTHER[seg]) return;
  var next = OTHER[seg];

  var SUN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.1"/><path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z"/></svg>';

  var style = document.createElement('style');
  style.textContent = [
    '.vswitch{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px 0 8px;',
    'margin-left:auto;border:1px solid currentColor;border-radius:999px;text-decoration:none;',
    'font:inherit;font-size:.8125rem;line-height:1;color:inherit;opacity:.88;',
    'transition:opacity .18s ease,border-color .18s ease;}',
    '.vswitch:hover,.vswitch:focus-visible{opacity:1;border-color:currentColor;}',
    '.vswitch svg{display:block;flex:none;}',
    '@media (max-width:640px){.vswitch{height:26px;padding:0 8px;}.vswitch span{display:none;}}',
    '@media print{.vswitch{display:none;}}'
  ].join('');
  document.head.appendChild(style);

  var a = document.createElement('a');
  a.className = 'vswitch';
  a.href = location.pathname.replace(/^\/[a-d]\//i, '/' + next + '/') + location.search;
  a.title = next === 'd' ? 'Дневная версия сайта' : 'Ночная версия сайта';
  a.setAttribute('aria-label', a.title);
  a.innerHTML = (next === 'd' ? SUN : MOON) + '<span>' + (next === 'd' ? 'Дневная' : 'Ночная') + '</span>';

  function mount() {
    var host = document.querySelector('.contacts__in') || document.querySelector('.top__in');
    if (host) { host.appendChild(a); return; }
    a.style.position = 'fixed'; a.style.left = '16px'; a.style.bottom = '16px';
    if (document.body) document.body.appendChild(a);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
