/* Общий скрипт всех вариантов: класс js, reveal по скроллу, «тихий» скролл
   на точном указателе и единая функция прогресса для скролл-механик.
   Здесь нет ничего, что варианты не могут менять: механика у каждого своя. */

document.documentElement.classList.add('js');

/* Прогресс скролл-механик. Параметр ?t= замораживает кадр — без него
   скролл-механику невозможно снять на скриншот и проверить. */
const FROZEN = new URLSearchParams(location.search).get('t');
const progress = (p) => (FROZEN === null ? p : Math.min(1, Math.max(0, +FROZEN)));

/* Reveal on scroll: строго по элементам, никогда на section целиком. */
const STATIC = new URLSearchParams(location.search).has('static');
const targets = [...document.querySelectorAll('.reveal, .reveal-scale')];

if (STATIC || !('IntersectionObserver' in window)) {
  targets.forEach((el) => el.classList.add('vis'));
} else {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('vis');
      io.unobserve(e.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  const inGroup = new Set();
  document.querySelectorAll('[data-xscroll]').forEach((group) => {
    const kids = [...group.querySelectorAll('.reveal, .reveal-scale')];
    kids.forEach((k) => inGroup.add(k));
    const gio = new IntersectionObserver((es) => {
      for (const e of es) {
        if (!e.isIntersecting) continue;
        kids.forEach((k) => k.classList.add('vis'));
        gio.disconnect();
      }
    }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });
    gio.observe(group);
  });

  targets.forEach((el) => { if (!inGroup.has(el)) io.observe(el); });
}

/* Следование за скроллом без библиотеки: lerp на колесе, только для точного
   указателя. Тач и клавиатура остаются нативными — перехватывать их нельзя. */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (fine && !calm) {
  let target = scrollY, current = scrollY, raf = 0;
  const max = () => document.documentElement.scrollHeight - innerHeight;
  const loop = () => {
    current += (target - current) * 0.08;
    if (Math.abs(target - current) < 0.4) { current = target; raf = 0; }
    else raf = requestAnimationFrame(loop);
    scrollTo(0, current);
  };
  addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    const next = Math.min(max(), Math.max(0, target + d));
    if (next === target) return;
    e.preventDefault();
    target = next;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: false });
  addEventListener('scroll', () => { if (!raf) { target = current = scrollY; } }, { passive: true });
  addEventListener('resize', () => { raf = 0; target = current = scrollY; }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const el = document.querySelector(a.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + scrollY - (el.scrollMarginTop || 0);
      target = Math.min(max(), Math.max(0, top - 72));
      if (!raf) raf = requestAnimationFrame(loop);
      history.replaceState(null, '', a.getAttribute('href'));
      el.querySelector('input, button, a')?.focus({ preventScroll: true });
    });
  });
}

/* Маска телефона: поле с data-mask="tel" принимает только цифры и само
   расставляет разделители — так номер приходит в заявку целиком, без
   «плюс семь скобка» в разных написаниях. Восьмёрку в начале переводим в +7. */
const telDigits = (value) => {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (d && !d.startsWith('7')) d = '7' + d;
  return d.slice(0, 11);
};
const telFormat = (d) => {
  if (!d) return '';
  let out = '+7';
  if (d.length > 1) out += ' (' + d.slice(1, 4);
  if (d.length >= 5) out += ') ' + d.slice(4, 7);
  if (d.length >= 8) out += '-' + d.slice(7, 9);
  if (d.length >= 10) out += '-' + d.slice(9, 11);
  return out;
};
document.querySelectorAll('[data-mask="tel"]').forEach((input) => {
  input.addEventListener('input', () => { input.value = telFormat(telDigits(input.value)); });
  input.addEventListener('blur', () => {
    if (input.value && input.value.replace(/\D/g, '').length < 11) return;
    input.value = telFormat(telDigits(input.value));
  });
});

/* Форма: сначала пробуем отправить на настроенный адрес, при неудаче честно
   показываем запасной путь — заявку можно скопировать и отправить вручную. */
document.querySelectorAll('[data-lead-form]').forEach((form) => {
  const status = form.querySelector('[data-status]');
  const fallback = form.querySelector('[data-fallback]');
  const out = form.querySelector('[data-fallback-text]');

  const compose = () => {
    const d = new FormData(form);
    const names = {
      phone: 'Телефон', email: 'E-mail', name: 'Имя', contact: 'Связь',
      item: 'Продукция', product: 'Продукция', comment: 'Комментарий',
    };
    const lines = ['Заявка с сайта центра сертификации'];
    d.forEach((value, key) => {
      if (key === 'consent') return;
      const text = String(value).trim();
      if (!text) return;
      lines.push((names[key] || key) + ': ' + text);
    });
    lines.push('Политика: ' + location.pathname);
    return lines.join('\n');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const endpoint = form.dataset.leadForm;
    const tel = form.querySelector('[data-mask="tel"]');
    if (tel && tel.value && tel.value.replace(/\D/g, '').length < 11) {
      status.textContent = 'Проверьте телефон: нужен номер целиком, 11 цифр.';
      tel.focus();
      return;
    }
    status.textContent = 'Отправляем…';
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        if (!res.ok) throw new Error(String(res.status));
        status.textContent = 'Заявка отправлена. Специалист свяжется с вами.';
        form.reset();
        return;
      } catch (err) {
        status.textContent = '';
      }
    }
    out.value = compose();
    fallback.hidden = false;
    fallback.querySelector('textarea')?.focus();
  });

  form.querySelector('[data-copy]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(out.value);
      status.textContent = 'Заявка скопирована — отправьте её в удобный канал.';
    } catch (err) {
      out.select();
      status.textContent = 'Скопируйте текст из поля вручную.';
    }
  });
});

export { progress };
