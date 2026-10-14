"""Проверка репозитория игр перед пушем: python3 tools/check.py [--fix]

Каждая папка с index.html — отдельная игра галереи. Для каждой проверяем то,
без чего её нельзя выкладывать или она поведёт себя плохо в Telegram:

  • лицензия автора лежит рядом (LICENSE*, COPYING*) — без неё мы не имеем
    права раздавать чужую игру, а GPL/MPL прямо требуют её копию;
  • в README репозитория игра записана: откуда взята, какая лицензия, что мы
    поменяли — так требуют GPL и MPL («изменённые файлы должны быть отмечены»);
  • index.html говорит галерее о себе: описание, одиночная/онлайн, игроки;
  • подключены telegram-web-app.js и pu-tg.js — иначе «Назад» не вернёт в
    галерею, а свайп вниз закроет приложение посреди партии;
  • pu-tg.js в папке — точная копия эталона tools/pu-tg.js (--fix копирует);
  • есть cover.png и icon.png — иначе карточка в галерее пустая;
  • нет чужих счётчиков и рекламы — в галерее их быть не должно.

Выход с кодом 1, если хоть что-то не так.
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GLUE = ROOT / "tools" / "pu-tg.js"
TRACKERS = ("googletagmanager", "google-analytics", "googlesyndication",
            "adsbygoogle", "gtag(", "hextris.io/a.js", "fonts.googleapis")


def games() -> list[Path]:
    return sorted(p.parent for p in ROOT.glob("*/index.html")
                  if p.parent.name not in ("tools",))


def check(game: Path, fix: bool) -> list[str]:
    bad = []
    if not any(game.glob("LICENSE*")) and not any(game.glob("COPYING*")):
        bad.append("нет файла лицензии автора")
    readme = (ROOT / "README.md").read_text(encoding="utf-8") if (ROOT / "README.md").exists() else ""
    if f"`{game.name}/`" not in readme:
        bad.append("не записана в README.md (источник, лицензия, что изменено)")
    html = (game / "index.html").read_text(encoding="utf-8", errors="replace")
    head = html[:html.lower().find("</head>")] if "</head>" in html.lower() else html
    for name in ("description", "pu:online", "pu:players"):
        if not re.search(rf'<meta\s+name="{re.escape(name)}"\s+content="[^"]+"', head):
            bad.append(f'нет <meta name="{name}"> в <head>')
    if "telegram.org/js/telegram-web-app.js" not in head:
        bad.append("не подключён telegram-web-app.js")
    if 'src="pu-tg.js"' not in head:
        bad.append("не подключён pu-tg.js")
    glue = game / "pu-tg.js"
    if not glue.exists() or glue.read_bytes() != GLUE.read_bytes():
        if fix:
            shutil.copyfile(GLUE, glue)
        else:
            bad.append("pu-tg.js отличается от tools/pu-tg.js (запусти с --fix)")
    for art in ("cover.png", "icon.png"):
        if not (game / art).exists():
            bad.append(f"нет {art}")
    for path in list(game.rglob("*.html")) + list(game.rglob("*.js")):
        if path.name.endswith(".min.js"):
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for t in TRACKERS:
            if t in text:
                bad.append(f"{path.relative_to(ROOT)}: чужой счётчик/реклама «{t}»")
    return bad


def main() -> int:
    fix = "--fix" in sys.argv
    failed = False
    for game in games():
        bad = check(game, fix)
        print(("❌ " if bad else "✅ ") + game.name)
        for b in bad:
            print("    " + b)
        failed |= bool(bad)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
