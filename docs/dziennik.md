# Dziennik projektu

Notatki z kolejnych etapów budowy.

## start

Konfiguracja gita, pierwsze repo w życiu. Ogarnąłem podstawowy cykl:
add -> commit -> push. README z planem projektu i .gitignore (nie wrzucać
do repo baz danych, node_modules ani plików z hasłami).

## backend systemu ticketów

FastAPI + SQLite. Podzieliłem kod na pliki: database, models (tabele),
schemas (walidacja danych wejściowych) i main z endpointami. Tickety mają
pełny cykl życia: nowe -> w trakcie -> rozwiązane -> zamknięte, do tego
komentarze i SLA liczone z priorytetu (krytyczny 1h, wysoki 4h, średni 8h,
niski 24h).

Fajna rzecz: Swagger pod /docs generuje się sam i można klikać po API bez
frontendu.

## frontend

React (Vite) + Tailwind. Lista zgłoszeń z filtrami i badgami SLA, formularz
nowego zgłoszenia, szczegóły z komentarzami. Vite proxy przekierowuje /api
na backend, więc nie trzeba było bawić się w CORS.

Nowe dla mnie: useState/useEffect i myślenie komponentami. Tailwind na
początku wygląda jak spam klas w HTML, ale po dniu ma to sens.

## zasoby IT (CMDB)

Ewidencja sprzętu i licencji: kto ma co przypisane, numery seryjne, statusy
(w użyciu / magazyn / serwis / wycofany) i gwarancje z alertami - czerwone
"wygasła", pomarańczowe jak zostało mniej niż 30 dni. Tym razem tabela
zamiast kart, do inwentarza pasuje lepiej.

Przy okazji porządek w kodzie: widoki wylądowały w pages/, wspólne
komponenty w components/.

## VPS

Największy dzień. Konto na Oracle Cloud (darmowy tier), maszyna z Ubuntu
24.04 we Frankfurcie, klucze SSH zamiast haseł. Szczegóły w osobnym
pliku: vps-setup.md.

Po zalogowaniu zabezpieczenie serwera: aktualizacje, fail2ban, blokada
logowania na roota, firewall przepuszcza tylko porty 22 i 8000. Restart
i sprawdzenie, że konfiguracja wstaje razem z systemem.

## monitoring

Mój ulubiony moduł. Na serwerze siedzi mały agent (FastAPI + psutil) jako
usługa systemd i wystawia /metrics - CPU, RAM, dysk, uptime. Dostęp tylko
z kluczem API w nagłówku. Backend portalu odpytuje go co 30 sekund i
zapisuje historię, frontend rysuje wykres i pokazuje status online/offline.

Klucz API trzymam poza repo (w .env lokalnie, na serwerze w konfiguracji
systemd). W repo jest tylko .env.example.

## raporty, baza wiedzy, koniec

Raporty: ile zgłoszeń, średni czas rozwiązania, naruszenia SLA, rozkłady
po kategoriach i wykres z ostatnich 7 dni. Baza wiedzy: artykuły "jak
sobie poradzić samemu" z wyszukiwarką.

Do tego skrypt seed_demo.py z danymi testowymi i zrzuty ekranu do README.
Wszystkie moduły działają. Koniec podstawowej wersji.
