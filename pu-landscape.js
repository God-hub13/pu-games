/* Pleasure Union — Defending Todot на телефоне.

   Игра широкая (1600×900) и играется только боком: стоя она — узкая полоска
   посреди чёрного экрана. Поэтому на телефоне:
     • просим Telegram открыть игру на весь экран — в обычном окне мини-
       приложение может не поворачиваться вместе с телефоном;
     • повернули боком — закрепляем поворот, чтобы экран не прыгал, когда
       телефон наклоняют во время боя;
     • игру ставим между кнопками Telegram и вырезом экрана (window.PU_PAD,
       его читает adjustCanvasDimensions в index.html);
     • уходим из игры — возвращаем Telegram обычный вид, иначе галерея
       открылась бы на весь экран и боком.
   Пока телефон стоит — поверх игры просьба повернуть (#pu-rotate в
   index.html, показывает её CSS).

   На компьютере (мышь) ничего не делаем. */
(function () {
  'use strict';
  var tg = window.Telegram && window.Telegram.WebApp;
  var phone = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!tg || !tg.initData || !phone) return;
  var v8 = tg.isVersionAtLeast && tg.isVersionAtLeast('8.0');

  function pad() {
    var a = tg.safeAreaInset || {}, b = tg.contentSafeAreaInset || {};
    window.PU_PAD = {
      top: (a.top || 0) + (b.top || 0),
      right: (a.right || 0) + (b.right || 0),
      bottom: (a.bottom || 0) + (b.bottom || 0),
      left: (a.left || 0) + (b.left || 0)
    };
  }

  function sideways() {
    return window.innerWidth > window.innerHeight;
  }

  function lock() {
    if (!v8 || !sideways() || tg.isOrientationLocked) return;
    try { tg.lockOrientation(); } catch (e) {}
  }

  if (v8) {
    pad();
    ['safeAreaChanged', 'contentSafeAreaChanged', 'fullscreenChanged'].forEach(function (ev) {
      try { tg.onEvent(ev, pad); } catch (e) {}
    });
    try { if (!tg.isFullscreen) tg.requestFullscreen(); } catch (e) {}
    window.addEventListener('resize', lock);
    lock();
  }

  window.addEventListener('pagehide', function () {
    try { if (tg.isOrientationLocked) tg.unlockOrientation(); } catch (e) {}
    try { if (tg.isFullscreen) tg.exitFullscreen(); } catch (e) {}
  });
})();
