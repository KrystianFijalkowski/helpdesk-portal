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

---

## 2026-07-12 — Etap 1 (cd.): CRUD ticketów + baza SQLite

**Co zrobiłem:**
- Dodałem SQLAlchemy i podzieliłem backend na moduły: `database.py` (połączenie z bazą), `models.py` (tabela `tickets`), `schemas.py` (walidacja Pydantic), `main.py` (endpointy)
- Endpointy: `POST /api/tickets` (nowe zgłoszenie), `GET /api/tickets` (lista + filtr po statusie), `GET /api/tickets/{id}` (szczegóły, 404 gdy brak), `PATCH /api/tickets/{id}` (zmiana statusu/priorytetu)
- Przetestowałem cały cykl życia zgłoszenia: utworzenie → podjęcie przez technika (`in_progress`) → filtrowanie listy

**Problemy i rozwiązania:**
- Auto-reload uvicorna zawiesił się po instalacji SQLAlchemy (obserwował cały `.venv`) → dodałem `--reload-dir`, żeby patrzył tylko na kod projektu

**Czego się nauczyłem:**
- Model SQLAlchemy = definicja tabeli w bazie; schemat Pydantic = kontrakt API (co wolno przysłać/co zwracamy) — to celowo dwie osobne rzeczy
- `Literal["new", "in_progress", ...]` w Pydantic odrzuca nieprawidłowe wartości kodem 422, zanim dotkną bazy
- Kody HTTP: 201 (utworzono), 404 (nie znaleziono), 422 (błędne dane)
- PATCH z `exclude_unset=True` aktualizuje tylko przysłane pola
