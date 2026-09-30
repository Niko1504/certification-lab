/* Вариант C. Доминирующая механика первого экрана: одна прилипающая сцена, три
   этапа маршрута сменяют друг друга по прогрессу прокрутки.

   Прогресс берём у общей функции progress() из assets/base.js: она же отдаёт
   значение параметра ?t=, поэтому кадр механики можно зафиксировать для снимка.
   Бюджет: около 1 KB своего кода, без библиотек. Без JS этапы просто видны
   статично: скрытые состояния живут только под классом scene--live. */

import { progress } from '../../assets/base.js';

const scene = document.querySelector('[data-scene]');
const params = new URLSearchParams(location.search);
const hasT = params.has('t');

if (scene) {
  const stages = [...scene.querySelectorAll('[data-stage]')];
  const rails = [...scene.querySelectorAll('[data-rail]')];
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const live = (fine || hasT) && !calm && !(params.has('static') && !hasT);

  if (live) scene.classList.add('scene--live');

  let raf = 0;
  const draw = () => {
    raf = 0;
    const total = scene.offsetHeight - innerHeight;
    const raw = total <= 0 ? 1 : Math.min(1, Math.max(0, -scene.getBoundingClientRect().top / total));
    const p = progress(raw);
    const idx = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
    stages.forEach((el, i) => el.classList.toggle('is-on', i <= idx));
    rails.forEach((el, i) => el.classList.toggle('is-on', i === idx));
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(draw); };

  if (live) {
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue, { passive: true });
  }
  draw();
  if (hasT) { stages.forEach((el) => el.classList.add('is-on')); }

  /* Карусель документов: подсказку о прокрутке убираем, когда прокрутили до конца. */
  const rail = document.querySelector('.rail');
  if (rail) rail.addEventListener('scroll', () => {
    rail.scrollLeft > 8 && rail.setAttribute('data-scrolled', '');
  }, { passive: true, once: true });
}
