# Defending Todot — для галереи Pleasure Union

Башенная оборона в духе Kingdom Rush. Игра сделана **людьми** — сообществом
Crystal Bit; мы её не писали, только подготовили для Telegram и телефона.
Все наши изменения перечислены ниже.

Эта ветка (`todot`) — отдельная от остальных игр репозитория: игра весит
около 50 МБ, и в общей ветке `main` она тянулась бы вместе с каждой другой
игрой. Ссылка для галереи:

```
https://github.com/God-hub13/pu-games/tree/todot
```

## Откуда

- **Игра:** <https://github.com/crystal-bit/defending-todot> (продолжение
  <https://github.com/crystal-bit/hacktoberfest-2020>)
- **Сборка для браузера** взята из ветки `gh-pages` авторов, коммит
  `5ecea7bb6d156e35bc5c1c954f962108807a0350` («rebuild with Godot 3.2.3»):
  `index.js`, `index.wasm`, `index.pck`, `favicon.png` — без изменений.
- **Исходники этой сборки** — коммит
  [`275bf2961ad068c45258004c802d88183110cb26`](https://github.com/crystal-bit/defending-todot/tree/275bf2961ad068c45258004c802d88183110cb26)
  (после сборки у авторов менялся только `readme.md`). Код игры мы не
  меняли.
- **Движок:** Godot Engine 3.2.3 — MIT, <https://godotengine.org>.

## Авторы

Crystal Bit и участники (из титров игры): Sop-S, Vittorio Del Bianco,
veonazzo, Karbb, Gaarco, LiNuX4EvEr, Andrea1141, davtur19, mRuggi, m0rp30,
Iranon, masmart, gVirtu, vclayton, antocorr, FlavioFS, а также lucashilles
и всё сообщество Crystal Bit.

## Лицензии

- **Код:** GPL-3.0 — файл `LICENSE`.
- **Графика и звуки авторов:** CC BY 4.0 —
  <https://creativecommons.org/licenses/by/4.0/>, авторы — Crystal Bit и
  участники (выше).
- **Танки и башни:** наборы Kenney «Top-down Tanks Redux» и «Tower Defense
  (top-down)» — CC0, <https://www.kenney.nl>.
- **Шрифты:** Boogaloo — John Vargas Beltrán, SIL Open Font License 1.1;
  Luckiest Guy — Apache License 2.0.
- **Крик обезьяны:** befig, freesound.org, звук №458396.

## Что мы изменили

Только `index.html` (обёртка, которую Godot кладёт рядом с игрой) и два новых
файла рядом; сама игра — `index.pck`, `index.wasm`, `index.js` — та же.

- `index.html`:
  - язык и название страницы, описание и метки для галереи;
  - подключены `telegram-web-app.js`, `pu-tg.js` и `pu-landscape.js`;
  - **просьба повернуть телефон** (`#pu-rotate`): игра широкая (1600×900),
    стоя она была бы узкой полоской. Показывается только на сенсорном
    экране и только стоя;
  - холст игры ставится между кнопками Telegram и вырезом экрана
    (`adjustCanvasDimensions`, отступы — `window.PU_PAD`).
- `pu-landscape.js` (новый): на телефоне просит Telegram открыть игру на
  весь экран; повернули боком — закрепляет поворот; при выходе возвращает
  Telegram обычный вид. Подробности — в начале файла.
- `pu-tg.js` — общая склейка с Telegram для всех игр галереи (эталон —
  `tools/pu-tg.js` в ветке `main`).
- `cover.png` — собрана из картинок игры (`assets/menu_background.png`,
  `assets/menu_vignette.png`, `assets/menu_title_shadow.png`), `icon.png` —
  `assets/icon.png` игры, увеличенная до 256×256.
- Надписи в игре остались английскими: они внутри `index.pck`.

## Проверка перед пушем

Из ветки `main`:

```
git worktree add ../todot todot
python3 tools/check.py --fix ../todot
```
