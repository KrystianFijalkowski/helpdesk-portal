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

---

## 2026-07-12 — Etap 2: frontend React + Tailwind ✅

**Co zrobiłem:**
- Zbudowałem frontend w React (Vite) + Tailwind CSS, wg wytycznych skilla ui-styling (tokeny designu, spójna paleta, mobile-first)
- Wygląd: czcionka Plus Jakarta Sans (miękka, zaokrąglona), granatowy sidebar, karty z akcentem koloru wg priorytetu
- Widoki: lista zgłoszeń (statystyki, filtry po statusie, badge SLA/priorytet/status), formularz nowego zgłoszenia, szczegóły z komentarzami i zmianą statusu
- Proxy Vite: żądania `/api/*` z frontu (port 5174) lecą do backendu FastAPI (port 8000)

**Czego się nauczyłem:**
- Komponent React = funkcja zwracająca HTML (JSX); propsy = argumenty komponentu
- `useState` trzyma stan (np. listę ticketów), `useEffect` odpala kod przy starcie/zmianie — tu: pobieranie danych z API
- Tailwind CSS: stylowanie klasami narzędziowymi (`rounded-2xl`, `shadow-sm`), własne tokeny w `@theme`
- Proxy dev-serwera pozwala frontendowi i backendowi udawać jedną aplikację (bez CORS)

---

## 2026-07-12 — Etap 3: zasoby IT (CMDB) ✅

**Co zrobiłem:**
- Backend: tabela `assets` (nazwa, typ, nr seryjny, przypisanie do pracownika, status, data zakupu, gwarancja, notatki) + endpointy CRUD z filtrami
- Pole wyliczane `warranty_days_left` — ile dni gwarancji zostało (ujemne = wygasła)
- Frontend: nowa zakładka "Zasoby IT" — sidebar stał się prawdziwą nawigacją (stan `section` w App)
- Ewidencja jako tabela: kolumny zasób/nr seryjny/przypisanie/gwarancja/status, alerty gwarancyjne (czerwone "wygasła", bursztynowe "≤30 dni")
- Szczegóły zasobu: zmiana statusu (magazyn → w użyciu → serwis → wycofany), edycja przypisania i notatek
- Refaktoryzacja: widoki przeniesione do `pages/`, wspólne komponenty (StatCard, FilterChip) do `components/ui.jsx`

**Problemy i rozwiązania:**
- Auto-reload uvicorna dalej zawodzi na Windows+OneDrive → zabiłem proces na porcie 8000 (`Get-NetTCPConnection -LocalPort 8000` + `Stop-Process`) i wystartowałem serwer na nowo — przydatna sztuczka helpdeskowa

**Czego się nauczyłem:**
- CMDB (Configuration Management Database) = ewidencja zasobów IT z relacjami — kluczowe narzędzie działu IT
- Refaktoryzacja bez zmiany zachowania: podział rosnącego kodu na `pages/` i współdzielone `components/`
- Tabela HTML z klikalnymi wierszami jako wzorzec dla danych ewidencyjnych (karty lepsze dla ticketów, tabela dla inwentarza)

---

## 2026-07-12 — Etap 4: serwer VPS w Oracle Cloud ✅

**Co zrobiłem:**
- Wygenerowałem klucze SSH (ed25519) i założyłem konto Oracle Cloud Free Tier
- Utworzyłem instancję `helpdesk-vps`: Ubuntu 24.04, VM.Standard.E2.1.Micro (Always Free), Frankfurt, nowy VCN z publicznym subnetem
- Zdiagnozowałem i naprawiłem brak publicznego IP (quick action "Connect public subnet to internet" + ephemeral IP na VNIC)
- Zalogowałem się kluczem SSH i zabezpieczyłem serwer: aktualizacja, fail2ban, PermitRootLogin no, firewall (tylko 22 i 8000)
- Restart i weryfikacja, że cała konfiguracja przetrwała reboot

Szczegóły krok po kroku: [vps-setup.md](vps-setup.md)

**Czego się nauczyłem:**
- SSH z kluczami: prywatny u mnie, publiczny na serwerze; hasła w ogóle wyłączone
- Sieci w chmurze: VCN / subnet / Internet Gateway / VNIC / ephemeral IP
- Firewall działa na dwóch warstwach: w systemie (iptables) i w chmurze (Security List/NSG) — obie muszą przepuścić ruch
- fail2ban czyta logi i automatycznie banuje IP atakujących
- Po aktualizacji jądra system prosi o reboot (`/var/run/reboot-required`) — a konfiguracja musi przetrwać restart (netfilter-persistent)
