/* Pleasure Union — Fish Folk: Jumpy боком.

   Игра широкая и играется только боком. Поэтому на телефоне:
     • просим Telegram открыть игру на весь экран — в обычном окне мини-
       приложение может не поворачиваться вместе с телефоном;
     • повернули боком — закрепляем поворот, чтобы экран не прыгал, когда
       телефон наклоняют во время боя;
     • уходим из игры — возвращаем Telegram обычный вид, иначе галерея
       открылась бы на весь экран и боком.
   Пока телефон стоит — поверх игры просьба повернуть (#pu-rotate в
   index.html, показывает её CSS).

   Тот же приём, что в Defending Todot (ветка todot). На компьютере (мышь)
   ничего не делаем. */
(function () {
  'use strict';
  var tg = window.Telegram && window.Telegram.WebApp;
  var phone = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!tg || !tg.initData || !phone) return;
  if (!(tg.isVersionAtLeast && tg.isVersionAtLeast('8.0'))) return;

  function lock() {
    if (window.innerWidth <= window.innerHeight || tg.isOrientationLocked) return;
    try { tg.lockOrientation(); } catch (e) {}
  }

  try { if (!tg.isFullscreen) tg.requestFullscreen(); } catch (e) {}
  window.addEventListener('resize', lock);
  lock();

  window.addEventListener('pagehide', function () {
    try { if (tg.isOrientationLocked) tg.unlockOrientation(); } catch (e) {}
    try { if (tg.isFullscreen) tg.exitFullscreen(); } catch (e) {}
  });
})();
