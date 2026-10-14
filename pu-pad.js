/* Pleasure Union — Fish Folk: Jumpy на телефоне.

   Игра управляется клавиатурой, геймпадом или мышью. Пальцем — никак:
   касания меню она не понимает, а кнопок на экране у неё нет. Здесь:

   1. ЭКРАННЫЙ ГЕЙМПАД (только на сенсорном экране). Каждая кнопка жмёт
      клавишу первого игрока с клавиатуры — так, как будто нажали на
      настоящей (раскладка — assets/game.yaml, keyboard1):
        крестовина      W A S D      ходить; в меню — выбор
        «Прыжок»        Space        прыжок; в меню — «да»
        «Огонь»         C            стрелять
        «Взять»         V            подобрать / бросить
        «Подкат»        B            подкат
        «Пауза»         Escape       пауза; в меню — «назад»
        «Старт»         Enter        начать бой (после «Ready!»)
      Клавиши уходят в холст игры событиями keydown/keyup.

   2. КАСАНИЕ МЕНЮ = КЛИК МЫШЬЮ. Кнопки меню («Local Game», «Add AI
      Player», уровни) понимают только мышь. Касание холста превращаем в
      «навели мышь → нажали → отпустили». Нажатие уходит в следующем кадре
      после «навели» — иначе меню игры его не замечает.

   Компьютер с мышью — ничего не меняется. */
(function () {
  'use strict';
  if (!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) return;

  /* ——— 2. касание холста → мышь ——— */
  var q = Promise.resolve();
  function later(ms, fn) {
    q = q.then(function () {
      return new Promise(function (done) { setTimeout(function () { fn(); done(); }, ms); });
    });
  }
  function mouse(c, type, x, y, buttons) {
    var init = {bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y,
      pointerId: 1, pointerType: 'mouse', isPrimary: true,
      button: type === 'move' ? -1 : 0, buttons: buttons};
    c.dispatchEvent(new PointerEvent('pointer' + type, init));
    c.dispatchEvent(new MouseEvent('mouse' + type, Object.assign({}, init, {button: 0})));
  }
  function relay(e) {
    if (e.pointerType !== 'touch' || !e.isTrusted) return;
    var c = e.target;
    if (!c || c.tagName !== 'CANVAS') return;
    e.stopImmediatePropagation();
    if (e.cancelable) e.preventDefault();
    var x = e.clientX, y = e.clientY;
    if (e.type === 'pointerdown') {
      mouse(c, 'move', x, y, 0);
      later(60, function () { mouse(c, 'down', x, y, 1); });
    } else if (e.type === 'pointermove') {
      later(0, function () { mouse(c, 'move', x, y, 1); });
    } else {
      later(60, function () { mouse(c, 'up', x, y, 0); });
    }
  }
  ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(function (t) {
    window.addEventListener(t, relay, true);
  });
  // «Сырые» касания до игры не пускаем: вместе с нашей мышью она получила бы
  // и их, и нажатие сбивалось бы.
  ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function (t) {
    window.addEventListener(t, function (e) {
      if (e.target && e.target.tagName === 'CANVAS') e.stopImmediatePropagation();
    }, true);
  });

  /* ——— 1. экранный геймпад ——— */
  var KEYS = {
    up: ['KeyW', 'w'], down: ['KeyS', 's'], left: ['KeyA', 'a'], right: ['KeyD', 'd'],
    jump: ['Space', ' '], shoot: ['KeyC', 'c'], grab: ['KeyV', 'v'], slide: ['KeyB', 'b'],
    pause: ['Escape', 'Escape'], start: ['Enter', 'Enter']
  };
  var held = {};
  function key(name, down) {
    if (!!held[name] === down) return;
    held[name] = down;
    var c = document.querySelector('canvas');
    if (!c) return;
    c.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup',
      {key: KEYS[name][1], code: KEYS[name][0], bubbles: true, cancelable: true}));
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function button(parent, cls, label, name) {
    var b = el('div', 'pu-btn ' + cls, label);
    var fingers = 0;
    b.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      try { b.setPointerCapture(e.pointerId); } catch (x) {}
      fingers++;
      b.classList.add('on');
      key(name, true);
    });
    function up(e) {
      e.preventDefault();
      fingers = Math.max(0, fingers - 1);
      if (fingers) return;
      b.classList.remove('on');
      key(name, false);
    }
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    parent.appendChild(b);
    return b;
  }

  // Крестовина: палец можно вести по ней, не отрывая, — направление
  // считается от центра; наискосок жмутся две клавиши сразу.
  function dpad(parent) {
    var pad = el('div', 'pu-dpad');
    ['up', 'down', 'left', 'right'].forEach(function (d) { pad.appendChild(el('i', 'pu-arrow ' + d)); });
    var finger = null;
    function aim(e) {
      var r = pad.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      var dead = 0.28;
      var want = {left: dx < -dead, right: dx > dead, up: dy < -dead, down: dy > dead};
      // наискосок — только если палец и правда наискосок, иначе «вправо»
      // ловило бы и чуть-чуть «вверх»
      if (Math.abs(dx) > 2.2 * Math.abs(dy)) { want.up = want.down = false; }
      if (Math.abs(dy) > 2.2 * Math.abs(dx)) { want.left = want.right = false; }
      Object.keys(want).forEach(function (d) {
        key(d, want[d]);
        pad.querySelector('.' + d).classList.toggle('on', want[d]);
      });
    }
    function release() {
      finger = null;
      ['up', 'down', 'left', 'right'].forEach(function (d) {
        key(d, false);
        pad.querySelector('.' + d).classList.remove('on');
      });
    }
    pad.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (finger !== null) return;
      finger = e.pointerId;
      try { pad.setPointerCapture(e.pointerId); } catch (x) {}
      aim(e);
    });
    pad.addEventListener('pointermove', function (e) { if (e.pointerId === finger) aim(e); });
    pad.addEventListener('pointerup', function (e) { if (e.pointerId === finger) release(); });
    pad.addEventListener('pointercancel', function (e) { if (e.pointerId === finger) release(); });
    parent.appendChild(pad);
  }

  function build() {
    var ui = el('div', 'pu-pad');
    dpad(ui);
    var acts = el('div', 'pu-acts');
    button(acts, 'slide', 'Подкат', 'slide');
    button(acts, 'shoot', 'Огонь', 'shoot');
    button(acts, 'grab', 'Взять', 'grab');
    button(acts, 'jump', 'Прыжок', 'jump');
    ui.appendChild(acts);
    var top = el('div', 'pu-top');
    button(top, 'small', 'Пауза', 'pause');
    button(top, 'small', 'Старт', 'start');
    ui.appendChild(top);
    document.body.appendChild(ui);
  }

  // Ушли из вкладки с зажатой кнопкой — отпустить, иначе рыба бежала бы сама.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') Object.keys(held).forEach(function (k) { key(k, false); });
  });

  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
