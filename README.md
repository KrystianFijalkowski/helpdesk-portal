# IT Helpdesk Portal

Wewnętrzny portal działu IT — system obsługi zgłoszeń, ewidencja zasobów IT i monitoring infrastruktury w czasie rzeczywistym (podpięty pod prawdziwy serwer VPS).

> Projekt portfolio budowany krok po kroku i w całości dokumentowany w tym repozytorium.

## Funkcje (planowane)

- 🎫 **System ticketów** — zgłoszenia pracowników, statusy, priorytety, komentarze, licznik SLA
- 💻 **Zarządzanie zasobami IT (CMDB)** — ewidencja sprzętu i licencji, przypisania do pracowników, alerty gwarancyjne
- 📡 **Monitoring infrastruktury** — metryki na żywo (CPU, RAM, dysk, uptime) z prawdziwego serwera VPS
- 📊 **Raporty** — statystyki zgłoszeń, średni czas rozwiązania, najczęstsze kategorie
- 📚 **Baza wiedzy** — artykuły "jak samodzielnie rozwiązać typowe problemy"

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Backend | Python + FastAPI |
| Frontend | React |
| Baza danych | SQLite → PostgreSQL |
| Serwer | Linux (VPS) |

## Status projektu

- [x] Etap 0 — konfiguracja Gita i repozytorium
- [x] Etap 1 — backend: system ticketów (FastAPI)
- [ ] Etap 2 — frontend: React
- [ ] Etap 3 — moduł zasobów IT (CMDB)
- [ ] Etap 4 — konfiguracja serwera VPS (Linux, SSH)
- [ ] Etap 5 — monitoring na żywo
- [ ] Etap 6 — raporty, baza wiedzy, szlif

## Dokumentacja

Postępy prac i decyzje techniczne opisuję w [docs/dziennik.md](docs/dziennik.md).

## Autor

Krystian Fijałkowski
