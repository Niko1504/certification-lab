/* Переключатель вариантов оформления.

   Задача: из любого варианта перейти в соседний одним нажатием, не возвращаясь
   в лабораторию. Скрипт вставляется одной строкой в каждый вариант, поэтому
   он сам собирает разметку и собственные стили: общие стили вариантов трогать
   нельзя, у них разные палитры. Классы с префиксом vswitch, чтобы не совпасть
   ни с одним вариантом. */
(function () {
  var VARIANTS = [
    { id: 'a', label: 'A', title: 'Тёмный протокол' },
    { id: 'b', label: 'B', title: 'Светлый каталог' },
    { id: 'c', label: 'C', title: 'Белый регламент' },
    { id: 'd', label: 'D', title: 'Светлый протокол' }
  ];

  /* Определяем текущий вариант по первому сегменту пути: /a/, /b/, /c/. */
  var seg = (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase();
  var current = VARIANTS.some(function (v) { return v.id === seg; }) ? seg : null;

  /* Сохраняем строку запроса: в ней бывают служебные режимы предпросмотра. */
  var query = location.search;

  var style = document.createElement('style');
  style.textContent = [
    '.vswitch{position:fixed;left:16px;bottom:16px;z-index:90;display:flex;align-items:center;',
    'gap:1px;padding:3px;border-radius:999px;background:rgba(16,20,26,.86);',
    'box-shadow:0 10px 26px -12px rgba(0,0,0,.6);backdrop-filter:blur(6px);',
    'font:500 12px/1 -apple-system,"Segoe UI",Roboto,sans-serif;font-style:normal;letter-spacing:0;',
    'color:#fff;text-transform:none;opacity:.78;transition:opacity .18s ease;}',
    '.vswitch:hover,.vswitch:focus-within{opacity:1;}',
    '.vswitch a,.vswitch span{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 11px;',
    'border-radius:999px;color:#E8ECF3;text-decoration:none;font:inherit;white-space:nowrap;}',
    '.vswitch a:hover{background:rgba(255,255,255,.14);color:#fff;}',
    '.vswitch .vswitch__on{background:#fff;color:#11161D;font-weight:600;}',
    '.vswitch .vswitch__lab{opacity:.75;}',
    '@media (max-width:700px){.vswitch{left:8px;bottom:8px;font-size:12px;}',
    '.vswitch a,.vswitch span{height:28px;padding:0 9px;}}',
    /* На варианте с нижней плашкой связи поднимаем переключатель, чтобы они не слиплись. */
    'body:has(.callbar) .vswitch,body.has-callbar .vswitch{bottom:76px;}',
    '@media print{.vswitch{display:none;}}'
  ].join('');
  document.head.appendChild(style);

  var bar = document.createElement('nav');
  bar.className = 'vswitch';
  bar.setAttribute('aria-label', 'Переключение вариантов оформления');

  var home = document.createElement('a');
  home.href = '/';
  home.className = 'vswitch__lab';
  var narrow = window.matchMedia('(max-width: 560px)');
  function syncLabel() { home.textContent = narrow.matches ? '←' : '← Все'; }
  syncLabel();
  narrow.addEventListener('change', syncLabel);
  home.title = 'Все варианты и правовые документы';
  bar.appendChild(home);

  VARIANTS.forEach(function (v) {
    var node;
    if (v.id === current) {
      node = document.createElement('span');
      node.className = 'vswitch__on';
      node.setAttribute('aria-current', 'true');
    } else {
      node = document.createElement('a');
      node.href = '/' + v.id + '/' + query;
    }
    node.textContent = v.label;
    node.title = v.title;
    node.style.textDecoration = 'none';
    bar.appendChild(node);
  });

  function mount() {
    if (document.body) {
      document.body.appendChild(bar);
      /* Вариант A может отрисовать нижнюю плашку связи только своим скриптом,
         поэтому после вставки помечаем body, если плашка появилась. */
      if (document.querySelector('.callbar')) document.body.classList.add('has-callbar');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
  window.addEventListener('load', function () {
    if (document.querySelector('.callbar')) document.body.classList.add('has-callbar');
  });
})();
