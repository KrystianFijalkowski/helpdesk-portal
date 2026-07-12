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

---

## 2026-07-12 — Etap 1 (koniec): komentarze i SLA ✅

**Co zrobiłem:**
- Tabela `comments` powiązana z ticketami przez klucz obcy (ForeignKey) + relacja w SQLAlchemy
- Endpoint `POST /api/tickets/{id}/comments`; `GET /api/tickets/{id}` zwraca teraz ticket razem z komentarzami
- SLA: pola `sla_deadline` i `sla_breached` liczone w locie z priorytetu (critical: 1h, high: 4h, medium: 8h, low: 24h)
- Przetestowałem też API ręcznie w Swagger UI

**Problemy i rozwiązania:**
- Auto-reload uvicorna znowu się zawiesił (Windows + folder w OneDrive) → na razie po większych zmianach restartuję serwer ręcznie

**Czego się nauczyłem:**
- Klucz obcy (ForeignKey) wiąże wiersze dwóch tabel; `relationship` w SQLAlchemy pozwala pisać `ticket.comments` jak zwykłą listę
- `cascade="all, delete-orphan"` — usunięcie ticketu automatycznie kasuje jego komentarze
- `@computed_field` w Pydantic: pola wyliczane przy każdej odpowiedzi API, których nie ma w bazie — idealne na SLA
- SLA (Service Level Agreement) = umowny maksymalny czas reakcji/rozwiązania zgłoszenia — kluczowe pojęcie w pracy helpdesku
