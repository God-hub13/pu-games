/* Pleasure Union — склейка игры с Telegram. Одна и та же во всех играх.

   ЭТАЛОН ЛЕЖИТ ЗДЕСЬ, в tools/pu-tg.js. В папки игр он копируется
   `python3 tools/check.py --fix`: галерея забирает из репозитория только
   папку игры, и общий файл в корне до игры бы не доехал.

   Что делает (и ничего больше):
     • «Назад» Telegram ведёт обратно в галерею — своя стрелка в игре не нужна;
     • свайп вниз НЕ закрывает приложение — в 2048 и Hextris это главный жест;
     • шапка Telegram в цвет игры, а не белая полоса над тёмным экраном.

   Вне галереи (игру открыли напрямую) — ничего не трогает.

   Если игре нужно спросить перед выходом (идёт партия, прогресс не
   сохраняется), на <html> ставится data-pu-confirm="Текст вопроса".
*/
(function () {
  'use strict';
  var tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return;

  try { tg.ready(); tg.expand(); } catch (e) {}
  try { if (tg.disableVerticalSwipes) tg.disableVerticalSwipes(); } catch (e) {}

  function hex(color) {
    var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color || '');
    if (!m) return /^#[0-9a-f]{6}$/i.test(color || '') ? color : '';
    return '#' + [m[1], m[2], m[3]].map(function (n) {
      return ('0' + (+n).toString(16)).slice(-2);
    }).join('');
  }

  function paint() {
    var meta = document.querySelector('meta[name="theme-color"]');
    var c = hex(meta && meta.content) || hex(getComputedStyle(document.body).backgroundColor);
    if (!c) return;
    try { if (tg.setHeaderColor) tg.setHeaderColor(c); } catch (e) {}
    try { if (tg.setBackgroundColor) tg.setBackgroundColor(c); } catch (e) {}
  }

  function back() {
    var ask = document.documentElement.getAttribute('data-pu-confirm');
    var go = function (ok) { if (ok && window.PU) window.PU.exit(); };
    if (!ask) return go(true);
    if (tg.showConfirm) tg.showConfirm(ask, go); else go(window.confirm(ask));
  }

  function start() {
    paint();
    if (window.PU && window.PU.inGallery && tg.BackButton) {
      try { tg.BackButton.show(); tg.BackButton.onClick(back); } catch (e) {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
