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

---

## 2026-07-12 — Etap 1 (start): pierwszy endpoint FastAPI

**Co zrobiłem:**
- Utworzyłem folder `backend/` z wirtualnym środowiskiem Pythona (`python -m venv .venv`)
- Zainstalowałem FastAPI i uvicorn, zapisałem zależności w `requirements.txt`
- Napisałem `main.py` z dwoma endpointami: `/` i `/api/health`
- Uruchomiłem serwer (`uvicorn main:app --reload`) i przetestowałem API w Swagger UI (`/docs`)

**Czego się nauczyłem:**
- Wirtualne środowisko (venv) izoluje biblioteki projektu od reszty systemu
- Endpoint = adres URL, pod którym API odpowiada na żądania (np. GET `/api/health`)
- FastAPI automatycznie generuje interaktywną dokumentację API pod `/docs` (Swagger UI)
- `requirements.txt` = lista bibliotek projektu; każdy odtworzy środowisko przez `pip install -r requirements.txt`
