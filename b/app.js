/* Вариант B. Доминирующая механика первого экрана живёт в CSS (стопка карточек
   прилипает при скролле), поэтому здесь только вспомогательное действие:
   подстановка примеров товара в поле. Ничего, что можно сделать стилями,
   скриптом не делаем. */

const input = document.querySelector('#b-item');
document.querySelectorAll('[data-example]').forEach((chip) => {
  chip.addEventListener('click', () => {
    if (!input) return;
    input.value = chip.dataset.example;
    input.focus();
  });
});
