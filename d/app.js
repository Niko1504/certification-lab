/* Вариант A. Единственная доминирующая механика первого экрана: кинетическая
   типографика на заявлении (по буквам, две строки максимум). Магнитная кнопка
   ниже записана подчинённой: она поддерживает главное действие, а не спорит с ним.

   ∅ 0 KB библиотек, ~0.6 KB кода. Деградирует в обычный заголовок: скрытое
   состояние живёт под html.js, поэтому без скрипта текст просто стоит на месте. */

const kin = document.querySelector('[data-kin]');

if (kin) {
  const text = kin.textContent.trim();
  kin.setAttribute('aria-label', text);
  kin.textContent = '';
  let i = 0;
  /* Слова собираем в отдельные неразрывные обёртки: побуквенные inline-block
     без этого рвут слово в середине («Разрешительные до/кументы»). */
  text.split(' ').forEach((word, w, all) => {
    const holder = document.createElement('span');
    holder.className = 'kin-word';
    [...word].forEach((ch) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.setProperty('--i', i++);
      s.setAttribute('aria-hidden', 'true');
      holder.append(s);
    });
    kin.append(holder);
    if (w < all.length - 1) kin.append(document.createTextNode(' '));
  });
  kin.classList.add('kin');
  const staticShot = new URLSearchParams(location.search).has('static');
  if (staticShot) kin.classList.add('vis');
  else requestAnimationFrame(() => kin.classList.add('vis'));
}

/* Подчинённое движение: одна кнопка, максимум 10px, только на точном указателе.
   Цикл кадров останавливается сам, когда кнопка встала. */
const magnet = (el, max = 10) => {
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  el.addEventListener('pointermove', (e) => {
    const b = el.getBoundingClientRect();
    tx = ((e.clientX - (b.left + b.width / 2)) / b.width) * max * 2;
    ty = ((e.clientY - (b.top + b.height / 2)) / b.height) * max * 2;
    if (!raf) raf = requestAnimationFrame(loop);
  });
  el.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  const loop = () => {
    cx += (tx - cx) * .18;
    cy += (ty - cy) * .18;
    el.style.translate = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
    raf = (Math.abs(cx - tx) + Math.abs(cy - ty) > .1) ? requestAnimationFrame(loop) : 0;
  };
};

if (matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-magnet]').forEach((el) => magnet(el));
}

/* Примеры товаров из старой карточки маршрута убраны: поля там теперь те же,
   что в форме заявки (телефон, E-mail, наименование продукции). */
