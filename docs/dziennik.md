# Dziennik projektu

Dokumentuję tu na bieżąco postępy prac, decyzje techniczne i rzeczy, których się nauczyłem.

---

## 2026-07-12 — Etap 0: start projektu

**Co zrobiłem:**
- Zainstalowałem i skonfigurowałem Gita (`git config --global user.name / user.email`)
- Założyłem repozytorium (`git init`) i strukturę projektu
- Napisałem README z planem projektu i `.gitignore`

**Decyzje:**
- Stack: Python (FastAPI) + React, baza SQLite na start (później PostgreSQL)
- Monitoring będzie podpięty pod prawdziwy VPS w chmurze
- Projekt budowany etapami — plan w README

**Czego się nauczyłem:**
- `git init` — tworzy nowe repozytorium (ukryty folder `.git` z całą historią zmian)
- `.gitignore` — mówi Gitowi, które pliki pomijać (np. `.env` z hasłami, `node_modules`)
- Commit = zapisany "punkt kontrolny" projektu z opisem i autorem
